import type { BuiltInNode, Node } from '@xyflow/react';
import { AIModelWithProviderAndSettings } from "@/db/schema";

export type AIStreamNodeType = Node<{
    model: AIModelWithProviderAndSettings
    stream: string
    label: string
}, 'ai-stream'>

export type CustomNodeType = BuiltInNode | AIStreamNodeType;
