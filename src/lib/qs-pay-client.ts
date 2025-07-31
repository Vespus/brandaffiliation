import { env } from "@/env";
import { ForbiddenError } from "@/lib/forbidden-error";
import { SoftHttpError } from "@/lib/soft-http-error";
import { cookies } from "next/headers";

type ValidationError = {
    field: string;
    error: string;
}

type GenericResponse<T> = {
    code: string;
    succeeded: boolean;
    message: string | null;
    ticket: string | null;
    result: T;
    validationErrorList?: ValidationError[]
}

type Request = RequestInit & {
    query?: Record<string, string | number | boolean | undefined>
}

export async function QSPayClient<T>(path: string, init?: Request): Promise<GenericResponse<T>> {
    const cookieStore = await cookies()

    init = init ?? {}

    const {query, body, method} = init
    const uri = new URL(env.QSPAY_URL as string);
    uri.pathname = path;

    if (query) {
        Object.keys(query).forEach((key) => {
            uri.searchParams.append(key, query[key] as string)
        })
    }

    if ((method === 'GET' || !method) && cookieStore.has('qs-pay-store-id') && !uri.searchParams.has("storeId")) {
        uri.searchParams.append('storeId', cookieStore.get('qs-pay-store-id')!.value)
    }

    if (body && typeof body === 'string' && cookieStore.has('qs-pay-store-id')) {
        const _body = JSON.parse(body)
        if (!Array.isArray(_body) && !_body.storeId) {
            _body.storeId = cookieStore.get('qs-pay-store-id')!.value
            init.body = JSON.stringify(_body)
        }
    }

    const customHeaders = new Headers(init.headers)

    if (!customHeaders.has('Content-Type')) {
        customHeaders.append('Content-Type', 'application/json')
    }

    customHeaders.append('Accept', 'application/json')
    customHeaders.append("QsPayApi", env.QSPAY_API_KEY as string)
    customHeaders.append('QsPay-Lang', "de")
    customHeaders.append("X-User-Locale", "de")
    customHeaders.append("X-UserAgent", "BrandAffiliation / 1.0")

    if (cookieStore.get('qs-pay-integration-key')?.value) {
        customHeaders.append('Authorization', `Bearer ${cookieStore.get('qs-pay-integration-key')!.value}`)
    }

    init.headers = customHeaders
    const response = await fetch(uri.toString(), init);

    if (!response.ok) {
        console.error('Server-side fetch failed on URL', uri.toString())
        if(response.status === 403) {
            throw new ForbiddenError("Unauthorized, remove qs-pay integration auth keys")
        }

        if (response.headers.get('content-type')?.includes('application/json')) {
            const errorResponse = await response.json()
            console.error('Server-side fetch thrown an error. Full output of the response is:', errorResponse)
            throw new SoftHttpError(errorResponse.message)
        }

        const errorTextResponse = await response.text()
        console.error(
            'Server-side fetch thrown an error that is not **JSON**. Full output of the response is',
            errorTextResponse
        )

        throw new Error('Uncatchable error: ' + response.statusText)
    }

    const respo = await response.json() as GenericResponse<T>
    return respo;
}