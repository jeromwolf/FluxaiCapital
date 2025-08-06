from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, List, Optional
from datetime import datetime

from src.models.portfolio import Portfolio, Position
from src.core.database import get_db
from src.risk.var_calculator import VaRCalculator
from src.risk.stress_test import StressTestEngine
from src.services.market_data import get_current_price

router = APIRouter()

# 리스크 계산 엔진 인스턴스
var_calculator = VaRCalculator()
stress_test_engine = StressTestEngine()

@router.get("/{portfolio_id}/var")
async def calculate_portfolio_var(
    portfolio_id: str,
    confidence_level: float = Query(0.95, ge=0.9, le=0.99),
    time_horizon: int = Query(1, ge=1, le=30),
    method: str = Query("historical", regex="^(historical|parametric|monte_carlo)$"),
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 VaR/CVaR 계산"""
    
    # 포트폴리오 조회
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = portfolio_result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # 포지션 조회
    positions_result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    positions = positions_result.scalars().all()
    
    # 포지션별 시장가치 계산
    position_values = {}
    for position in positions:
        current_price = await get_current_price(position.symbol)
        market_value = position.quantity * current_price
        position_values[position.symbol] = market_value
    
    # VaR/CVaR 계산
    var_result = await var_calculator.calculate_var_cvar(
        position_values,
        confidence_level=confidence_level,
        time_horizon=time_horizon,
        method=method
    )
    
    return var_result

@router.get("/{portfolio_id}/stress-test")
async def run_portfolio_stress_test(
    portfolio_id: str,
    scenarios: Optional[List[str]] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 스트레스 테스트"""
    
    # 포트폴리오 조회
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = portfolio_result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # 포지션 조회
    positions_result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    positions = positions_result.scalars().all()
    
    # 포지션 데이터 준비
    portfolio_positions = {}
    for position in positions:
        current_price = await get_current_price(position.symbol)
        market_value = position.quantity * current_price
        
        portfolio_positions[position.symbol] = {
            "value": market_value,
            "quantity": position.quantity,
            "sector": ""  # TODO: 섹터 정보 추가
        }
    
    # 스트레스 테스트 실행
    stress_results = await stress_test_engine.run_stress_test(
        portfolio_positions,
        scenarios=scenarios
    )
    
    return stress_results

@router.get("/{portfolio_id}/risk-metrics")
async def get_portfolio_risk_metrics(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 종합 리스크 지표"""
    
    # 포트폴리오 조회
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = portfolio_result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # 포지션 조회
    positions_result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    positions = positions_result.scalars().all()
    
    # 포지션별 데이터 준비
    position_values = {}
    total_value = portfolio.cash_balance
    
    for position in positions:
        current_price = await get_current_price(position.symbol)
        market_value = position.quantity * current_price
        position_values[position.symbol] = market_value
        total_value += market_value
    
    # 다양한 신뢰수준에서 VaR 계산
    var_results = {}
    for confidence in [0.95, 0.99]:
        var_result = await var_calculator.calculate_var_cvar(
            position_values,
            confidence_level=confidence
        )
        var_results[f"{int(confidence*100)}%"] = {
            "var": var_result["var"],
            "cvar": var_result["cvar"]
        }
    
    # 한계 VaR 계산
    marginal_vars = await var_calculator.calculate_marginal_var(
        position_values,
        confidence_level=0.95
    )
    
    # 구성 VaR 계산
    component_vars = await var_calculator.calculate_component_var(
        position_values,
        confidence_level=0.95
    )
    
    # 집중도 리스크 계산
    concentration_risk = _calculate_concentration_risk(position_values, total_value)
    
    return {
        "portfolio_id": portfolio_id,
        "total_value": total_value,
        "cash_balance": portfolio.cash_balance,
        "invested_value": total_value - portfolio.cash_balance,
        "var_metrics": var_results,
        "marginal_var": marginal_vars,
        "component_var": component_vars,
        "concentration_risk": concentration_risk,
        "calculation_date": datetime.now()
    }

@router.get("/{portfolio_id}/sensitivity")
async def analyze_portfolio_sensitivity(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 민감도 분석"""
    
    # 포트폴리오 조회
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = portfolio_result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # 포지션 조회
    positions_result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    positions = positions_result.scalars().all()
    
    # 포지션 데이터 준비
    portfolio_positions = {}
    for position in positions:
        current_price = await get_current_price(position.symbol)
        market_value = position.quantity * current_price
        
        portfolio_positions[position.symbol] = {
            "value": market_value,
            "quantity": position.quantity,
            "sector": ""
        }
    
    # 민감도 분석 실행
    sensitivity_results = await stress_test_engine.sensitivity_analysis(
        portfolio_positions,
        factor_ranges={
            "market_change": [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1],
            "volatility_multiplier": [1.0, 1.5, 2.0, 2.5, 3.0]
        }
    )
    
    return sensitivity_results

@router.get("/{portfolio_id}/expected-shortfall")
async def calculate_expected_shortfall(
    portfolio_id: str,
    confidence_level: float = Query(0.95, ge=0.9, le=0.99),
    num_simulations: int = Query(10000, ge=1000, le=100000),
    db: AsyncSession = Depends(get_db)
):
    """Expected Shortfall 계산"""
    
    # 포트폴리오 조회
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = portfolio_result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # 포지션 조회
    positions_result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    positions = positions_result.scalars().all()
    
    # 포지션 데이터 준비
    portfolio_positions = {}
    for position in positions:
        current_price = await get_current_price(position.symbol)
        market_value = position.quantity * current_price
        
        portfolio_positions[position.symbol] = {
            "value": market_value,
            "quantity": position.quantity,
            "sector": ""
        }
    
    # Expected Shortfall 계산
    es_result = await stress_test_engine.calculate_expected_shortfall(
        portfolio_positions,
        num_simulations=num_simulations,
        confidence_level=confidence_level
    )
    
    return es_result

def _calculate_concentration_risk(
    position_values: Dict[str, float], 
    total_value: float
) -> Dict:
    """집중도 리스크 계산"""
    
    weights = {
        symbol: value / total_value 
        for symbol, value in position_values.items()
    }
    
    # Herfindahl-Hirschman Index (HHI)
    hhi = sum(w**2 for w in weights.values()) * 10000
    
    # 최대 포지션 비중
    max_weight = max(weights.values()) if weights else 0
    max_symbol = max(weights.items(), key=lambda x: x[1])[0] if weights else None
    
    # 상위 5개 포지션 비중
    top_5_weights = sorted(weights.values(), reverse=True)[:5]
    top_5_concentration = sum(top_5_weights)
    
    return {
        "hhi": round(hhi, 2),  # 1000 미만: 낮은 집중도, 1000-1800: 중간, 1800 이상: 높은 집중도
        "max_position": {
            "symbol": max_symbol,
            "weight": round(max_weight * 100, 2)
        },
        "top_5_concentration": round(top_5_concentration * 100, 2),
        "num_positions": len(position_values),
        "diversification_ratio": round(1 / hhi * 10000, 2) if hhi > 0 else 0
    }