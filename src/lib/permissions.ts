import { createAccessControl } from "better-auth/plugins/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    contentGeneration: ["create", "list", "delete"],
    prompt: ["create", "list", "delete"],
    users: ["create", "list", "delete"],
    user: ["list", "set-role", "ban", "create"]
} as const;

export const ac = createAccessControl(statement);
export const user = ac.newRole({
    contentGeneration: ["create", "list"],
});

export const admin = ac.newRole({
    contentGeneration: ["create", "list", "delete"],
    prompt: ["create", "list", "delete"],
    users: ["create", "list", "delete"],
    user: ["list", "set-role", "ban", "create"]
});