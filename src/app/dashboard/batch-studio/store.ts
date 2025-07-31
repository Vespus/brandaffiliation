import { create } from 'zustand'

interface DataTableSelectionStoreType {
    selected: Record<string, boolean>
    setSelected: (row: Record<string, boolean>) => void
}

const initialState = {
    selected: {},
}

export const useDataTableSelectionStore = create<DataTableSelectionStoreType>((set) => ({
    ...initialState,
    setSelected: (row: Record<string, boolean>) => set({ selected: row }),
}))
