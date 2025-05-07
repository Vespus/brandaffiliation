import {SelectProps} from "@radix-ui/react-select";
import {api} from "@/lib/trpc/react";
import {Check, ChevronsUpDown} from "lucide-react";
import {ProviderIcon} from "@/app/dashboard/content-generation/form-elements/provider-icon";
import {
    Combobox,
    ComboboxAnchor,
    ComboboxBadgeList,
    ComboboxBadgeItem,
    ComboboxInput,
    ComboboxTrigger,
    ComboboxContent,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import {ComboboxItem, ComboboxItemIndicator} from "@diceui/combobox";

type AIModelSelectType = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number[];
    onValueChange?: (value?: number[]) => void;
}

export const AIModelSelect = ({value, onValueChange}: AIModelSelectType) => {
    const {data} = api.genericRoute.getAIModels.useQuery()

    return (
        <Combobox
            value={value?.map(x => x.toString()) || []}
            onValueChange={(val) => onValueChange?.(val.map(x => Number(x)))}
            className="w-full"
            multiple
            autoHighlight
        >
            <ComboboxAnchor className="h-full min-h-10 flex-wrap px-3 py-2">
                <ComboboxBadgeList>
                    {value?.map((item) => {
                        const option = data?.find((model) => model.id === item);
                        if (!option) return null;

                        return (
                            <ComboboxBadgeItem key={item} value={item.toString()}>
                                {option.name}
                            </ComboboxBadgeItem>
                        );
                    })}
                </ComboboxBadgeList>
                <ComboboxInput
                    placeholder="Select AI Models..."
                    className="h-auto min-w-20 flex-1"
                />
                <ComboboxTrigger className="absolute top-3 right-2">
                    <ChevronsUpDown className="size-4"/>
                </ComboboxTrigger>
            </ComboboxAnchor>
            <ComboboxContent>
                <ComboboxEmpty>No AI Model found.</ComboboxEmpty>
                {data?.map((model) => (
                    <ComboboxItem
                        key={model.id}
                        value={model.id.toString()}
                        role="button"
                        label={model.name}
                        className="flex relative w-full py-1.5 pr-2 pl-8 hover:bg-accent"
                    >
                       <span className="absolute top-2 left-2 flex items-center justify-center rounded">
                           <ComboboxItemIndicator>
                               <Check className="size-4"/>
                           </ComboboxItemIndicator>
                       </span>
                        <div className="flex flex-col space-y-0.5 px-2">
                            <div className="flex items-center space-x-2">
                                <ProviderIcon providerCode={model.provider.code}/>
                                <span>{model.name}</span>
                            </div>
                            {
                                model.description &&
                                <span className="text-muted-foreground text-xs min-w-0 truncate">{model.description}</span>
                            }
                        </div>
                    </ComboboxItem>
                ))}
            </ComboboxContent>
        </Combobox>
    )
}