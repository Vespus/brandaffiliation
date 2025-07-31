import { NextRequest, NextResponse } from 'next/server'

import { getStore } from '@/utils/get-store'

export default async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    try {
        const store = await getStore()
        //ignore store, we only need it for catching error
        void store
    } catch (_) {
        // ignore error

        const redirect = NextResponse.redirect(request.nextUrl.clone())

        redirect.cookies.delete('qs-pay-store-id')
        redirect.cookies.delete('qs-pay-integration-key')

        console.info('Removed qs-pay integration key')

        return redirect
    }

    return response
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|public/|favicon.ico|robots.txt|sitemap.xml|manifest.json|.well-known).*)',
    ],
}
