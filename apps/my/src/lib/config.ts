/**
 * Centralized configuration for the app.
 * All environment variables should be accessed through this module.
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

// API paths
export const API_PATHS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    SIGNUP: '/v1/auth/signup',
    REFRESH: '/v1/auth/refresh',
    LOGOUT: '/v1/auth/logout',
  },
  HEALTH: '/v1/health',
} as const
