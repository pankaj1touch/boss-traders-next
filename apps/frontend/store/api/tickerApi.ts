import { apiSlice } from './apiSlice';

export const tickerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTickers: builder.query({
            query: () => '/tickers',
            providesTags: ['Ticker'],
        }),
        getAdminTickers: builder.query({
            query: () => '/tickers/admin',
            providesTags: ['Ticker'],
        }),
        createTicker: builder.mutation({
            query: (body) => ({
                url: '/tickers',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Ticker'],
        }),
        updateTicker: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/tickers/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Ticker'],
        }),
        deleteTicker: builder.mutation({
            query: (id) => ({
                url: `/tickers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Ticker'],
        }),
    }),
});

export const {
    useGetTickersQuery,
    useGetAdminTickersQuery,
    useCreateTickerMutation,
    useUpdateTickerMutation,
    useDeleteTickerMutation,
} = tickerApi;
