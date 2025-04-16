import {HookBaseUtils, HookSafeActionFn, HookCallbacks, UseActionHookReturn, useAction} from "next-safe-action/hooks";
import {toast} from "sonner";
import {Schema} from "next-safe-action/adapters/types";

export const useCustomAction = <
    ServerError,
    S extends Schema | undefined,
    const BAS extends readonly Schema[],
    CVE,
    CBAVE,
    Data,
>(
    safeActionFn: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>,
    utils?: HookBaseUtils<S> & HookCallbacks<ServerError, S, BAS, CVE, CBAVE, Data>
): UseActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data> => {
    return useAction(safeActionFn, {
        onSuccess: utils?.onSuccess,
        onError: (errorShape) => {
            if(errorShape.error.serverError && typeof errorShape.error.serverError === 'string'){
                toast.error(errorShape.error.serverError);
            }

            utils?.onError?.(errorShape);
        }
    });
}

