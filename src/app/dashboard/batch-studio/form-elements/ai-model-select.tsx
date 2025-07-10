import {api} from "@/lib/trpc/react";
import {ComboboxBase} from "@/components/ui/combobox-base";
import {ArrowRightIcon} from "lucide-react";
import {SelectProps} from "@radix-ui/react-select";

type AIModelSelectType = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number;
    onValueChange?: (value?: string | number) => void;
}

export const AiModelSelect = ({value, onValueChange}: AIModelSelectType) => {
    const {data} = api.genericRoute.getAIModels.useQuery()

    return (
        <ComboboxBase
            labelKey="name"
            valueKey="id"
            data={data || []}
            value={value}
            onValueChange={onValueChange}
            valueAs="number"
            itemRendererContainerHeight={45}
            placeholder="Select an AI Model"
            emptyPlaceholder="No AI Model selected"
            itemRenderer={item => {
                return (
                    <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">{item.description} <ArrowRightIcon size={12} className="size-auto" /></span>
                    </div>
                )
            }}
        />
    )
}