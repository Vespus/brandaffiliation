"use client"

import { QSPayStore } from "@/qspay-types";
import React, { ReactNode } from "react";

export type ContentGenerationProps = {
    store?: QSPayStore | null
}
export type UserProviderProps = ContentGenerationProps & {
    children: ReactNode | ReactNode[]
}

export const ContentGenerationContext = React.createContext<ContentGenerationProps | null>(null)

export const ContentGenerationProvider: React.FC<UserProviderProps> = ({children, store}) => {
    return (
        <ContentGenerationContext.Provider value={{store}}>
            {children}
        </ContentGenerationContext.Provider>
    )
}

export const useContentGenerationContext = () => {
    const context = React.useContext(ContentGenerationContext)
    if (!context) {
        throw new Error("useContentGenerationContext must be used within a ContentGenerationContext")
    }

    return context
}