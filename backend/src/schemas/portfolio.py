from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PortfolioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    initial_capital: float = Field(..., gt=0)

class PortfolioUpdate(PortfolioBase):
    name: Optional[str] = None
    description: Optional[str] = None

class PortfolioResponse(PortfolioBase):
    id: str
    total_value: float
    cash_balance: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PositionBase(BaseModel):
    symbol: str
    quantity: float
    average_price: float

class PositionCreate(PositionBase):
    portfolio_id: str

class PositionUpdate(BaseModel):
    quantity: Optional[float] = None
    average_price: Optional[float] = None

class PositionResponse(PositionBase):
    id: str
    portfolio_id: str
    current_price: Optional[float] = None
    market_value: Optional[float] = None
    unrealized_pnl: Optional[float] = None
    weight: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PortfolioWithPositions(PortfolioResponse):
    positions: List[PositionResponse] = []

class TransactionBase(BaseModel):
    symbol: str
    transaction_type: str  # BUY or SELL
    quantity: float
    price: float
    commission: float = 0.0

class TransactionCreate(TransactionBase):
    portfolio_id: str

class TransactionResponse(TransactionBase):
    id: str
    portfolio_id: str
    executed_at: datetime
    
    class Config:
        from_attributes = True