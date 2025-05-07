import { create } from 'zustand'
import { AIModelWithProviderAndSettings } from "@/db/schema";
import { CustomNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import { applyNodeChanges, OnEdgesChange, OnConnect, OnNodesChange, applyEdgeChanges, addEdge, Edge } from "@xyflow/react";

interface ContentGenerationStoreType {
    nodes: CustomNodeType[]
    edges: Edge[];
    progressState: "loading" | "idle" | "started" | "complete",
    models: AIModelWithProviderAndSettings[]
    onNodesChange: OnNodesChange<CustomNodeType>
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    updateStreams: (model: AIModelWithProviderAndSettings, stream: string) => void
    updateModels: (models: AIModelWithProviderAndSettings[]) => void,
    setNodes: (nodes: CustomNodeType[]) => void;
    setEdges: (edges: Edge[]) => void;
    setProgressState: (state: "loading" | "started" | "idle" | "complete") => void
}

export const useContentGenerationStore = create<ContentGenerationStoreType>((set, get) => ({
    nodes: [],
    models: [],
    edges: [],
    progressState: "idle",
    setProgressState: (state) => set({progressState: state}),
    //{...prev, [model]: (prev?.[model] || "") + value},
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
        set({ nodes });
    },
    setEdges: (edges) => {
        set({ edges });
    },
    updateStreams: (model: AIModelWithProviderAndSettings, stream: string) =>
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
                            stream: newNodes[existingNodeIndex].data.stream + stream
                        }
                    }
                }

                return {nodes: [...newNodes]}
            }
        ),
    updateModels: (models: AIModelWithProviderAndSettings[]) => set({models}),
}))