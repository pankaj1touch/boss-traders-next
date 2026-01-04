import { apiSlice } from './apiSlice';

export interface StudentStats {
  enrolledCourses: number;
  ebooks: number;
  liveSessions: number;
  totalOrders: number;
}

export interface StudentCourse {
  enrollmentId: string;
  progress: number;
  accessTier: string;
  status: string;
  enrolledAt: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    level: string;
    category: string;
    rating: number;
    ratingCount: number;
    language: string;
    videos?: Array<{
      _id?: string;
      title?: string;
      duration?: number;
      isFree?: boolean;
      order?: number;
    }>;
  };
}

export interface StudentEbook {
  _id: string;
  title: string;
  author: string;
  cover?: string;
  price: number;
  format: string;
  pages?: number;
  purchasedAt?: string;
}

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentStats: builder.query<{ stats: StudentStats }, void>({
      query: () => '/student/dashboard',
      providesTags: ['User', 'Order'],
    }),
    getStudentCourses: builder.query<{ courses: StudentCourse[] }, void>({
      query: () => '/student/courses',
      providesTags: ['User', 'Course'],
    }),
    getStudentEbooks: builder.query<{ ebooks: StudentEbook[] }, void>({
      query: () => '/student/ebooks',
      providesTags: ['User', 'Ebook'],
    }),
  }),
});

export const {
  useGetStudentStatsQuery,
  useGetStudentCoursesQuery,
  useGetStudentEbooksQuery,
} = studentApi;

