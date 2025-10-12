import { apiSlice } from './apiSlice';

export interface Course {
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
  instructorId?: any;
  createdAt: string;
}

export interface CourseDetail extends Course {
  modules: any[];
  lessons: any[];
  feedback: any[];
  isEnrolled: boolean;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<CoursesResponse, any>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    getCourseBySlug: builder.query<{ course: CourseDetail; modules: any[]; lessons: any[]; feedback: any[]; isEnrolled: boolean }, string>({
      query: (slug) => `/courses/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Course', id: slug }],
    }),
    enrollInCourse: builder.mutation<any, { id: string; batchId?: string; accessTier?: string }>({
      query: ({ id, ...body }) => ({
        url: `/courses/${id}/enroll`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course', 'User'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useEnrollInCourseMutation,
} = courseApi;

