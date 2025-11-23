import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/config';
import type { RootState } from '../store';
import { setCredentials, logout } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;
    const currentUser = state.auth.user;

    if (!refreshToken || !currentUser) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data && typeof refreshResult.data === 'object') {
      const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as {
        accessToken: string;
        refreshToken: string;
      };

      api.dispatch(
        setCredentials({
          user: currentUser,
          accessToken,
          refreshToken: newRefreshToken,
        })
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Course', 'User', 'Order', 'Ebook', 'LiveSession', 'Notification', 'Feedback', 'Blog', 'Banner'],
  endpoints: () => ({}),
});

