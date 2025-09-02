'use client'

import React, { ReactNode, createContext, useContext } from 'react'

import { QSPayStore, QSPayUser } from '@/qspay-types'

type QSPayContextType = {
    user: QSPayUser | null
    currentStore?: QSPayStore | null
    storeList: QSPayStore[]
}

type QSPayContextProps = {
    user: QSPayUser | null
    children: ReactNode | ReactNode[]
    storeId?: string
}

const QSPayContext = createContext<QSPayContextType | undefined>(undefined)

export function QSPayContextProvider({ children, user, storeId }: QSPayContextProps) {
    let storeList: QSPayStore[] = []
    let currentStore: QSPayStore | undefined | null = null

    if(user) {
        storeList = user.companies[0]?.merchants[0]?.stores || []
        currentStore = storeList.length > 0 ? storeList.find(store => store.storeId === storeId) : null
        if (currentStore) {
            currentStore.storeUrl = currentStore?.storeUrl.replace(/\/$/, '')
        }
    }

    return <QSPayContext.Provider value={{ user, currentStore, storeList }}>{children}</QSPayContext.Provider>
}

export function useQSPayContext() {
    const context = useContext(QSPayContext)
    if (context === undefined) {
        throw new Error('useQSPayContext must be used within a QSPayContext')
    }
    return context
}
