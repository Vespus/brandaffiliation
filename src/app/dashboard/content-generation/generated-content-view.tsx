"use client"

import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import {
    ReactFlow,
    Background,
    Controls,
    Edge, useReactFlow
} from '@xyflow/react';
import { useCallback, useEffect, } from "react";
import { AIStreamNode } from "@/app/dashboard/content-generation/flow-nodes/ai-stream-node";

import '@xyflow/react/dist/style.css';
import { CustomNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import ELK, { ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { Button } from "@/components/ui/button";

const nodeTypes = {"ai-stream": AIStreamNode};

const elk = new ELK();
const useLayoutedElements = () => {
    const {getNodes, setNodes, getEdges, fitView} = useReactFlow<CustomNodeType>();
    const defaultOptions: LayoutOptions = {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': "100",
        'elk.spacing.nodeNode': "80",
    };

    const getLayoutedElements = useCallback(async (options: LayoutOptions) => {
        const layoutOptions = {...defaultOptions, ...options};
        const graph: Omit<ElkNode, "children"> & {children: CustomNodeType[]} = {
            id: 'root',
            layoutOptions: layoutOptions,
            children: getNodes().map((node) => ({
                ...node,
                width: node.measured?.width || 840,
                height: node.measured?.height || 400,
            })),
            edges: getEdges().map(edge => ({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target]
            })),
        };

        const {children, edges} = await elk.layout(graph)
        if (!edges || !children) {
            return {
                nodes: [],
                edges: []
            };
        }

        children.forEach((node) => {
            node.position = { x: node?.x || 0, y: node?.y || 0 };
        });
        setNodes(children);

        fitView();
    }, []);

    return {getLayoutedElements};
};
export const GeneratedContentView = () => {
    const state = useContentGenerationStore()

    return (
        <div className="flex-1 h-full">
            <ReactFlow
                nodes={state.nodes}
                nodeTypes={nodeTypes}
                onNodesChange={state.onNodesChange}
                fitView
            >
                <ActualFlow/>
            </ReactFlow>

        </div>
    )
}

const ActualFlow = () => {
    const {getLayoutedElements} = useLayoutedElements();
    const state = useContentGenerationStore();

    useEffect(() => {
        if(state.progressState === 'complete' || state.progressState === 'loading') {
            getLayoutedElements({
                'elk.algorithm': 'layered',
                'elk.direction': 'RIGHT',
            })
        }
    }, [state.progressState]);

    return (
        <>
            <Background/>
            <Controls/>
        </>
    )
}

