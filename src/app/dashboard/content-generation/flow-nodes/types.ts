import { MetaOutputSchema } from "@/app/dashboard/content-generation/types";
import type { BuiltInNode, Node } from '@xyflow/react';
import { AIModelWithProviderAndSettings } from "@/db/types";
import { z } from "zod";

export type AIStreamNodeType = Node<{
    model: AIModelWithProviderAndSettings
    stream: z.infer<typeof MetaOutputSchema>
    label: string
}, 'ai-stream'>

export type CompareAgentNodeType = Node<{
    label: string
    inputs: string[]
    output: string
}, 'compare-agent'>

export type ToneAgentNodeType = Node<{
    label: string
    input: string
    output: string
    tone: 'professional' | 'casual' | 'humorous' | 'formal'
}, 'tone-agent'>

export type CustomNodeType = BuiltInNode | AIStreamNodeType | CompareAgentNodeType | ToneAgentNodeType;
