import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

export const useContentGenerationQueryParams = (options?: { shallow: boolean }) => {
    const [params, setParams] = useQueryStates(
        {
            category: parseAsString,
            brand: parseAsString,
            selectedStream: parseAsInteger,
        },
        { ...options, throttleMs: 50 }
    )

    return {
        ...params,
        setParams,
    }
}
