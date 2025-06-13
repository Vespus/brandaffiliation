import {createSafeActionClient} from "next-safe-action";

export const actionClient = createSafeActionClient({
    handleServerError: (e, utils) => {
        console.error("Action server error occurred =>", e.message, "| Input =>", JSON.stringify(utils.clientInput, null, 2));
        console.error(e.stack)
        return e.message
    },
    throwValidationErrors: true
});