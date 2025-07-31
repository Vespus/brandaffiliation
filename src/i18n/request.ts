import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

import { defaultTranslations, getTranslations } from './translations'

// Define supported locales
const supportedLocales = ['en', 'de', 'es']

// Helper function to check if a locale is supported
const isLocaleSupported = (locale: string | undefined | null): boolean => {
    return !!locale && supportedLocales.includes(locale)
}

export default getRequestConfig(async () => {
    // Priority 1: Check for locale cookie
    const cookieList = await cookies()
    const headerList = await headers()

    const cookieLocale = cookieList.get('locale')?.value
    const acceptLanguage = headerList.get('Accept-Language')
    const browserLocale = acceptLanguage ? acceptLanguage.split(',')[0].split('-')[0] : null

    let locale = 'en'

    if (isLocaleSupported(cookieLocale)) {
        locale = cookieLocale!
    } else if (isLocaleSupported(browserLocale)) {
        locale = browserLocale!
    }

    try {
        const messages = await getTranslations(locale)

        const finalMessages = Object.keys(messages).length > 0 ? messages : defaultTranslations

        return {
            locale,
            messages: finalMessages,
        }
    } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error)
        locale = 'en'
        try {
            const messages = await getTranslations(locale)
            return {
                locale,
                messages: Object.keys(messages).length > 0 ? messages : defaultTranslations,
            }
        } catch {
            // If all else fails, use default translations
            return {
                locale,
                messages: defaultTranslations,
            }
        }
    }
})
