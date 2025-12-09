import { apiSlice } from './apiSlice';

export interface OrderItem {
  courseId?: string;
  ebookId?: string;
  demoClassId?: string;
  title: string;
  price: number;
  quantity: number;
}

export interface DemoClassRegistrationInfo {
  demoClassId: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
  qrCodeData?: string;
  qrCodeImageUrl?: string;
  upiId?: string;
  paymentScreenshot?: string;
  paymentVerified?: boolean;
  paymentId?: string;
  paymentMethod?: string;
  demoClassRegistrations?: DemoClassRegistrationInfo[];
}

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ message: string; order: Order }, { items: { courseId?: string; ebookId?: string }[]; couponCode?: string }>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    processPayment: builder.mutation<{ message: string; order: Order }, { orderId: string; paymentMethod: string }>({
      query: (data) => ({
        url: '/orders/payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'User'],
    }),
    verifyPayment: builder.mutation<
      { message: string; order: Order }, 
      { orderId: string; transactionId: string; screenshot?: string }
    >({
      query: (data) => ({
        url: '/orders/verify-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        'Order',
        'User',
        { type: 'Order', id: orderId },
      ],
    }),
    confirmPayment: builder.mutation<
      { message: string; order: Order }, 
      { orderId: string }
    >({
      query: (data) => ({
        url: '/orders/confirm-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        'Order',
        'User',
        { type: 'Order', id: orderId },
      ],
    }),
    getUserOrders: builder.query<{ orders: Order[] }, void>({
      query: () => '/orders',
      providesTags: ['Order', 'DemoClass'],
    }),
    getOrderById: builder.query<{ order: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useProcessPaymentMutation,
  useVerifyPaymentMutation,
  useConfirmPaymentMutation,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
} = orderApi;

