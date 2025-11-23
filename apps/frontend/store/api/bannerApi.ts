import { apiSlice } from './apiSlice';

export interface Banner {
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

export const bannerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoint - Get active banners
    getActiveBanners: builder.query<BannersResponse, void>({
      query: () => '/banners/active',
      providesTags: ['Banner'],
    }),
  }),
});

export const {
  useGetActiveBannersQuery,
} = bannerApi;

