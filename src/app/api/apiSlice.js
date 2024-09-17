import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logOut } from '../../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3500',
  credentials: 'include', // send httpOnly cookie (refreshToken)
  prepareHeaders: (headers, {getState}) => {
    const token = getState().auth.token; // accessToken
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers;
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  // 401 - unauthorized (no accessToken at all); 403 - forbidden (accessToken is expired)
  if (result?.error?.originalStatus === 403) {
    // sending refreshToken to receive new accessToken
    console.log('sending refresh token');
    const refreshResult = await baseQuery('/refresh', api, extraOptions);
    console.log("REFRESH RESULT: ", refreshResult);
    if (refreshResult?.data) {
      const user = api.getState().auth.user;
      // store the new accessToken
      api.dispatch(setCredentials({...refreshResult.data, user}))
      // retry the original query with new accessToken
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut())
    }
  }
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({})
})