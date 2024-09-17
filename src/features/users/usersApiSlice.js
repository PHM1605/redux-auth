import { apiSlice } from "../../app/api/apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => '/users',
      keepUnusedDataFor: 5 // cache users data for 5s with rtk-query
    })
  })
})

export const {
  useGetUsersQuery
} = usersApiSlice