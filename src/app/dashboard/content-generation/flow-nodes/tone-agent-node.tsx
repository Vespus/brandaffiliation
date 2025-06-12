import { ToneAgentNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import { BaseHandle } from "@/components/base-handle";
import { BaseNode } from "@/components/base-node";
import { NodeProps, Position } from "@xyflow/react";
import { MessageSquareIcon } from "lucide-react";

export const ToneAgentNode = ({data, isConnectable}: NodeProps<ToneAgentNodeType>) => {
    return (
        <BaseNode className="max-w-prose shadow-lg">
            <div className="p-5 -mt-5 -mx-5 flex flex-col bg-muted rounded-t-md mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquareIcon className="w-5 h-5" />
                    <h3 className="font-semibold">{data.label}</h3>
                </div>
            </div>
            <BaseHandle id="target" type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div className="prose prose-sm dark:prose-invert">
                <p>Adjust content tone to: {data.tone}</p>
            </div>
            <BaseHandle id="source" type="source" position={Position.Bottom} isConnectable={isConnectable}/>
        </BaseNode>
    )
} 