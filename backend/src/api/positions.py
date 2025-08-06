from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime
import uuid

from src.models.portfolio import Position, Portfolio, Transaction
from src.core.database import get_db
from src.schemas.portfolio import (
    PositionCreate,
    PositionUpdate,
    PositionResponse,
    TransactionCreate,
    TransactionResponse
)
from src.services.market_data import get_current_price

router = APIRouter()

@router.post("/", response_model=PositionResponse, status_code=status.HTTP_201_CREATED)
async def create_position(
    position: PositionCreate,
    db: AsyncSession = Depends(get_db)
):
    """새로운 포지션 생성 (매수)"""
    # 포트폴리오 존재 확인
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == position.portfolio_id)
    )
    portfolio = portfolio_result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # 현재 가격 조회
    current_price = await get_current_price(position.symbol)
    market_value = position.quantity * current_price
    
    # 잔고 확인
    if portfolio.cash_balance < market_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient cash balance"
        )
    
    # 기존 포지션 확인
    existing_position_result = await db.execute(
        select(Position).where(
            Position.portfolio_id == position.portfolio_id,
            Position.symbol == position.symbol
        )
    )
    existing_position = existing_position_result.scalar_one_or_none()
    
    if existing_position:
        # 기존 포지션 업데이트 (평균 단가 계산)
        total_quantity = existing_position.quantity + position.quantity
        total_value = (existing_position.quantity * existing_position.average_price) + \
                     (position.quantity * position.average_price)
        new_average_price = total_value / total_quantity
        
        await db.execute(
            update(Position)
            .where(Position.id == existing_position.id)
            .values(
                quantity=total_quantity,
                average_price=new_average_price,
                current_price=current_price,
                market_value=total_quantity * current_price,
                updated_at=datetime.utcnow()
            )
        )
        position_id = existing_position.id
    else:
        # 새 포지션 생성
        new_position = Position(
            id=str(uuid.uuid4()),
            portfolio_id=position.portfolio_id,
            symbol=position.symbol,
            quantity=position.quantity,
            average_price=position.average_price,
            current_price=current_price,
            market_value=market_value,
            unrealized_pnl=0,
            weight=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_position)
        position_id = new_position.id
    
    # 거래 기록 생성
    transaction = Transaction(
        id=str(uuid.uuid4()),
        portfolio_id=position.portfolio_id,
        symbol=position.symbol,
        transaction_type="BUY",
        quantity=position.quantity,
        price=position.average_price,
        commission=0,  # TODO: 수수료 계산
        executed_at=datetime.utcnow()
    )
    db.add(transaction)
    
    # 포트폴리오 잔고 업데이트
    await db.execute(
        update(Portfolio)
        .where(Portfolio.id == position.portfolio_id)
        .values(
            cash_balance=portfolio.cash_balance - market_value,
            updated_at=datetime.utcnow()
        )
    )
    
    await db.commit()
    
    # 생성/업데이트된 포지션 반환
    result = await db.execute(
        select(Position).where(Position.id == position_id)
    )
    return result.scalar_one()

@router.get("/{portfolio_id}", response_model=List[PositionResponse])
async def get_positions(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오의 모든 포지션 조회"""
    result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    positions = result.scalars().all()
    
    # 현재 가격 업데이트 및 수익률 계산
    for position in positions:
        current_price = await get_current_price(position.symbol)
        position.current_price = current_price
        position.market_value = position.quantity * current_price
        position.unrealized_pnl = (current_price - position.average_price) * position.quantity
    
    return positions

@router.put("/{position_id}", response_model=PositionResponse)
async def update_position(
    position_id: str,
    position_update: PositionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """포지션 수정"""
    result = await db.execute(
        select(Position).where(Position.id == position_id)
    )
    position = result.scalar_one_or_none()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    update_data = position_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.execute(
        update(Position).where(Position.id == position_id).values(**update_data)
    )
    await db.commit()
    
    # 업데이트된 포지션 반환
    result = await db.execute(
        select(Position).where(Position.id == position_id)
    )
    return result.scalar_one()

@router.delete("/{position_id}/sell", response_model=TransactionResponse)
async def sell_position(
    position_id: str,
    quantity: float,
    price: float,
    db: AsyncSession = Depends(get_db)
):
    """포지션 매도"""
    result = await db.execute(
        select(Position).where(Position.id == position_id)
    )
    position = result.scalar_one_or_none()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    if position.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient position quantity"
        )
    
    # 거래 기록 생성
    transaction = Transaction(
        id=str(uuid.uuid4()),
        portfolio_id=position.portfolio_id,
        symbol=position.symbol,
        transaction_type="SELL",
        quantity=quantity,
        price=price,
        commission=0,  # TODO: 수수료 계산
        executed_at=datetime.utcnow()
    )
    db.add(transaction)
    
    # 포지션 업데이트
    remaining_quantity = position.quantity - quantity
    if remaining_quantity == 0:
        await db.delete(position)
    else:
        await db.execute(
            update(Position)
            .where(Position.id == position_id)
            .values(
                quantity=remaining_quantity,
                updated_at=datetime.utcnow()
            )
        )
    
    # 포트폴리오 잔고 업데이트
    sell_value = quantity * price
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.id == position.portfolio_id)
    )
    portfolio = portfolio_result.scalar_one()
    
    await db.execute(
        update(Portfolio)
        .where(Portfolio.id == position.portfolio_id)
        .values(
            cash_balance=portfolio.cash_balance + sell_value,
            updated_at=datetime.utcnow()
        )
    )
    
    await db.commit()
    
    return transaction