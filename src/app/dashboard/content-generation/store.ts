import { CustomNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import { MetaOutput } from "@/app/dashboard/content-generation/types";
import { AIModelWithProviderAndSettings } from '@/db/types';
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Edge,
    OnConnect,
    OnEdgesChange,
    OnNodesChange
} from "@xyflow/react";
import { create } from 'zustand'

interface ContentGenerationStoreType {
    nodes: CustomNodeType[]
    edges: Edge[];
    progressState: string | "loading" | "idle" | "started" | "complete",
    models: AIModelWithProviderAndSettings[]
    onNodesChange: OnNodesChange<CustomNodeType>
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    updateStreams: (model: AIModelWithProviderAndSettings, stream: MetaOutput) => void
    updateModels: (models: AIModelWithProviderAndSettings[]) => void,
    setNodes: (nodes: CustomNodeType[]) => void;
    setEdges: (edges: Edge[]) => void;
    setProgressState: (state: "loading" | "started" | "idle" | "complete") => void;
    addNode: (node: CustomNodeType) => void;
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

export const useContentGenerationStore = create<ContentGenerationStoreType>((set, get) => ({
    ...initialState,
    setProgressState: (state) => set({progressState: state}),
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    setNodes: (nodes) => {
        set({nodes});
    },
    setEdges: (edges) => {
        set({edges});
    },
    addNode: (node) => {
        set((state) => ({
            nodes: [...state.nodes, node]
        }));
    },
    updateStreams: (model: AIModelWithProviderAndSettings, stream: MetaOutput) => {
        set(
            (state) => {
                const newNodes = [...state.nodes]
                const existingNodeIndex = newNodes.findIndex(node => node.type === "ai-stream" && node.id === model.id.toString())
                if (existingNodeIndex === -1) {
                    newNodes.push({
                        id: model.id.toString(),
                        type: "ai-stream",
                        data: {model, stream, label: model.name || "Unknown Model"},
                        position: {x: 0, y: 0}
                    })
                } else if (newNodes[existingNodeIndex].type === "ai-stream") {
                    newNodes[existingNodeIndex] = {
                        ...newNodes[existingNodeIndex],
                        data: {
                            ...newNodes[existingNodeIndex].data,
                            stream: stream
                        }
                    }
                }

                return {nodes: [...newNodes]}
            }
        )
    },
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