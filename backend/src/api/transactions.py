from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime, date

from src.models.portfolio import Transaction
from src.core.database import get_db
from src.schemas.portfolio import TransactionResponse

router = APIRouter()

@router.get("/{portfolio_id}", response_model=List[TransactionResponse])
async def get_transactions(
    portfolio_id: str,
    symbol: Optional[str] = Query(None, description="특정 종목으로 필터링"),
    transaction_type: Optional[str] = Query(None, description="BUY 또는 SELL"),
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오의 거래 내역 조회"""
    query = select(Transaction).where(Transaction.portfolio_id == portfolio_id)
    
    # 필터 적용
    if symbol:
        query = query.where(Transaction.symbol == symbol)
    
    if transaction_type:
        if transaction_type not in ["BUY", "SELL"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction type must be either BUY or SELL"
            )
        query = query.where(Transaction.transaction_type == transaction_type)
    
    if start_date:
        query = query.where(Transaction.executed_at >= datetime.combine(start_date, datetime.min.time()))
    
    if end_date:
        query = query.where(Transaction.executed_at <= datetime.combine(end_date, datetime.max.time()))
    
    # 최신순 정렬
    query = query.order_by(Transaction.executed_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions

@router.get("/{portfolio_id}/summary")
async def get_transaction_summary(
    portfolio_id: str,
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
    db: AsyncSession = Depends(get_db)
):
    """거래 요약 정보 조회"""
    query = select(Transaction).where(Transaction.portfolio_id == portfolio_id)
    
    if start_date:
        query = query.where(Transaction.executed_at >= datetime.combine(start_date, datetime.min.time()))
    
    if end_date:
        query = query.where(Transaction.executed_at <= datetime.combine(end_date, datetime.max.time()))
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    # 요약 정보 계산
    total_buy_value = sum(t.quantity * t.price for t in transactions if t.transaction_type == "BUY")
    total_sell_value = sum(t.quantity * t.price for t in transactions if t.transaction_type == "SELL")
    total_commission = sum(t.commission for t in transactions)
    
    buy_count = len([t for t in transactions if t.transaction_type == "BUY"])
    sell_count = len([t for t in transactions if t.transaction_type == "SELL"])
    
    unique_symbols = len(set(t.symbol for t in transactions))
    
    return {
        "portfolio_id": portfolio_id,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_transactions": len(transactions),
            "buy_transactions": buy_count,
            "sell_transactions": sell_count,
            "unique_symbols": unique_symbols,
            "total_buy_value": total_buy_value,
            "total_sell_value": total_sell_value,
            "total_commission": total_commission,
            "net_investment": total_buy_value - total_sell_value
        }
    }

@router.get("/{portfolio_id}/performance")
async def get_portfolio_performance(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 성과 분석"""
    # 모든 거래 내역 조회
    result = await db.execute(
        select(Transaction)
        .where(Transaction.portfolio_id == portfolio_id)
        .order_by(Transaction.executed_at)
    )
    transactions = result.scalars().all()
    
    if not transactions:
        return {
            "portfolio_id": portfolio_id,
            "performance": {
                "total_return": 0,
                "total_return_percent": 0,
                "realized_pnl": 0,
                "total_commission": 0
            }
        }
    
    # 종목별 거래 추적
    symbol_positions = {}
    realized_pnl = 0
    total_commission = sum(t.commission for t in transactions)
    
    for transaction in transactions:
        symbol = transaction.symbol
        
        if symbol not in symbol_positions:
            symbol_positions[symbol] = {
                "quantity": 0,
                "total_cost": 0,
                "realized_pnl": 0
            }
        
        pos = symbol_positions[symbol]
        
        if transaction.transaction_type == "BUY":
            pos["quantity"] += transaction.quantity
            pos["total_cost"] += transaction.quantity * transaction.price
        else:  # SELL
            if pos["quantity"] > 0:
                # 평균 단가 계산
                avg_cost = pos["total_cost"] / pos["quantity"]
                # 실현 손익 계산
                sell_pnl = (transaction.price - avg_cost) * transaction.quantity
                pos["realized_pnl"] += sell_pnl
                realized_pnl += sell_pnl
                
                # 포지션 업데이트
                pos["quantity"] -= transaction.quantity
                pos["total_cost"] = avg_cost * pos["quantity"]
    
    return {
        "portfolio_id": portfolio_id,
        "performance": {
            "realized_pnl": realized_pnl,
            "total_commission": total_commission,
            "net_realized_pnl": realized_pnl - total_commission,
            "symbol_performance": {
                symbol: {
                    "realized_pnl": data["realized_pnl"],
                    "remaining_quantity": data["quantity"]
                }
                for symbol, data in symbol_positions.items()
            }
        }
    }