import { apiSlice } from './apiSlice';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  courseId?: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
  videoId?: string;
  read: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      { notifications: Notification[]; unreadCount: number; total: number },
      { read?: boolean; limit?: number }
    >({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation<
      { message: string; notification: Notification },
      string
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
