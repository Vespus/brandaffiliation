import { ComboboxBase } from "@/components/ui/combobox-base";
import { api } from "@/lib/trpc/react";
import { QSPayCategory } from "@/qspay-types";
import { SelectProps } from "@radix-ui/react-select";
import { ArrowRightIcon } from "lucide-react";

const flat = (arr: QSPayCategory[]): QSPayCategory[] => arr.flatMap(({
                                                                         children,
                                                                         ...rest
                                                                     }) => [rest, ...(children ? flat(children) : [])]);

type CategorySelectProps = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: string;
    onValueChange?: (value?: string | number) => void;
}

export const CategorySelect = ({value, onValueChange}: CategorySelectProps) => {
    const {data} = api.qspayRoute.getAllCategories.useQuery()
    const dataSet = flat(data || []);

    return (
        <ComboboxBase
            labelKey="description"
            valueKey="id"
            data={dataSet || []}
            value={value}
            onValueChange={onValueChange}
            placeholder="Select a Category"
            emptyPlaceholder="No category selected"
            itemRenderer={item => {
                const parent = data?.find(cat => cat.id === item.parentId);
                return (
                    <div className="flex items-center gap-2">
                        {parent && <span className="text-xs text-muted-foreground inline-flex items-center gap-1">{parent.description} <ArrowRightIcon size={12} className="size-auto" /></span>}
                        <span>{item.description}</span>
                    </div>
                )
            }}
        />
    )
}