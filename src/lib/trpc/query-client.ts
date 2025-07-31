import { QueryCache, QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import SuperJSON from 'superjson'

export const createQueryClient = () =>
    new QueryClient({
        queryCache: new QueryCache({
            onError: (error) => {
                toast.error(error.message)
            },
        }),
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                refetchOnWindowFocus: false,
                retry: false,
                staleTime: 30 * 1000,
            },
            dehydrate: {
                serializeData: SuperJSON.serialize,
                shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
            },
            hydrate: {
                deserializeData: SuperJSON.deserialize,
            },
        },
    })
