import { Position } from "@xyflow/react";
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from "@/components/base-node";
import { BaseHandle } from "@/components/base-handle";
import { AIStreamNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import { ProviderIcon } from "@/app/dashboard/content-generation/form-elements/provider-icon";

export const AIStreamNode = ({data, isConnectable}: NodeProps<AIStreamNodeType>) => {
    return (
        <BaseNode className="max-w-prose shadow-lg">

            <div className="p-5 -mt-5 -mx-5 flex flex-col bg-muted rounded-t-md mb-4">
                <div className="flex justify-between">
                    <h3 className="font-semibold">{data.model.name}</h3>
                    <div className="flex items-center space-x-2">
                        <ProviderIcon providerCode={data.model.provider.code!}/>
                        <span className="text-xs text-muted-foreground">{data.model.provider.name}</span>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">{data.model.description}</div>
            </div>
            <div className="prose prose-sm dark:prose-invert">

            </div>
            <BaseHandle id="target-1" type="target" position={Position.Bottom}/>

        </BaseNode>
    )
}