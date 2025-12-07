import { apiSlice } from './apiSlice';

export interface Location {
  _id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  timezone?: string;
  capacity?: number;
  facilities?: string[];
  isActive: boolean;
}

export interface LocationsResponse {
  locations: Location[];
}

export const locationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<LocationsResponse, void>({
      query: () => '/locations',
      providesTags: ['Location'],
    }),
  }),
});

export const { useGetLocationsQuery } = locationApi;

