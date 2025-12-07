import { apiSlice } from './apiSlice';

export interface DemoClass {
  _id: string;
  courseId: any;
  batchId?: any;
  locationId?: any;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  instructorId: any;
  maxAttendees: number;
  registeredCount: number;
  price?: number;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface DemoClassRegistration {
  _id: string;
  demoClassId: DemoClass;
  userId?: string | any;
  name: string;
  email: string;
  phone: string;
  status: 'registered' | 'attended' | 'cancelled';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  orderId?: string | any;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface RegisterDemoClassRequest {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export const demoClassApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDemoClasses: builder.query<{ demoClasses: DemoClass[] }, any>({
      query: (params) => ({
        url: '/demo-classes',
        params,
      }),
      providesTags: ['DemoClass'],
    }),
    getDemoClassById: builder.query<{ demoClass: DemoClass; isRegistered: boolean }, string>({
      query: (id) => `/demo-classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'DemoClass', id }],
    }),
    registerForDemoClass: builder.mutation<
      { message: string; registration: DemoClassRegistration; order?: any; requiresPayment: boolean },
      { id: string; data: RegisterDemoClassRequest }
    >({
      query: ({ id, data }) => ({
        url: `/demo-classes/${id}/register`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DemoClass', 'User', 'Order'],
    }),
    getUserRegistrations: builder.query<{ registrations: DemoClassRegistration[] }, void>({
      query: () => '/demo-classes/user/registrations',
      providesTags: ['DemoClass'],
      // Polling will be enabled in the component if needed
    }),
    cancelRegistration: builder.mutation<{ message: string; registration: DemoClassRegistration }, string>({
      query: (id) => ({
        url: `/demo-classes/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['DemoClass', 'User'],
    }),
  }),
});

export const {
  useGetDemoClassesQuery,
  useGetDemoClassByIdQuery,
  useRegisterForDemoClassMutation,
  useGetUserRegistrationsQuery,
  useCancelRegistrationMutation,
} = demoClassApi;

