import { apiSlice } from './apiSlice';

export interface PageContent {
  _id: string;
  pageType: 'about' | 'contact' | 'careers';
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PageContentResponse {
  success: boolean;
  pageContent: PageContent;
}

export interface PageContentsResponse {
  success: boolean;
  pageContents: PageContent[];
  count: number;
}

export const pageContentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public: Get page content by type
    getPageContent: builder.query<PageContentResponse, 'about' | 'contact' | 'careers'>({
      query: (pageType) => `/page-content/${pageType}`,
      providesTags: (result, error, pageType) => [{ type: 'PageContent', id: pageType }],
    }),

    // Admin: Get all page contents
    adminGetAllPageContents: builder.query<PageContentsResponse, void>({
      query: () => '/page-content/admin/all',
      providesTags: ['PageContent'],
    }),

    // Admin: Get page content by ID
    adminGetPageContentById: builder.query<PageContentResponse, string>({
      query: (id) => `/page-content/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'PageContent', id }],
    }),

    // Admin: Create page content
    createPageContent: builder.mutation<PageContentResponse, Partial<PageContent>>({
      query: (data) => ({
        url: '/page-content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PageContent'],
    }),

    // Admin: Update page content
    updatePageContent: builder.mutation<PageContentResponse, { id: string; data: Partial<PageContent> }>({
      query: ({ id, data }) => ({
        url: `/page-content/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PageContent', id }, 'PageContent'],
    }),

    // Admin: Delete page content
    deletePageContent: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/page-content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PageContent'],
    }),
  }),
});

export const {
  useGetPageContentQuery,
  useAdminGetAllPageContentsQuery,
  useAdminGetPageContentByIdQuery,
  useCreatePageContentMutation,
  useUpdatePageContentMutation,
  useDeletePageContentMutation,
} = pageContentApi;

