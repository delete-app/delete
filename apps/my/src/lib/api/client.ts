import createFetchClient from 'openapi-fetch'
import createQueryClient from 'openapi-react-query'
import type { paths } from './schema'
import { config } from '../config'

/**
 * Single typed fetch client for direct API calls.
 * Use this for non-React contexts (e.g., auth context).
 */
export const fetchClient = createFetchClient<paths>({
  baseUrl: config.apiUrl,
})

/**
 * React Query hooks for API calls.
 * Use this in React components for automatic caching, refetching, etc.
 */
export const $api = createQueryClient(fetchClient)
