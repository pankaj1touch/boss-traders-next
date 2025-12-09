import { apiSlice } from './apiSlice';
import type { Coupon, CouponsResponse, CouponResponse, CouponStatsResponse } from './couponApi';
import type { Announcement } from './announcementApi';

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
  demoClassId?: string;
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

interface AnnouncementsResponse {
  success: boolean;
  announcements: Announcement[];
  count: number;
}

interface AnnouncementResponse {
  success: boolean;
  announcement: Announcement;
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

    // Demo Class Management
    adminGetAllDemoClasses: builder.query<{ demoClasses: any[] }, {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      courseId?: string;
    }>({
      query: (params) => ({
        url: '/demo-classes',
        params,
      }),
      providesTags: ['DemoClass'],
    }),

    adminGetDemoClass: builder.query<{ demoClass: any }, string>({
      query: (id) => `/demo-classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'DemoClass', id }],
    }),

    adminCreateDemoClass: builder.mutation<{ message: string; demoClass: any }, any>({
      query: (data) => ({
        url: '/demo-classes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DemoClass'],
    }),

    adminUpdateDemoClass: builder.mutation<{ message: string; demoClass: any }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/demo-classes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'DemoClass', id }, 'DemoClass'],
    }),

    adminDeleteDemoClass: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/demo-classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DemoClass'],
    }),

    // Demo Class Registrations
    adminGetPendingRegistrations: builder.query<{ registrations: any[] }, { demoClassId?: string; status?: string; approvalStatus?: string }>({
      query: (params) => ({
        url: '/demo-classes/admin/registrations',
        params,
      }),
      providesTags: ['DemoClass'],
    }),

    adminApproveRegistration: builder.mutation<{ message: string; registration: any }, { id: string; adminNotes?: string }>({
      query: ({ id, adminNotes }) => ({
        url: `/demo-classes/admin/registrations/${id}/approve`,
        method: 'POST',
        body: { adminNotes },
      }),
      invalidatesTags: ['DemoClass', 'Order'],
    }),

    adminRejectRegistration: builder.mutation<{ message: string; registration: any }, { id: string; adminNotes?: string }>({
      query: ({ id, adminNotes }) => ({
        url: `/demo-classes/admin/registrations/${id}/reject`,
        method: 'POST',
        body: { adminNotes },
      }),
      invalidatesTags: ['DemoClass', 'Order'],
    }),

    // Demo Class Registration Statistics
    adminGetDemoClassStats: builder.query<{
      totalRegistrations: number;
      pendingRegistrations: number;
      approvedRegistrations: number;
      rejectedRegistrations: number;
      totalDemoClasses: number;
    }, void>({
      query: () => '/demo-classes/admin/stats',
      providesTags: ['DemoClass'],
    }),

    // Coupon Management
    adminGetAllCoupons: builder.query<CouponsResponse, {
      isActive?: string;
      type?: string;
      applicableTo?: string;
      sort?: string;
    }>({
      query: (params) => ({
        url: '/coupons/admin/all',
        params,
      }),
      providesTags: ['Coupon'],
    }),

    adminGetCoupon: builder.query<CouponResponse, string>({
      query: (id) => `/coupons/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Coupon', id }],
    }),

    adminGetCouponStats: builder.query<CouponStatsResponse, string>({
      query: (id) => `/coupons/admin/${id}/stats`,
      providesTags: (result, error, id) => [{ type: 'Coupon', id }],
    }),

    adminCreateCoupon: builder.mutation<CouponResponse, Partial<Coupon>>({
      query: (data) => ({
        url: '/coupons/admin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),

    adminUpdateCoupon: builder.mutation<CouponResponse, { id: string; data: Partial<Coupon> }>({
      query: ({ id, data }) => ({
        url: `/coupons/admin/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Coupon', id }, 'Coupon'],
    }),

    adminDeleteCoupon: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/coupons/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),

    // Announcement Management
    adminGetAllAnnouncements: builder.query<AnnouncementsResponse, {
      status?: string;
      type?: string;
      priority?: string;
      isActive?: string;
      sort?: string;
    }>({
      query: (params) => ({
        url: '/announcements',
        params,
      }),
      providesTags: ['Announcement'],
    }),

    adminGetAnnouncement: builder.query<AnnouncementResponse, string>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Announcement', id }],
    }),

    adminCreateAnnouncement: builder.mutation<AnnouncementResponse, Partial<Announcement>>({
      query: (data) => ({
        url: '/announcements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Announcement'],
    }),

    adminUpdateAnnouncement: builder.mutation<AnnouncementResponse, { id: string; data: Partial<Announcement> }>({
      query: ({ id, data }) => ({
        url: `/announcements/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Announcement', id }, 'Announcement'],
    }),

    adminDeleteAnnouncement: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcement'],
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
  useAdminGetAllDemoClassesQuery,
  useAdminGetDemoClassQuery,
  useAdminCreateDemoClassMutation,
  useAdminUpdateDemoClassMutation,
  useAdminDeleteDemoClassMutation,
  useAdminGetPendingRegistrationsQuery,
  useAdminApproveRegistrationMutation,
  useAdminRejectRegistrationMutation,
  useAdminGetDemoClassStatsQuery,
  useAdminGetAllAnnouncementsQuery,
  useAdminGetAnnouncementQuery,
  useAdminCreateAnnouncementMutation,
  useAdminUpdateAnnouncementMutation,
  useAdminDeleteAnnouncementMutation,
  useAdminGetAllCouponsQuery,
  useAdminGetCouponQuery,
  useAdminGetCouponStatsQuery,
  useAdminCreateCouponMutation,
  useAdminUpdateCouponMutation,
  useAdminDeleteCouponMutation,
} = adminApi;

export type { AdminOrder };












