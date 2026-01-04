import { apiSlice } from './apiSlice';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle, Phone } from 'lucide-react';

export interface SocialLink {
  _id: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'telegram' | 'whatsapp';
  url: string;
  isActive: boolean;
  order: number;
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinksResponse {
  success: boolean;
  socialLinks: SocialLink[];
}

export interface SocialLinkResponse {
  success: boolean;
  socialLink: SocialLink;
}

// Icon mapping
export const platformIcons: Record<SocialLink['platform'], any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  telegram: MessageCircle,
  whatsapp: Phone,
};

export const socialLinkApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Get active social links
    getActiveSocialLinks: builder.query<SocialLinksResponse, void>({
      query: () => '/social-links/active',
      providesTags: ['SocialLink'],
    }),

    // Admin: Get all social links
    adminGetAllSocialLinks: builder.query<SocialLinksResponse, void>({
      query: () => '/social-links/admin/all',
      providesTags: ['SocialLink'],
    }),

    // Admin: Create social link
    createSocialLink: builder.mutation<SocialLinkResponse, Partial<SocialLink>>({
      query: (data) => ({
        url: '/social-links',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialLink'],
    }),

    // Admin: Update social link
    updateSocialLink: builder.mutation<SocialLinkResponse, { id: string; data: Partial<SocialLink> }>({
      query: ({ id, data }) => ({
        url: `/social-links/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SocialLink'],
    }),

    // Admin: Delete social link
    deleteSocialLink: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/social-links/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialLink'],
    }),
  }),
});

export const {
  useGetActiveSocialLinksQuery,
  useAdminGetAllSocialLinksQuery,
  useCreateSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
} = socialLinkApi;

