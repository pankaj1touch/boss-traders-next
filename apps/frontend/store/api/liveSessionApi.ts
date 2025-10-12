import { apiSlice } from './apiSlice';

export interface LiveSession {
  _id: string;
  courseId: any;
  batchId?: any;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  status: string;
  maxAttendees?: number;
}

export const liveSessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLiveSessions: builder.query<{ sessions: LiveSession[] }, any>({
      query: (params) => ({
        url: '/live',
        params,
      }),
      providesTags: ['LiveSession'],
    }),
    getSessionById: builder.query<{ session: LiveSession }, string>({
      query: (id) => `/live/${id}`,
      providesTags: (result, error, id) => [{ type: 'LiveSession', id }],
    }),
    joinSession: builder.mutation<{ joinLink: string; session: LiveSession }, string>({
      query: (id) => ({
        url: `/live/${id}/join`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetLiveSessionsQuery,
  useGetSessionByIdQuery,
  useJoinSessionMutation,
} = liveSessionApi;

