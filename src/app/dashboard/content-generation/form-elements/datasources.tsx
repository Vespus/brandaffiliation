import { DataSourceSelector } from "@/app/dashboard/content-generation/form-elements/datasource-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, XIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DataSourceValueSelector } from "./datasource-value-selector";

export const DataSources = () => {
    const form = useFormContext()
    const {fields, append, remove} = useFieldArray({
        name: "dataSources",
        control: form.control
    });


    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="my-4"
                onClick={() => append({
                    datasourceId: undefined,
                    datasourceValueId: undefined,
                    datasourcePrompt: ""
                })}
            >
                <PlusIcon/>
                Add Data Source
            </Button>
            <div className="space-y-4">
                {
                    fields.map((field, index) => (
                        <Card key={field.id}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">

                                </div>
                                <FormField
                                    control={form.control}
                                    name={`dataSources.${index}.datasourcePrompt`}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Source Prompt</FormLabel>
                                            <Textarea
                                                {...field}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Prompt to append to the system prompt"
                                            />
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                >
                                    <XIcon/> Remove
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                }
            </div>
        </div>
    )
}

const Preview = ({value, index}: {value: string, index: number}) => {
    const form = useFormContext()
    const fieldValues = form.watch("dataSources")

    return (
        <div>
            Preview of your input :
            {fieldValues[index].datasourcePrompt}
        </div>
    )
}