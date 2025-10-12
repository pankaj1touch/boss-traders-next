import { apiSlice } from './apiSlice';

export interface Ebook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  cover?: string;
  description: string;
  price: number;
  salePrice?: number;
  format: string;
  pages?: number;
  category?: string;
  tags: string[];
  rating: number;
  ratingCount: number;
}

export const ebookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEbooks: builder.query<{ ebooks: Ebook[]; pagination: any }, any>({
      query: (params) => ({
        url: '/ebooks',
        params,
      }),
      providesTags: ['Ebook'],
    }),
    getEbookBySlug: builder.query<{ ebook: Ebook }, string>({
      query: (slug) => `/ebooks/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Ebook', id: slug }],
    }),
    downloadEbook: builder.mutation<{ downloadUrl: string; expiresAt: Date }, string>({
      query: (id) => ({
        url: `/ebooks/${id}/download`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetEbooksQuery,
  useGetEbookBySlugQuery,
  useDownloadEbookMutation,
} = ebookApi;

