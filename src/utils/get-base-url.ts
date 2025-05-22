import { env } from "@/env";

export function getBaseUrl() {
    if (typeof window !== "undefined") return window.location.origin;
    if (env.HOSTNAME) return `https://${env.HOSTNAME}`;
    return `http://localhost:${env.PORT ?? 3000}`;
}
