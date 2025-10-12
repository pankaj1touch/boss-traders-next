import { apiSlice } from './apiSlice';

export interface Feedback {
  _id: string;
  userId: any;
  courseId: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
}

export const feedbackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFeedback: builder.mutation<{ message: string; feedback: Feedback }, { courseId: string; rating: number; comment?: string }>({
      query: ({ courseId, ...body }) => ({
        url: `/feedback/courses/${courseId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Feedback', 'Course'],
    }),
    getCourseFeedback: builder.query<{ feedback: Feedback[] }, { courseId: string; status?: string }>({
      query: ({ courseId, status }) => ({
        url: `/feedback/courses/${courseId}`,
        params: { status },
      }),
      providesTags: ['Feedback'],
    }),
  }),
});

export const {
  useCreateFeedbackMutation,
  useGetCourseFeedbackQuery,
} = feedbackApi;

