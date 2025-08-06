import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
from functools import lru_cache
import pandas as pd

class MarketDataService:
    """시장 데이터 서비스"""
    
    def __init__(self):
        self.cache_duration = 60  # 60초 캐시
        self._price_cache = {}
        self._cache_timestamps = {}
    
    async def get_current_price(self, symbol: str) -> float:
        """현재 가격 조회 (캐시 적용)"""
        now = datetime.now()
        
        # 캐시 확인
        if symbol in self._price_cache:
            cache_time = self._cache_timestamps.get(symbol)
            if cache_time and (now - cache_time).seconds < self.cache_duration:
                return self._price_cache[symbol]
        
        # 새로운 가격 조회
        ticker = yf.Ticker(symbol)
        info = ticker.info
        current_price = info.get('currentPrice') or info.get('regularMarketPrice', 0)
        
        # 캐시 업데이트
        self._price_cache[symbol] = current_price
        self._cache_timestamps[symbol] = now
        
        return current_price
    
    async def get_historical_data(
        self, 
        symbol: str, 
        period: str = "1mo",
        interval: str = "1d"
    ) -> pd.DataFrame:
        """과거 가격 데이터 조회"""
        ticker = yf.Ticker(symbol)
        return ticker.history(period=period, interval=interval)
    
    async def get_multiple_prices(self, symbols: List[str]) -> Dict[str, float]:
        """여러 종목의 현재 가격 조회"""
        prices = {}
        tasks = [self.get_current_price(symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks)
        
        for symbol, price in zip(symbols, results):
            prices[symbol] = price
        
        return prices
    
    async def get_market_info(self, symbol: str) -> Dict:
        """종목 상세 정보 조회"""
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        return {
            "symbol": symbol,
            "name": info.get("longName", ""),
            "exchange": info.get("exchange", ""),
            "currency": info.get("currency", "USD"),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", 0),
            "dividend_yield": info.get("dividendYield", 0),
            "52_week_high": info.get("fiftyTwoWeekHigh", 0),
            "52_week_low": info.get("fiftyTwoWeekLow", 0),
            "volume": info.get("volume", 0),
            "average_volume": info.get("averageVolume", 0)
        }
    
    async def get_realtime_data(self, symbol: str) -> Dict:
        """실시간 데이터 조회"""
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        return {
            "symbol": symbol,
            "price": info.get("currentPrice", 0),
            "change": info.get("regularMarketChange", 0),
            "change_percent": info.get("regularMarketChangePercent", 0),
            "volume": info.get("volume", 0),
            "bid": info.get("bid", 0),
            "ask": info.get("ask", 0),
            "timestamp": datetime.now()
        }

# 싱글톤 인스턴스
market_data_service = MarketDataService()

# 헬퍼 함수들
async def get_current_price(symbol: str) -> float:
    """현재 가격 조회 헬퍼"""
    return await market_data_service.get_current_price(symbol)

async def get_historical_data(symbol: str, period: str = "1mo") -> pd.DataFrame:
    """과거 데이터 조회 헬퍼"""
    return await market_data_service.get_historical_data(symbol, period)

async def get_market_info(symbol: str) -> Dict:
    """시장 정보 조회 헬퍼"""
    return await market_data_service.get_market_info(symbol)