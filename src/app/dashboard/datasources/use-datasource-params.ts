import {parseAsBoolean, parseAsInteger, useQueryStates} from "nuqs";

export const useDatasourceParams = (options?: { shallow: boolean }) => {
    const [params, setParams] = useQueryStates({
        createDatasource: parseAsBoolean,
        editDatasource: parseAsInteger,
    }, {...options, throttleMs: 50})

    return {
        ...params,
        setParams
    }
}