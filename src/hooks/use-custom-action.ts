import { HookCallbacks, HookSafeActionFn, UseActionHookReturn, useAction } from 'next-safe-action/hooks'

import { StandardSchemaV1 } from '@standard-schema/spec'
import { toast } from 'sonner'

export const useCustomAction = <ServerError, S extends StandardSchemaV1 | undefined, CVE, Data>(
    safeActionFn: HookSafeActionFn<ServerError, S, CVE, Data>,
    utils?: HookCallbacks<ServerError, S, CVE, Data>
): UseActionHookReturn<ServerError, S, CVE, Data> => {
    return useAction(safeActionFn, {
        ...utils,
        onError: (errorShape) => {
            console.log(errorShape)
            if (errorShape.error.serverError && typeof errorShape.error.serverError === 'string') {
                toast.error(errorShape.error.serverError)
            }

            utils?.onError?.(errorShape)
        },
    })
}
