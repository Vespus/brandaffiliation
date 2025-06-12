"use client"

import { FlowSidebar } from "@/app/dashboard/content-generation/flow-elements/flow-sidebar";
import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import {
    ReactFlow,
    Background,
    Controls,
    useReactFlow,
    Node,
    Edge
} from '@xyflow/react';
import { useCallback, useEffect, } from "react";
import { AIStreamNode } from "@/app/dashboard/content-generation/flow-nodes/ai-stream-node";
import { CompareAgentNode } from "@/app/dashboard/content-generation/flow-nodes/compare-agent-node";
import { ToneAgentNode } from "@/app/dashboard/content-generation/flow-nodes/tone-agent-node";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

import '@xyflow/react/dist/style.css';
import { CustomNodeType, CompareAgentNodeType, ToneAgentNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import ELK, { ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';

const nodeTypes = {
    "ai-stream": AIStreamNode,
    "compare-agent": CompareAgentNode,
    "tone-agent": ToneAgentNode
};

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

export const FlowStudio = () => {
    const state = useContentGenerationStore();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');
            const createNodeStr = event.dataTransfer.getData('createNode');

            if (typeof type === 'undefined' || !type || !createNodeStr) {
                return;
            }

            const createNode = JSON.parse(createNodeStr);
            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            const newNode = createNode(position.x, position.y);
            state.addNode(newNode);
        },
        [state]
    );


    return (
        <div className="flex-1 h-full relative flex">
            <FlowSidebar />
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={state.nodes}
                    edges={state.edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={state.onNodesChange}
                    onEdgesChange={state.onEdgesChange}
                    onConnect={state.onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    fitView
                >
                    <ActualFlow/>
                </ReactFlow>
            </div>
        </div>
    )
}

const ActualFlow = () => {
    const {getLayoutedElements} = useLayoutedElements();
    const state = useContentGenerationStore();
    const { getNode, getNodes, getEdges } = useReactFlow();

    useEffect(() => {
        if(state.progressState === 'complete') {
            getLayoutedElements({
                'elk.algorithm': 'layered',
                'elk.direction': 'RIGHT',
            })
        }
    }, [state.progressState]);

    const onRun = useCallback(() => {
        const nodes = getNodes() as CustomNodeType[];
        const edges = getEdges();

        // Process nodes in order based on connections
        const processNode = (nodeId: string, visited = new Set<string>()): any => {
            if (visited.has(nodeId)) return null;
            visited.add(nodeId);

            const node = nodes.find(n => n.id === nodeId);
            if (!node) return null;

            // Get input nodes
            const inputEdges = edges.filter(e => e.target === nodeId);
            const inputs = inputEdges.map(edge => processNode(edge.source, visited));

            // Process based on node type
            switch (node.type) {
                case 'compare-agent':
                    // Compare the inputs and generate output
                    const compareNode = node as CompareAgentNodeType;
                    compareNode.data.output = `Comparison of ${inputs.length} contents`;
                    return compareNode.data.output;

                case 'tone-agent':
                    // Adjust tone of input
                    const toneNode = node as ToneAgentNodeType;
                    toneNode.data.output = `Content adjusted to ${toneNode.data.tone} tone`;
                    return toneNode.data.output;

                case 'ai-stream':
                    return node.data.stream;

                default:
                    return null;
            }
        };

        // Find root nodes (nodes with no incoming edges)
        const rootNodes = nodes.filter(node =>
            !edges.some(edge => edge.target === node.id)
        );

        // Process each root node
        rootNodes.forEach(node => processNode(node.id));

        // Update nodes with results
        state.setNodes(nodes);
    }, [getNodes, getEdges, state]);


    return (
        <>
            <Background/>
            <Controls/>
            <div className="absolute top-4 right-4 z-10">
                <Button onClick={onRun} className="gap-2">
                    <PlayIcon className="w-4 h-4" />
                    Run Flow
                </Button>
            </div>
        </>
    )
}
