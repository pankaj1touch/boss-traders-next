import { apiSlice } from './apiSlice';

interface Course {
  _id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  language: string;
  level: string;
  tags: string[];
  thumbnail?: string;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  modality: string;
  publishStatus: string;
  rating: number;
  ratingCount: number;
  instructorId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Ebook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  cover?: string;
  description: string;
  price: number;
  salePrice?: number;
  fileUrl: string;
  fileSize?: number;
  pages?: number;
  format: string;
  drmLevel: string;
  category?: string;
  tags: string[];
  publishStatus: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface CoursesResponse {
  courses: Course[];
  pagination: Pagination;
}

interface EbooksResponse {
  ebooks: Ebook[];
  pagination: Pagination;
}

interface CourseDetailResponse {
  course: Course;
  modules: any[];
  lessons: any[];
  enrollmentCount: number;
}

interface EbookDetailResponse {
  ebook: Ebook;
  purchaseCount: number;
}

interface AdminOrderItem {
  courseId?: string;
  ebookId?: string;
  title: string;
  price: number;
  quantity: number;
}

interface AdminOrder {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  paymentVerified?: boolean;
  paymentId?: string;
  paymentMethod?: string;
  createdAt: string;
}

interface AdminOrdersResponse {
  orders: AdminOrder[];
  pagination: Pagination;
}

interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface BannersResponse {
  success: boolean;
  banners: Banner[];
  count: number;
}

interface BannerResponse {
  success: boolean;
  banner: Banner;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Course Management
    adminGetAllCourses: builder.query<CoursesResponse, {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      level?: string;
      publishStatus?: string;
      sort?: string;
    }>({
      query: (params) => ({
        url: '/courses/admin/all',
        params,
      }),
      providesTags: ['Course'],
    }),

    adminGetCourse: builder.query<CourseDetailResponse, string>({
      query: (id) => `/courses/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    adminCreateCourse: builder.mutation<{ message: string; course: Course }, Partial<Course>>({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    adminUpdateCourse: builder.mutation<{ message: string; course: Course }, { id: string; data: Partial<Course> }>({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course'],
    }),

    adminDeleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),

    // Ebook Management
    adminGetAllEbooks: builder.query<EbooksResponse, {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      publishStatus?: string;
      sort?: string;
    }>({
      query: (params) => ({
        url: '/ebooks/admin/all',
        params,
      }),
      providesTags: ['Ebook'],
    }),

    adminGetEbook: builder.query<EbookDetailResponse, string>({
      query: (id) => `/ebooks/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ebook', id }],
    }),

    adminCreateEbook: builder.mutation<{ message: string; ebook: Ebook }, Partial<Ebook>>({
      query: (data) => ({
        url: '/ebooks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Ebook'],
    }),

    adminUpdateEbook: builder.mutation<{ message: string; ebook: Ebook }, { id: string; data: Partial<Ebook> }>({
      query: ({ id, data }) => ({
        url: `/ebooks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ebook', id }, 'Ebook'],
    }),

    adminDeleteEbook: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/ebooks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ebook'],
    }),

    // Orders
    adminGetOrders: builder.query<
      AdminOrdersResponse,
      {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
      }
    >({
      query: (params) => ({
        url: '/orders/admin/all',
        params,
      }),
      providesTags: ['Order'],
    }),

    adminConfirmPayment: builder.mutation<{ message: string; order: AdminOrder }, { orderId: string }>({
      query: (data) => ({
        url: '/orders/confirm-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'User'],
    }),

    // Banner Management
    adminGetAllBanners: builder.query<BannersResponse, { isActive?: string; sort?: string }>({
      query: (params) => ({
        url: '/banners',
        params,
      }),
      providesTags: ['Banner'],
    }),

    adminGetBanner: builder.query<BannerResponse, string>({
      query: (id) => `/banners/${id}`,
      providesTags: (result, error, id) => [{ type: 'Banner', id }],
    }),

    adminCreateBanner: builder.mutation<{ success: boolean; message: string; banner: Banner }, Partial<Banner>>({
      query: (data) => ({
        url: '/banners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),

    adminUpdateBanner: builder.mutation<{ success: boolean; message: string; banner: Banner }, { id: string; data: Partial<Banner> }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Banner', id }, 'Banner'],
    }),

    adminDeleteBanner: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
});

export const {
  useAdminGetAllCoursesQuery,
  useAdminGetCourseQuery,
  useAdminCreateCourseMutation,
  useAdminUpdateCourseMutation,
  useAdminDeleteCourseMutation,
  useAdminGetAllEbooksQuery,
  useAdminGetEbookQuery,
  useAdminCreateEbookMutation,
  useAdminUpdateEbookMutation,
  useAdminDeleteEbookMutation,
  useAdminGetOrdersQuery,
  useAdminConfirmPaymentMutation,
  useAdminGetAllBannersQuery,
  useAdminGetBannerQuery,
  useAdminCreateBannerMutation,
  useAdminUpdateBannerMutation,
  useAdminDeleteBannerMutation,
} = adminApi;

export type { AdminOrder };












