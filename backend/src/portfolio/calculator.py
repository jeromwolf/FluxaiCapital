from typing import List, Dict, Tuple
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.portfolio import Portfolio, Position, Transaction
from src.services.market_data import get_historical_data, get_current_price

class PortfolioCalculator:
    """포트폴리오 수익률 및 성과 계산"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def calculate_portfolio_returns(
        self, 
        portfolio_id: str,
        period: str = "1M"
    ) -> Dict:
        """포트폴리오 수익률 계산"""
        # 포트폴리오 조회
        result = await self.db.execute(
            select(Portfolio).where(Portfolio.id == portfolio_id)
        )
        portfolio = result.scalar_one_or_none()
        
        if not portfolio:
            raise ValueError("Portfolio not found")
        
        # 포지션 조회
        positions_result = await self.db.execute(
            select(Position).where(Position.portfolio_id == portfolio_id)
        )
        positions = positions_result.scalars().all()
        
        # 현재 포트폴리오 가치 계산
        total_market_value = portfolio.cash_balance
        position_values = {}
        
        for position in positions:
            current_price = await get_current_price(position.symbol)
            market_value = position.quantity * current_price
            total_market_value += market_value
            position_values[position.symbol] = {
                "quantity": position.quantity,
                "market_value": market_value,
                "cost_basis": position.quantity * position.average_price,
                "unrealized_pnl": market_value - (position.quantity * position.average_price),
                "weight": 0  # 나중에 계산
            }
        
        # 가중치 계산
        for symbol in position_values:
            position_values[symbol]["weight"] = position_values[symbol]["market_value"] / total_market_value
        
        # 과거 수익률 계산
        returns_data = await self._calculate_historical_returns(portfolio_id, period)
        
        return {
            "portfolio_id": portfolio_id,
            "total_value": total_market_value,
            "cash_balance": portfolio.cash_balance,
            "positions": position_values,
            "returns": returns_data,
            "metrics": await self._calculate_performance_metrics(returns_data)
        }
    
    async def _calculate_historical_returns(
        self, 
        portfolio_id: str, 
        period: str
    ) -> Dict:
        """과거 수익률 계산"""
        # 기간 설정
        period_days = {
            "1D": 1, "1W": 7, "1M": 30, "3M": 90, 
            "6M": 180, "1Y": 365, "YTD": None
        }
        
        if period == "YTD":
            start_date = datetime(datetime.now().year, 1, 1)
        else:
            days = period_days.get(period, 30)
            start_date = datetime.now() - timedelta(days=days)
        
        # 거래 내역 조회
        transactions_result = await self.db.execute(
            select(Transaction)
            .where(
                Transaction.portfolio_id == portfolio_id,
                Transaction.executed_at >= start_date
            )
            .order_by(Transaction.executed_at)
        )
        transactions = transactions_result.scalars().all()
        
        # 일별 포트폴리오 가치 계산
        daily_values = await self._calculate_daily_values(
            portfolio_id, start_date, transactions
        )
        
        if len(daily_values) < 2:
            return {
                "period": period,
                "total_return": 0,
                "total_return_percent": 0,
                "daily_returns": []
            }
        
        # 수익률 계산
        initial_value = daily_values[0]["value"]
        final_value = daily_values[-1]["value"]
        total_return = final_value - initial_value
        total_return_percent = (total_return / initial_value) * 100
        
        # 일별 수익률
        daily_returns = []
        for i in range(1, len(daily_values)):
            prev_value = daily_values[i-1]["value"]
            curr_value = daily_values[i]["value"]
            daily_return = (curr_value - prev_value) / prev_value
            daily_returns.append({
                "date": daily_values[i]["date"],
                "return": daily_return,
                "value": curr_value
            })
        
        return {
            "period": period,
            "start_date": start_date,
            "total_return": total_return,
            "total_return_percent": total_return_percent,
            "daily_returns": daily_returns
        }
    
    async def _calculate_daily_values(
        self, 
        portfolio_id: str,
        start_date: datetime,
        transactions: List[Transaction]
    ) -> List[Dict]:
        """일별 포트폴리오 가치 계산"""
        daily_values = []
        current_date = start_date.date()
        end_date = datetime.now().date()
        
        # 초기 포지션 상태 구성
        positions_state = await self._get_initial_positions_state(
            portfolio_id, start_date
        )
        
        while current_date <= end_date:
            # 해당 날짜의 거래 적용
            day_transactions = [
                t for t in transactions 
                if t.executed_at.date() == current_date
            ]
            
            for transaction in day_transactions:
                self._apply_transaction(positions_state, transaction)
            
            # 포트폴리오 가치 계산
            total_value = positions_state["cash"]
            for symbol, pos in positions_state["positions"].items():
                if pos["quantity"] > 0:
                    # 해당 날짜의 종가 조회
                    price = await self._get_price_on_date(symbol, current_date)
                    total_value += pos["quantity"] * price
            
            daily_values.append({
                "date": current_date,
                "value": total_value
            })
            
            current_date += timedelta(days=1)
        
        return daily_values
    
    async def _get_initial_positions_state(
        self, 
        portfolio_id: str,
        start_date: datetime
    ) -> Dict:
        """시작 날짜 기준 초기 포지션 상태"""
        # 시작 날짜 이전의 모든 거래 조회
        transactions_result = await self.db.execute(
            select(Transaction)
            .where(
                Transaction.portfolio_id == portfolio_id,
                Transaction.executed_at < start_date
            )
            .order_by(Transaction.executed_at)
        )
        transactions = transactions_result.scalars().all()
        
        # 초기 상태 구성
        positions_state = {
            "cash": 1000000000,  # TODO: 초기 자본금 조회
            "positions": {}
        }
        
        for transaction in transactions:
            self._apply_transaction(positions_state, transaction)
        
        return positions_state
    
    def _apply_transaction(self, state: Dict, transaction: Transaction):
        """거래를 상태에 적용"""
        symbol = transaction.symbol
        
        if symbol not in state["positions"]:
            state["positions"][symbol] = {"quantity": 0, "cost": 0}
        
        if transaction.transaction_type == "BUY":
            state["positions"][symbol]["quantity"] += transaction.quantity
            state["positions"][symbol]["cost"] += transaction.quantity * transaction.price
            state["cash"] -= transaction.quantity * transaction.price + transaction.commission
        else:  # SELL
            state["positions"][symbol]["quantity"] -= transaction.quantity
            state["cash"] += transaction.quantity * transaction.price - transaction.commission
    
    async def _get_price_on_date(self, symbol: str, date: date) -> float:
        """특정 날짜의 종가 조회"""
        # TODO: 과거 가격 데이터 캐싱 구현
        hist_data = await get_historical_data(symbol, period="1y")
        
        # 날짜에 해당하는 종가 찾기
        date_str = date.strftime("%Y-%m-%d")
        if date_str in hist_data.index:
            return hist_data.loc[date_str, "Close"]
        
        # 해당 날짜 데이터가 없으면 가장 가까운 이전 날짜 사용
        hist_data = hist_data[hist_data.index <= date_str]
        if not hist_data.empty:
            return hist_data.iloc[-1]["Close"]
        
        return 0
    
    async def _calculate_performance_metrics(self, returns_data: Dict) -> Dict:
        """성과 지표 계산"""
        daily_returns = [r["return"] for r in returns_data.get("daily_returns", [])]
        
        if not daily_returns:
            return {
                "sharpe_ratio": 0,
                "volatility": 0,
                "max_drawdown": 0,
                "win_rate": 0
            }
        
        returns_array = np.array(daily_returns)
        
        # 연간화 변동성 (일별 수익률 * sqrt(252))
        volatility = np.std(returns_array) * np.sqrt(252)
        
        # 샤프 비율 (무위험 수익률 2% 가정)
        risk_free_rate = 0.02
        annualized_return = (1 + np.mean(returns_array)) ** 252 - 1
        sharpe_ratio = (annualized_return - risk_free_rate) / volatility if volatility > 0 else 0
        
        # 최대 낙폭
        cumulative_returns = (1 + returns_array).cumprod()
        running_max = np.maximum.accumulate(cumulative_returns)
        drawdown = (cumulative_returns - running_max) / running_max
        max_drawdown = np.min(drawdown) * 100
        
        # 승률
        win_rate = len([r for r in returns_array if r > 0]) / len(returns_array) * 100
        
        return {
            "sharpe_ratio": round(sharpe_ratio, 2),
            "volatility": round(volatility * 100, 2),  # 퍼센트로 변환
            "max_drawdown": round(max_drawdown, 2),
            "win_rate": round(win_rate, 2)
        }