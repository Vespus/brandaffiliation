import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { getBaseUrl } from '@/utils/get-base-url'

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: getBaseUrl(),
    plugins: [adminClient()],
})
