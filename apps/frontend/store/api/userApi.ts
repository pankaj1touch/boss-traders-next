import { apiSlice } from './apiSlice';

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  verified: boolean;
  avatarUrl?: string;
}

export interface InstructorsResponse {
  instructors: User[];
}

export interface UsersResponse {
  users: User[];
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstructors: builder.query<InstructorsResponse, void>({
      query: () => '/users/instructors',
      providesTags: ['User'],
    }),
    getAllUsers: builder.query<UsersResponse, { role?: string; search?: string }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetInstructorsQuery, useGetAllUsersQuery } = userApi;

