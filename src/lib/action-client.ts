import { createSafeActionClient } from 'next-safe-action'

import { SoftHttpError } from '@/lib/soft-http-error'

export const actionClient = createSafeActionClient({
    handleServerError: (e, utils) => {
        if (e instanceof SoftHttpError) {
            return e.message
        }

        console.error('Action server error occurred')
        console.error('_________ERROR________')
        console.error(e.message)
        console.error('_________INPUT________')
        console.error(JSON.stringify(utils.clientInput, null, 2))
        console.error('_________STACK________')
        console.error(e.stack)

        return e.message
    },
    throwValidationErrors: true,
})
