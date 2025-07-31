'use client'

import React, { ReactNode } from 'react'

import { QSPayStore } from '@/qspay-types'

export type ContentGenerationProps = {
    store: QSPayStore
}
export type UserProviderProps = ContentGenerationProps & {
    children: ReactNode | ReactNode[]
}

export const ContentGenerationContext = React.createContext<ContentGenerationProps | null>(null)

export const ContentGenerationProvider: React.FC<UserProviderProps> = ({ children, store }) => {
    return <ContentGenerationContext.Provider value={{ store }}>{children}</ContentGenerationContext.Provider>
}

export const useContentGenerationContext = () => {
    const context = React.useContext(ContentGenerationContext)
    if (!context) {
        throw new Error('useContentGenerationContext must be used within a ContentGenerationContext')
    }

    return context
}
