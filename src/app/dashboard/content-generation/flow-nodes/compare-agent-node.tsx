import { CompareAgentNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import { BaseHandle } from "@/components/base-handle";
import { BaseNode } from "@/components/base-node";
import { NodeProps, Position } from "@xyflow/react";
import { GitCompareIcon } from "lucide-react";

export const CompareAgentNode = ({data, isConnectable}: NodeProps<CompareAgentNodeType>) => {
    return (
        <BaseNode className="max-w-prose shadow-lg">
            <div className="p-5 -mt-5 -mx-5 flex flex-col bg-muted rounded-t-md mb-4">
                <div className="flex items-center gap-2">
                    <GitCompareIcon className="w-5 h-5" />
                    <h3 className="font-semibold">{data.label}</h3>
                </div>
            </div>
            <BaseHandle id="target-1" type="target" position={Position.Top} isConnectable={isConnectable}/>
            <BaseHandle id="target-2" type="target" position={Position.Top} isConnectable={isConnectable} style={{ left: '50%' }}/>
            <div className="prose prose-sm dark:prose-invert">
                <p>Compare and analyze multiple AI-generated contents</p>
            </div>
            <BaseHandle id="source" type="source" position={Position.Bottom} isConnectable={isConnectable}/>
        </BaseNode>
    )
} 