"use client";

import { useController, Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatasourceSelect } from "./datasource-select";
import { DatasourceMultiSelect } from "./datasource-multi-select";

interface DatasourceFieldProps {
    name: string;
    control: Control<any>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function DatasourceField({
    name,
    control,
    label,
    placeholder,
    disabled = false,
}: DatasourceFieldProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <DatasourceSelectWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={placeholder}
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface DatasourceSelectWrapperProps {
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
    disabled?: boolean;
}

function DatasourceSelectWrapper({
    value,
    onChange,
    placeholder,
    disabled,
}: DatasourceSelectWrapperProps) {
    // If value is an object with datasourceId and values, it's a multi-select
    const isMultiValue = value && typeof value === 'object' && 'datasourceId' in value && Array.isArray(value.values);
    
    if (isMultiValue) {
        return (
            <DatasourceMultiSelect
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
            />
        );
    }
    
    return (
        <DatasourceSelect
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}