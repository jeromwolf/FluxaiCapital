import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime
import asyncio

from src.services.market_data import get_historical_data, get_current_price

class StressTestEngine:
    """스트레스 테스트 시뮬레이션"""
    
    def __init__(self):
        # 사전 정의된 시나리오
        self.predefined_scenarios = {
            "2008_financial_crisis": {
                "name": "2008 금융위기",
                "market_shock": -0.40,  # -40%
                "volatility_multiplier": 3.0,
                "correlation_increase": 0.3
            },
            "covid_19_crash": {
                "name": "COVID-19 팬데믹",
                "market_shock": -0.35,  # -35%
                "volatility_multiplier": 2.5,
                "correlation_increase": 0.25
            },
            "tech_bubble_burst": {
                "name": "닷컴 버블 붕괴",
                "market_shock": -0.30,  # -30%
                "volatility_multiplier": 2.0,
                "correlation_increase": 0.2,
                "sector_specific": {"technology": -0.50}
            },
            "interest_rate_shock": {
                "name": "금리 급등",
                "market_shock": -0.15,
                "volatility_multiplier": 1.5,
                "sector_specific": {
                    "real_estate": -0.25,
                    "utilities": -0.20,
                    "financials": 0.05
                }
            },
            "inflation_surge": {
                "name": "인플레이션 급등",
                "market_shock": -0.20,
                "volatility_multiplier": 1.8,
                "sector_specific": {
                    "consumer_staples": 0.05,
                    "technology": -0.25,
                    "materials": 0.10
                }
            }
        }
    
    async def run_stress_test(
        self,
        portfolio_positions: Dict[str, Dict],  # {symbol: {value, quantity, sector}}
        scenarios: Optional[List[str]] = None,
        custom_scenario: Optional[Dict] = None
    ) -> Dict:
        """스트레스 테스트 실행"""
        
        if scenarios is None:
            scenarios = list(self.predefined_scenarios.keys())
        
        results = {
            "portfolio_value": sum(pos["value"] for pos in portfolio_positions.values()),
            "test_date": datetime.now(),
            "scenarios": {}
        }
        
        # 사전 정의된 시나리오 테스트
        for scenario_name in scenarios:
            if scenario_name in self.predefined_scenarios:
                scenario = self.predefined_scenarios[scenario_name]
                scenario_result = await self._apply_scenario(
                    portfolio_positions, scenario
                )
                results["scenarios"][scenario_name] = scenario_result
        
        # 커스텀 시나리오 테스트
        if custom_scenario:
            custom_result = await self._apply_scenario(
                portfolio_positions, custom_scenario
            )
            results["scenarios"]["custom"] = custom_result
        
        # 최악의 시나리오 분석
        results["worst_case"] = self._find_worst_case(results["scenarios"])
        
        return results
    
    async def _apply_scenario(
        self,
        portfolio_positions: Dict[str, Dict],
        scenario: Dict
    ) -> Dict:
        """시나리오를 포트폴리오에 적용"""
        
        scenario_result = {
            "name": scenario.get("name", "Custom Scenario"),
            "initial_value": sum(pos["value"] for pos in portfolio_positions.values()),
            "stressed_value": 0,
            "loss": 0,
            "loss_percentage": 0,
            "position_impacts": {}
        }
        
        # 각 포지션에 스트레스 적용
        for symbol, position in portfolio_positions.items():
            initial_value = position["value"]
            
            # 기본 시장 충격 적용
            shock = scenario.get("market_shock", 0)
            
            # 섹터별 충격 적용 (있는 경우)
            sector = position.get("sector", "")
            if "sector_specific" in scenario and sector in scenario["sector_specific"]:
                shock = scenario["sector_specific"][sector]
            
            # 변동성 증가 효과 (랜덤 요소 추가)
            volatility_mult = scenario.get("volatility_multiplier", 1.0)
            random_shock = np.random.normal(0, 0.05 * volatility_mult)
            
            # 최종 가격 변화
            total_shock = shock + random_shock
            stressed_value = initial_value * (1 + total_shock)
            
            scenario_result["stressed_value"] += stressed_value
            scenario_result["position_impacts"][symbol] = {
                "initial_value": initial_value,
                "stressed_value": stressed_value,
                "change": stressed_value - initial_value,
                "change_percentage": total_shock * 100
            }
        
        # 전체 손실 계산
        scenario_result["loss"] = scenario_result["stressed_value"] - scenario_result["initial_value"]
        scenario_result["loss_percentage"] = (scenario_result["loss"] / scenario_result["initial_value"]) * 100
        
        return scenario_result
    
    async def historical_stress_test(
        self,
        portfolio_positions: Dict[str, Dict],
        historical_period: str  # 예: "2008-09-01:2009-03-31"
    ) -> Dict:
        """과거 실제 시장 데이터를 사용한 스트레스 테스트"""
        
        start_date, end_date = historical_period.split(":")
        
        result = {
            "period": historical_period,
            "initial_value": sum(pos["value"] for pos in portfolio_positions.values()),
            "position_results": {}
        }
        
        total_stressed_value = 0
        
        for symbol, position in portfolio_positions.items():
            # 해당 기간의 과거 데이터 조회
            hist_data = await get_historical_data(symbol, period="10y")
            
            if not hist_data.empty:
                # 특정 기간 필터링
                period_data = hist_data[start_date:end_date]
                
                if not period_data.empty:
                    # 기간 중 최저점 찾기
                    start_price = period_data.iloc[0]["Close"]
                    min_price = period_data["Close"].min()
                    end_price = period_data.iloc[-1]["Close"]
                    
                    # 최대 하락률 계산
                    max_drawdown = (min_price - start_price) / start_price
                    period_return = (end_price - start_price) / start_price
                    
                    # 현재 포지션에 적용
                    stressed_value = position["value"] * (1 + period_return)
                    worst_value = position["value"] * (1 + max_drawdown)
                    
                    result["position_results"][symbol] = {
                        "initial_value": position["value"],
                        "stressed_value": stressed_value,
                        "worst_value": worst_value,
                        "period_return": period_return * 100,
                        "max_drawdown": max_drawdown * 100
                    }
                    
                    total_stressed_value += stressed_value
        
        result["stressed_value"] = total_stressed_value
        result["total_loss"] = total_stressed_value - result["initial_value"]
        result["loss_percentage"] = (result["total_loss"] / result["initial_value"]) * 100
        
        return result
    
    async def sensitivity_analysis(
        self,
        portfolio_positions: Dict[str, Dict],
        factor_ranges: Dict[str, List[float]]
    ) -> Dict:
        """민감도 분석"""
        
        # 기본 팩터 범위 설정
        default_ranges = {
            "market_change": [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3],
            "volatility_multiplier": [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
            "correlation": [0.3, 0.5, 0.7, 0.9]
        }
        
        factor_ranges = {**default_ranges, **factor_ranges}
        
        results = {
            "base_value": sum(pos["value"] for pos in portfolio_positions.values()),
            "sensitivities": {}
        }
        
        # 각 팩터별 민감도 분석
        for factor, values in factor_ranges.items():
            factor_results = []
            
            for value in values:
                if factor == "market_change":
                    scenario = {"market_shock": value}
                elif factor == "volatility_multiplier":
                    scenario = {"market_shock": -0.1, "volatility_multiplier": value}
                elif factor == "correlation":
                    scenario = {"market_shock": -0.1, "correlation_increase": value}
                else:
                    continue
                
                scenario_result = await self._apply_scenario(
                    portfolio_positions, scenario
                )
                
                factor_results.append({
                    "factor_value": value,
                    "portfolio_value": scenario_result["stressed_value"],
                    "loss": scenario_result["loss"],
                    "loss_percentage": scenario_result["loss_percentage"]
                })
            
            results["sensitivities"][factor] = factor_results
        
        return results
    
    def _find_worst_case(self, scenarios: Dict) -> Dict:
        """최악의 시나리오 찾기"""
        worst_scenario = None
        worst_loss = 0
        
        for scenario_name, scenario_result in scenarios.items():
            if scenario_result["loss"] < worst_loss:
                worst_loss = scenario_result["loss"]
                worst_scenario = {
                    "scenario_name": scenario_name,
                    **scenario_result
                }
        
        return worst_scenario
    
    async def calculate_expected_shortfall(
        self,
        portfolio_positions: Dict[str, Dict],
        num_simulations: int = 10000,
        confidence_level: float = 0.95
    ) -> Dict:
        """Expected Shortfall (ES) 계산"""
        
        portfolio_value = sum(pos["value"] for pos in portfolio_positions.values())
        simulated_losses = []
        
        # 몬테카를로 시뮬레이션
        for _ in range(num_simulations):
            # 랜덤 시나리오 생성
            market_shock = np.random.normal(-0.01, 0.05)  # 평균 -1%, 표준편차 5%
            volatility = np.random.uniform(1.0, 2.0)
            
            scenario = {
                "market_shock": market_shock,
                "volatility_multiplier": volatility
            }
            
            result = await self._apply_scenario(portfolio_positions, scenario)
            simulated_losses.append(-result["loss"])  # 손실을 양수로 변환
        
        # VaR 및 ES 계산
        simulated_losses = np.array(simulated_losses)
        var_threshold = np.percentile(simulated_losses, confidence_level * 100)
        
        # ES는 VaR를 초과하는 손실의 평균
        tail_losses = simulated_losses[simulated_losses >= var_threshold]
        expected_shortfall = np.mean(tail_losses) if len(tail_losses) > 0 else var_threshold
        
        return {
            "portfolio_value": portfolio_value,
            "confidence_level": confidence_level,
            "var": var_threshold,
            "expected_shortfall": expected_shortfall,
            "var_percentage": (var_threshold / portfolio_value) * 100,
            "es_percentage": (expected_shortfall / portfolio_value) * 100,
            "num_simulations": num_simulations,
            "tail_observations": len(tail_losses)
        }