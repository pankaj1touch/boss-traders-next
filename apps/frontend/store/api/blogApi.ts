import { apiSlice } from './apiSlice';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  category: 'technology' | 'business' | 'education' | 'lifestyle' | 'news' | 'tutorials';
  tags: string[];
  publishStatus: 'draft' | 'published' | 'archived';
  publishedAt: string;
  views: number;
  likes: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  success: boolean;
  blogs: Blog[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'featured';
  publishStatus?: 'draft' | 'published' | 'archived';
}

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<BlogsResponse, BlogQueryParams>({
      query: (params) => ({
        url: '/blogs',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getBlogBySlug: builder.query<{ success: boolean; blog: Blog }, string>({
      query: (slug) => `/blogs/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),
    getRelatedBlogs: builder.query<{ blogs: Blog[] }, { slug: string; limit?: number }>({
      query: ({ slug, limit = 4 }) => `/blogs/related/${slug}?limit=${limit}`,
    }),
    // Admin endpoints
    adminGetBlogs: builder.query<BlogsResponse, BlogQueryParams>({
      query: (params) => ({
        url: '/blogs/admin/all',
        params,
      }),
      providesTags: ['Blog'],
    }),
    adminGetBlogById: builder.query<{ success: boolean; blog: Blog }, string>({
      query: (id) => `/blogs/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),
    createBlog: builder.mutation<{ success: boolean; blog: Blog; message: string }, any>({
      query: (blogData) => ({
        url: '/blogs',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: ['Blog'],
    }),
    updateBlog: builder.mutation<{ success: boolean; blog: Blog; message: string }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/blogs/admin/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blog'],
    }),
    deleteBlog: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/blogs/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
  useGetRelatedBlogsQuery,
  useAdminGetBlogsQuery,
  useAdminGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
