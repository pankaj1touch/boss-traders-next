import { apiSlice } from './apiSlice';

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  description?: string;
  type: 'general' | 'course' | 'payment' | 'educational' | 'system' | 'promotion';
  audience: 'all' | 'students' | 'instructors' | 'admins';
  priority: 'low' | 'medium' | 'high';
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
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

interface TrackResponse {
  success: boolean;
  message: string;
}

export const announcementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoint - Get active announcements
    getActiveAnnouncements: builder.query<AnnouncementsResponse, {
      type?: string;
      priority?: string;
      audience?: string;
    }>({
      query: (params) => ({
        url: '/announcements/active',
        params,
      }),
      providesTags: ['Announcement'],
    }),

    // Track announcement view
    trackAnnouncementView: builder.mutation<TrackResponse, string>({
      query: (id) => ({
        url: `/announcements/${id}/view`,
        method: 'POST',
      }),
    }),

    // Track announcement click
    trackAnnouncementClick: builder.mutation<TrackResponse, string>({
      query: (id) => ({
        url: `/announcements/${id}/click`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetActiveAnnouncementsQuery,
  useTrackAnnouncementViewMutation,
  useTrackAnnouncementClickMutation,
} = announcementApi;

