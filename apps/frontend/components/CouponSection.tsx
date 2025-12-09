'use client';

import { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetActiveCouponsQuery } from '@/store/api/couponApi';
import { CouponCard } from '@/components/CouponCard';

interface CouponSectionProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  onApplyCoupon: (code?: string) => void;
  isValidatingCoupon: boolean;
  appliedCoupon: {
    code: string;
    discount: number;
    finalTotal: number;
  } | null;
  onRemoveCoupon: () => void;
}

export function CouponSection({
  couponCode,
  setCouponCode,
  onApplyCoupon,
  isValidatingCoupon,
  appliedCoupon,
  onRemoveCoupon,
}: CouponSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: couponsData, isLoading: couponsLoading, error: couponsError } = useGetActiveCouponsQuery(undefined, {
    skip: !mounted,
  });

  return (
    <div className="space-y-4" suppressHydrationWarning>
      {!appliedCoupon ? (
        <>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onApplyCoupon();
                }
              }}
              className="flex-1 uppercase"
            />
            <Button
              onClick={() => onApplyCoupon()}
              disabled={isValidatingCoupon || !couponCode.trim()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              Apply
            </Button>
          </div>

          {/* Available Coupons - Only render after mount */}
          {mounted && (
            <>
              {couponsLoading ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Loading coupons...</p>
                </div>
              ) : couponsError ? (
                <p className="text-xs text-red-600">Failed to load coupons</p>
              ) : couponsData?.coupons && Array.isArray(couponsData.coupons) && couponsData.coupons.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Available Coupons:</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {couponsData.coupons.slice(0, 3).map((coupon) => {
                      if (!coupon || !coupon._id) return null;
                      return (
                        <CouponCard
                          key={coupon._id}
                          coupon={coupon}
                          onApply={(code) => {
                            onApplyCoupon(code);
                          }}
                          showApplyButton={true}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                {appliedCoupon.code}
              </span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-green-600 hover:text-green-800 dark:text-green-400"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            You saved ₹{appliedCoupon.discount.toFixed(2)}!
          </p>
        </div>
      )}
    </div>
  );
}

