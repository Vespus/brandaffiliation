import { MetaOutput } from "@/app/dashboard/content-generation/types";
import { AIModelWithProviderAndSettings } from '@/db/types';
import { create } from 'zustand'

interface ContentGenerationStoreType {
    progressState: string | "loading" | "idle" | "started" | "complete",
    models: AIModelWithProviderAndSettings[]
    updateModels: (models: AIModelWithProviderAndSettings[]) => void,
    setProgressState: (state: "loading" | "started" | "idle" | "complete") => void;
    saveStream: (model: AIModelWithProviderAndSettings, stream: MetaOutput) => void
    streams: Record<string, { model: AIModelWithProviderAndSettings, stream: MetaOutput }>
    selectedCategory?: number,
    selectedBrand?: number,
    reset: () => void
    setCategoryId: (id: number) => void
    setBrandId: (id: number) => void
}

const initialState = {
    nodes: [],
    streams: {},
    models: [],
    edges: [],
    selectedCategory: undefined,
    selectedBrand: undefined,
    progressState: "idle"
}

export const useContentGenerationStore = create<ContentGenerationStoreType>((set) => ({
    ...initialState,
    setProgressState: (state) => set({progressState: state}),
    updateModels: (models: AIModelWithProviderAndSettings[]) => set({models}),
    saveStream: (model: AIModelWithProviderAndSettings, stream: MetaOutput) => {
        set(
            (state) => {
                return {
                    streams: {
                        ...state.streams,
                        [model.id]: {
                            model,
                            stream
                        }
                    }
                }
            }
        )
    },
    setCategoryId: (id: number) => set({selectedCategory: id}),
    setBrandId: (id: number) => set({selectedBrand: id}),
    reset: () => {
        set(initialState)
    }
}))