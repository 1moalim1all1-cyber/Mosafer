export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_PHONE: '/auth/verify-phone',
  },
  // Trips
  TRIPS: {
    LIST: '/trips',
    CREATE: '/trips',
    GET: (id: string) => `/trips/${id}`,
    UPDATE: (id: string) => `/trips/${id}`,
    SEARCH: '/trips/search',
  },
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    GET: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  // Users
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    GET: (id: string) => `/users/${id}`,
  },
  // Wallet
  WALLET: {
    GET_BALANCE: '/wallet',
    ADD_BALANCE: '/wallet/add',
    WITHDRAW: '/wallet/withdraw',
  },
};
