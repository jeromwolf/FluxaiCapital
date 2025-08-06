from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
from datetime import datetime
import uuid

from src.models.portfolio import Portfolio, Position
from src.core.database import get_db
from src.schemas.portfolio import (
    PortfolioCreate, 
    PortfolioUpdate, 
    PortfolioResponse,
    PortfolioWithPositions
)

router = APIRouter()

@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    portfolio: PortfolioCreate,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 생성"""
    new_portfolio = Portfolio(
        id=str(uuid.uuid4()),
        name=portfolio.name,
        description=portfolio.description,
        total_value=portfolio.initial_capital,
        cash_balance=portfolio.initial_capital,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_portfolio)
    await db.commit()
    await db.refresh(new_portfolio)
    
    return new_portfolio

@router.get("/", response_model=List[PortfolioResponse])
async def get_portfolios(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 목록 조회"""
    result = await db.execute(
        select(Portfolio).offset(skip).limit(limit)
    )
    portfolios = result.scalars().all()
    return portfolios

@router.get("/{portfolio_id}", response_model=PortfolioWithPositions)
async def get_portfolio(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """특정 포트폴리오 상세 조회"""
    result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # 포지션 정보 포함
    positions_result = await db.execute(
        select(Position).where(Position.portfolio_id == portfolio_id)
    )
    portfolio.positions = positions_result.scalars().all()
    
    return portfolio

@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: str,
    portfolio_update: PortfolioUpdate,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 정보 수정"""
    result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    update_data = portfolio_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.execute(
        update(Portfolio).where(Portfolio.id == portfolio_id).values(**update_data)
    )
    await db.commit()
    
    # 업데이트된 포트폴리오 반환
    result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    return result.scalar_one()

@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 삭제"""
    result = await db.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    await db.delete(portfolio)
    await db.commit()
    
    return None

@router.post("/{portfolio_id}/rebalance")
async def trigger_rebalance(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db)
):
    """포트폴리오 리밸런싱 트리거"""
    # TODO: 리밸런싱 로직 구현
    return {"message": "Rebalancing triggered", "portfolio_id": portfolio_id}