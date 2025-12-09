'use client';

import { Percent, DollarSign, Copy, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { ActiveCoupon } from '@/store/api/couponApi';

interface CouponCardProps {
  coupon: ActiveCoupon;
  onApply?: (code: string) => void;
  showApplyButton?: boolean;
}

export function CouponCard({ coupon, onApply, showApplyButton = false }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
    if (coupon.endDate) {
      const now = new Date().getTime();
      const endDate = new Date(coupon.endDate).getTime();
      setIsExpiringSoon(endDate - now < 7 * 24 * 60 * 60 * 1000);
    }
  }, [coupon.endDate]);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      dispatch(addToast({ type: 'success', message: 'Coupon code copied!' }));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(coupon.code);
    }
  };

  const applicableToLabels = {
    all: 'All Items',
    courses: 'Courses Only',
    ebooks: 'eBooks Only',
    'demo-classes': 'Demo Classes Only',
    specific: 'Specific Items',
  };

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:border-primary-800 dark:from-primary-950/30 dark:to-primary-900/20" suppressHydrationWarning>
        <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-primary-200/30 dark:bg-primary-800/30" />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                {coupon.type === 'percentage' ? (
                  <Percent className="h-5 w-5 text-primary-600" />
                ) : (
                  <DollarSign className="h-5 w-5 text-primary-600" />
                )}
                <h3 className="text-lg font-bold text-foreground">{coupon.code}</h3>
                <button
                  onClick={handleCopy}
                  className="ml-2 rounded-lg p-1 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="mb-3">
                <p className="text-2xl font-bold text-primary-600">
                  {coupon.type === 'percentage' ? (
                    <>Save {coupon.value}%</>
                  ) : (
                    <>Save {formatPrice(coupon.value)}</>
                  )}
                </p>
                {coupon.maxDiscountAmount && coupon.type === 'percentage' && (
                  <p className="text-xs text-muted-foreground">
                    Up to {formatPrice(coupon.maxDiscountAmount)}
                  </p>
                )}
              </div>

              {coupon.description && (
                <p className="mb-3 text-sm text-muted-foreground">{coupon.description}</p>
              )}

              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {applicableToLabels[coupon.applicableTo]}
                </Badge>
                {coupon.minPurchaseAmount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Min: {formatPrice(coupon.minPurchaseAmount)}
                  </Badge>
                )}
              </div>

              {coupon.endDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Valid till {format(new Date(coupon.endDate), 'dd MMM yyyy')}
                    {mounted && isExpiringSoon && (
                      <span className="ml-2 text-orange-600 font-semibold">(Expiring Soon!)</span>
                    )}
                  </span>
                </div>
              )}

              {coupon.usageLimit && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {coupon.usageLimit - coupon.usageCount} uses remaining
                </p>
              )}
            </div>

            {showApplyButton && onApply && (
              <Button
                onClick={handleApply}
                size="sm"
                className="shrink-0"
              >
                Apply
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
  );
}

