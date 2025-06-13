import { AIStreamNodeType } from "@/app/dashboard/content-generation/flow-nodes/types";
import { ProviderIcon } from "@/app/dashboard/content-generation/form-elements/provider-icon";
import { BaseHandle } from "@/components/base-handle";
import { BaseNode } from "@/components/base-node";
import { Legend } from "@/components/ui/legend";
import type { NodeProps } from '@xyflow/react';
import { Position } from "@xyflow/react";

export const AIStreamNode = ({data, isConnectable}: NodeProps<AIStreamNodeType>) => {
    console.log(data)
    return (
        <BaseNode className="max-w-prose shadow-lg">
            <div className="-mx-5 -mt-5 mb-4 flex flex-col rounded-t-md p-5 bg-muted">
                <div className="flex justify-between">
                    <h3 className="font-semibold">{data.model.name}</h3>
                    <div className="flex items-center space-x-2">
                        <ProviderIcon providerCode={data.model.provider.code!}/>
                        <span className="text-xs text-muted-foreground">{data.model.provider.name}</span>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">{data.model.description}</div>
            </div>
            <div className="">
                <div className="mb-2">
                    <Legend className="mb-2">Meta Information</Legend>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col space-y-1">
                            <h3 className="text-xs font-medium">Title:</h3>
                            <p className="text-xs text-muted-foreground">{data.stream?.meta?.title}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <h3 className="text-xs font-medium">Description:</h3>
                            <p className="text-xs text-muted-foreground">{data.stream?.meta?.description}</p>
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <Legend className="mb-2">Hero Content</Legend>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col space-y-1">
                            <h3 className="text-xs font-medium">Hero Header (Page Header Content):</h3>
                            <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{__html: data.stream?.descriptions?.header}}></p>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <h3 className="text-xs font-medium">Hero Footer (Page Bottom Content):</h3>
                            <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{__html: data.stream?.descriptions?.footer}}></p>
                        </div>
                    </div>
                </div>
            </div>
            <BaseHandle id="sourcer" type="source" position={Position.Bottom} isConnectable={isConnectable}/>
        </BaseNode>
    )
}