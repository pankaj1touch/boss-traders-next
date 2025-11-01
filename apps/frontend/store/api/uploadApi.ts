import { apiSlice } from './apiSlice';

export interface UploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  fileName: string;
}

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
        prepareHeaders: (headers) => {
          // Content-Type will be set automatically for FormData
          return headers;
        },
      }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
