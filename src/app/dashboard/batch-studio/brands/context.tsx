"use client"

import React, {ReactNode, useState} from "react";


export type ContentGenerationProps = {
    selectedEntities: number[],
    setSelectedEntities: (ent) => void
}
export type UserProviderProps = {
    children: ReactNode | ReactNode[]
}

export const BatchStudioContext = React.createContext<ContentGenerationProps | null>(null)

export const BatchStudioContextProvider: React.FC<UserProviderProps> = ({children}) => {
    const [selectedEntities, setSelectedEntities] = useState([])

    return (
        <BatchStudioContext.Provider value={{selectedEntities, setSelectedEntities}}>
            {children}
        </BatchStudioContext.Provider>
    )
}

export const useBatchStudioContext = () => {
    const context = React.useContext(BatchStudioContext)
    if (!context) {
        throw new Error("useBatchStudioContext must be used within a BatchStudioContext")
    }

    return context
}