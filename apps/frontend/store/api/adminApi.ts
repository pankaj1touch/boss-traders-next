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
} = adminApi;












