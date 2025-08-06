import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from scipy import stats
from datetime import datetime, timedelta
import asyncio

from src.services.market_data import get_historical_data

class VaRCalculator:
    """Value at Risk (VaR) 및 Conditional VaR (CVaR) 계산"""
    
    def __init__(self):
        self.confidence_levels = [0.95, 0.99]  # 95%, 99% 신뢰수준
        
    async def calculate_var_cvar(
        self,
        positions: Dict[str, float],  # {symbol: market_value}
        confidence_level: float = 0.95,
        time_horizon: int = 1,  # 일 단위
        lookback_days: int = 252,  # 1년
        method: str = "historical"  # historical, parametric, monte_carlo
    ) -> Dict:
        """VaR 및 CVaR 계산"""
        
        if method == "historical":
            return await self._historical_var_cvar(
                positions, confidence_level, time_horizon, lookback_days
            )
        elif method == "parametric":
            return await self._parametric_var_cvar(
                positions, confidence_level, time_horizon, lookback_days
            )
        elif method == "monte_carlo":
            return await self._monte_carlo_var_cvar(
                positions, confidence_level, time_horizon, lookback_days
            )
        else:
            raise ValueError(f"Unknown method: {method}")
    
    async def _historical_var_cvar(
        self,
        positions: Dict[str, float],
        confidence_level: float,
        time_horizon: int,
        lookback_days: int
    ) -> Dict:
        """역사적 시뮬레이션 방법"""
        
        # 포트폴리오 가치
        portfolio_value = sum(positions.values())
        
        # 각 종목의 과거 수익률 데이터 수집
        returns_data = {}
        for symbol in positions.keys():
            hist_data = await get_historical_data(
                symbol, 
                period=f"{lookback_days}d"
            )
            if not hist_data.empty:
                returns = hist_data['Close'].pct_change().dropna()
                returns_data[symbol] = returns
        
        # 포트폴리오 수익률 계산
        portfolio_returns = pd.Series(dtype=float)
        
        for date in returns_data[list(returns_data.keys())[0]].index:
            daily_return = 0
            for symbol, position_value in positions.items():
                if symbol in returns_data and date in returns_data[symbol].index:
                    weight = position_value / portfolio_value
                    daily_return += weight * returns_data[symbol][date]
            portfolio_returns[date] = daily_return
        
        # 시간 지평 조정
        portfolio_returns = portfolio_returns * np.sqrt(time_horizon)
        
        # VaR 계산 (역사적 시뮬레이션)
        var_percentile = (1 - confidence_level) * 100
        var_return = np.percentile(portfolio_returns, var_percentile)
        var_value = -var_return * portfolio_value
        
        # CVaR 계산 (VaR를 초과하는 손실의 평균)
        losses_beyond_var = portfolio_returns[portfolio_returns <= var_return]
        cvar_return = losses_beyond_var.mean() if len(losses_beyond_var) > 0 else var_return
        cvar_value = -cvar_return * portfolio_value
        
        return {
            "method": "historical",
            "confidence_level": confidence_level,
            "time_horizon": time_horizon,
            "portfolio_value": portfolio_value,
            "var": {
                "value": var_value,
                "percentage": var_return * 100
            },
            "cvar": {
                "value": cvar_value,
                "percentage": cvar_return * 100
            },
            "data_points": len(portfolio_returns),
            "calculation_date": datetime.now()
        }
    
    async def _parametric_var_cvar(
        self,
        positions: Dict[str, float],
        confidence_level: float,
        time_horizon: int,
        lookback_days: int
    ) -> Dict:
        """모수적 방법 (분산-공분산)"""
        
        portfolio_value = sum(positions.values())
        symbols = list(positions.keys())
        weights = np.array([positions[s] / portfolio_value for s in symbols])
        
        # 수익률 데이터 수집
        returns_matrix = []
        for symbol in symbols:
            hist_data = await get_historical_data(
                symbol,
                period=f"{lookback_days}d"
            )
            if not hist_data.empty:
                returns = hist_data['Close'].pct_change().dropna()
                returns_matrix.append(returns)
        
        # 수익률 행렬을 DataFrame으로 변환
        returns_df = pd.DataFrame(returns_matrix).T
        returns_df.columns = symbols
        
        # 평균 수익률과 공분산 행렬 계산
        mean_returns = returns_df.mean()
        cov_matrix = returns_df.cov()
        
        # 포트폴리오 수익률의 평균과 표준편차
        portfolio_mean = np.dot(weights, mean_returns)
        portfolio_std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        
        # 시간 지평 조정
        portfolio_mean = portfolio_mean * time_horizon
        portfolio_std = portfolio_std * np.sqrt(time_horizon)
        
        # Z-score (정규분포 가정)
        z_score = stats.norm.ppf(1 - confidence_level)
        
        # VaR 계산
        var_return = portfolio_mean + z_score * portfolio_std
        var_value = -var_return * portfolio_value
        
        # CVaR 계산 (정규분포 가정 하에서의 조건부 기댓값)
        phi = stats.norm.pdf(z_score)
        cvar_return = portfolio_mean - portfolio_std * phi / (1 - confidence_level)
        cvar_value = -cvar_return * portfolio_value
        
        return {
            "method": "parametric",
            "confidence_level": confidence_level,
            "time_horizon": time_horizon,
            "portfolio_value": portfolio_value,
            "var": {
                "value": var_value,
                "percentage": var_return * 100
            },
            "cvar": {
                "value": cvar_value,
                "percentage": cvar_return * 100
            },
            "portfolio_stats": {
                "mean_return": portfolio_mean * 100,
                "volatility": portfolio_std * 100
            },
            "calculation_date": datetime.now()
        }
    
    async def _monte_carlo_var_cvar(
        self,
        positions: Dict[str, float],
        confidence_level: float,
        time_horizon: int,
        lookback_days: int,
        num_simulations: int = 10000
    ) -> Dict:
        """몬테카를로 시뮬레이션"""
        
        portfolio_value = sum(positions.values())
        symbols = list(positions.keys())
        weights = np.array([positions[s] / portfolio_value for s in symbols])
        
        # 수익률 데이터 수집
        returns_matrix = []
        for symbol in symbols:
            hist_data = await get_historical_data(
                symbol,
                period=f"{lookback_days}d"
            )
            if not hist_data.empty:
                returns = hist_data['Close'].pct_change().dropna()
                returns_matrix.append(returns)
        
        returns_df = pd.DataFrame(returns_matrix).T
        returns_df.columns = symbols
        
        # 평균과 공분산 계산
        mean_returns = returns_df.mean().values
        cov_matrix = returns_df.cov().values
        
        # 몬테카를로 시뮬레이션
        simulated_returns = []
        
        for _ in range(num_simulations):
            # 다변량 정규분포에서 랜덤 수익률 생성
            random_returns = np.random.multivariate_normal(
                mean_returns * time_horizon,
                cov_matrix * time_horizon,
                size=1
            )[0]
            
            # 포트폴리오 수익률 계산
            portfolio_return = np.dot(weights, random_returns)
            simulated_returns.append(portfolio_return)
        
        simulated_returns = np.array(simulated_returns)
        
        # VaR 계산
        var_percentile = (1 - confidence_level) * 100
        var_return = np.percentile(simulated_returns, var_percentile)
        var_value = -var_return * portfolio_value
        
        # CVaR 계산
        losses_beyond_var = simulated_returns[simulated_returns <= var_return]
        cvar_return = losses_beyond_var.mean()
        cvar_value = -cvar_return * portfolio_value
        
        return {
            "method": "monte_carlo",
            "confidence_level": confidence_level,
            "time_horizon": time_horizon,
            "portfolio_value": portfolio_value,
            "var": {
                "value": var_value,
                "percentage": var_return * 100
            },
            "cvar": {
                "value": cvar_value,
                "percentage": cvar_return * 100
            },
            "simulations": num_simulations,
            "calculation_date": datetime.now()
        }
    
    async def calculate_marginal_var(
        self,
        positions: Dict[str, float],
        confidence_level: float = 0.95
    ) -> Dict[str, float]:
        """각 포지션의 한계 VaR 계산"""
        
        # 전체 포트폴리오 VaR
        base_var = await self.calculate_var_cvar(
            positions, confidence_level
        )
        
        marginal_vars = {}
        
        for symbol in positions:
            # 해당 포지션을 1% 증가시킨 경우의 VaR
            adjusted_positions = positions.copy()
            adjusted_positions[symbol] *= 1.01
            
            new_var = await self.calculate_var_cvar(
                adjusted_positions, confidence_level
            )
            
            # 한계 VaR = VaR 변화량 / 포지션 변화량
            marginal_var = (new_var["var"]["value"] - base_var["var"]["value"]) / \
                          (positions[symbol] * 0.01)
            
            marginal_vars[symbol] = marginal_var
        
        return marginal_vars
    
    async def calculate_component_var(
        self,
        positions: Dict[str, float],
        confidence_level: float = 0.95
    ) -> Dict[str, Dict]:
        """각 포지션의 구성 VaR 계산"""
        
        marginal_vars = await self.calculate_marginal_var(
            positions, confidence_level
        )
        
        component_vars = {}
        total_var = 0
        
        for symbol, position_value in positions.items():
            component_var = marginal_vars[symbol] * position_value
            component_vars[symbol] = {
                "value": component_var,
                "percentage": 0  # 나중에 계산
            }
            total_var += component_var
        
        # 비율 계산
        for symbol in component_vars:
            component_vars[symbol]["percentage"] = \
                (component_vars[symbol]["value"] / total_var) * 100
        
        return component_vars