'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { useMarketPrice } from '@/hooks/useMarketData';

interface AddTransactionDialogProps {
  portfolioId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddTransactionDialog({
  portfolioId,
  onSuccess,
  trigger,
}: AddTransactionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [transaction, setTransaction] = React.useState({
    type: 'BUY',
    symbol: '',
    quantity: '',
    price: '',
    fee: '0',
    notes: '',
    executedAt: new Date().toISOString().split('T')[0],
  });

  // Get current market price when symbol changes
  const { price: marketPrice } = useMarketPrice(
    transaction.symbol && transaction.type === 'BUY' ? transaction.symbol : null,
  );

  React.useEffect(() => {
    if (marketPrice && !transaction.price) {
      setTransaction((prev) => ({ ...prev, price: marketPrice.price.toString() }));
    }
  }, [marketPrice, transaction.price]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/portfolios/${portfolioId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transaction.type,
          symbol: transaction.symbol || undefined,
          quantity: transaction.quantity ? parseFloat(transaction.quantity) : undefined,
          price: transaction.price ? parseFloat(transaction.price) : undefined,
          fee: parseFloat(transaction.fee),
          notes: transaction.notes || undefined,
          executedAt: new Date(transaction.executedAt).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      // Reset form
      setTransaction({
        type: 'BUY',
        symbol: '',
        quantity: '',
        price: '',
        fee: '0',
        notes: '',
        executedAt: new Date().toISOString().split('T')[0],
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStockTransaction = ['BUY', 'SELL'].includes(transaction.type);
  const requiresAmount = ['DEPOSIT', 'WITHDRAWAL', 'FEE', 'DIVIDEND'].includes(transaction.type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            거래 추가
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 거래 추가</DialogTitle>
          <DialogDescription>포트폴리오에 새로운 거래를 기록합니다</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>거래 유형</Label>
              <Select
                value={transaction.type}
                onValueChange={(value) => setTransaction({ ...transaction, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">매수</SelectItem>
                  <SelectItem value="SELL">매도</SelectItem>
                  <SelectItem value="DEPOSIT">입금</SelectItem>
                  <SelectItem value="WITHDRAWAL">출금</SelectItem>
                  <SelectItem value="DIVIDEND">배당</SelectItem>
                  <SelectItem value="FEE">수수료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>거래일</Label>
              <Input
                type="date"
                value={transaction.executedAt}
                onChange={(e) => setTransaction({ ...transaction, executedAt: e.target.value })}
              />
            </div>
          </div>

          {isStockTransaction && (
            <>
              <div className="space-y-2">
                <Label>종목 코드</Label>
                <Input
                  placeholder="예: AAPL, 005930"
                  value={transaction.symbol}
                  onChange={(e) =>
                    setTransaction({ ...transaction, symbol: e.target.value.toUpperCase() })
                  }
                />
                {marketPrice && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    현재가: {marketPrice.price.toLocaleString()} {marketPrice.currency}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>수량</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={transaction.quantity}
                    onChange={(e) => setTransaction({ ...transaction, quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>단가</Label>
                  <Input
                    type="number"
                    placeholder="150.00"
                    value={transaction.price}
                    onChange={(e) => setTransaction({ ...transaction, price: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {requiresAmount && (
            <div className="space-y-2">
              <Label>금액</Label>
              <Input
                type="number"
                placeholder="1000000"
                value={transaction.price}
                onChange={(e) => setTransaction({ ...transaction, price: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>수수료</Label>
            <Input
              type="number"
              placeholder="0"
              value={transaction.fee}
              onChange={(e) => setTransaction({ ...transaction, fee: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>메모 (선택사항)</Label>
            <Textarea
              placeholder="거래에 대한 메모를 입력하세요"
              value={transaction.notes}
              onChange={(e) => setTransaction({ ...transaction, notes: e.target.value })}
              rows={3}
            />
          </div>

          {isStockTransaction && transaction.quantity && transaction.price && (
            <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>거래 금액</span>
                <span className="font-medium">
                  {(
                    parseFloat(transaction.quantity) * parseFloat(transaction.price)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>수수료</span>
                <span className="font-medium">{parseFloat(transaction.fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span>총 금액</span>
                <span>
                  {(
                    parseFloat(transaction.quantity) * parseFloat(transaction.price) +
                    parseFloat(transaction.fee)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (isStockTransaction &&
                  (!transaction.symbol || !transaction.quantity || !transaction.price)) ||
                (requiresAmount && !transaction.price)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  추가 중...
                </>
              ) : (
                '거래 추가'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
