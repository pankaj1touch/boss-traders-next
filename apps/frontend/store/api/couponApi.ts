import { apiSlice } from './apiSlice';

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  applicableTo: 'all' | 'courses' | 'ebooks' | 'demo-classes' | 'specific';
  specificItems?: string[];
  startDate?: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  userLimit: number;
  isActive: boolean;
  description?: string;
  itemModel?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  usedBy?: Array<{
    userId: string;
    usedAt: string;
    orderId?: string;
    usageCount: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponRequest {
  code: string;
  items: Array<{
    courseId?: string;
    ebookId?: string;
    demoClassId?: string;
  }>;
  userId?: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  valid?: boolean;
  message: string;
  coupon?: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  discount?: number;
  cartTotal?: number;
  finalTotal?: number;
  minPurchaseAmount?: number;
}

interface CouponsResponse {
  success: boolean;
  coupons: Coupon[];
  count: number;
}

interface CouponResponse {
  success: boolean;
  coupon: Coupon;
}

interface CouponStats {
  totalUsage: number;
  uniqueUsers: number;
  totalRevenueSaved: number;
  usageHistory: Array<{
    userId?: {
      _id: string;
      name: string;
      email: string;
    };
    orderId?: {
      _id: string;
      orderNumber: string;
      total: number;
    };
    usedAt: string;
    usageCount: number;
  }>;
}

interface CouponStatsResponse {
  success: boolean;
  coupon: {
    code: string;
    type: string;
    value: number;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    endDate: string;
  };
  stats: CouponStats;
}

export interface ActiveCoupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  applicableTo: 'all' | 'courses' | 'ebooks' | 'demo-classes' | 'specific';
  description?: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
}

export interface ActiveCouponsResponse {
  success: boolean;
  coupons: ActiveCoupon[];
  count: number;
}

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoint - Get active coupons
    getActiveCoupons: builder.query<ActiveCouponsResponse, void>({
      query: () => '/coupons/active',
      providesTags: ['Coupon'],
    }),
    // Public endpoint - Validate coupon
    validateCoupon: builder.mutation<ValidateCouponResponse, ValidateCouponRequest>({
      query: (data) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export type { CouponsResponse, CouponResponse, CouponStatsResponse };

export const {
  useGetActiveCouponsQuery,
  useValidateCouponMutation,
} = couponApi;

