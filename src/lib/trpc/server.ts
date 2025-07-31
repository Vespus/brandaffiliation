


import 'server-only'

import { cache } from 'react'

import { headers } from 'next/headers'

import type { AppRouter } from '@/lib/trpc/root'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { createCaller } from '@/lib/trpc/root'
import { createTRPCContext } from '@/lib/trpc/trpc'
import { createQueryClient } from './query-client'


const createContext = cache(async () => {
    const heads = new Headers(await headers())
    heads.set('x-trpc-source', 'rsc')

    return createTRPCContext({
        headers: heads,
    })
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)
export const { trpc: api } = createHydrationHelpers<AppRouter>(caller, getQueryClient)
