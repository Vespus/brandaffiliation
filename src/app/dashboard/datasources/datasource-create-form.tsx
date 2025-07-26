"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomAction } from "@/hooks/use-custom-action";
import { addDatasource } from "./actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDatasourceParams } from "@/app/dashboard/datasources/use-datasource-params";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Papa from 'papaparse';

// Schema for the form
const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().optional(),
    valueColumn: z.string().min(1, "Value column is required"),
    displayColumn: z.string().min(1, "Display column is required"),
    isMultiple: z.boolean(),
    csvFile: z.instanceof(File).optional(),
});

export function DatasourceCreateForm() {
    const {createDatasource, setParams} = useDatasourceParams();
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [isParsingCsv, setIsParsingCsv] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            valueColumn: "",
            displayColumn: "",
            isMultiple: false,
        }
    });

    // Use the custom action hook for the server action
    const addDatasourceAction = useCustomAction(addDatasource, {
        onSuccess: ({data}) => {
            toast.success(data?.message);
            form.reset();
            setCsvHeaders([]);
            setCsvData([]);
        },
    });

    // Handle CSV file upload
    const handleCsvUpload = (file: File) => {
        setIsParsingCsv(true);

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                if (results.data.length > 0 && results.meta.fields) {
                    setCsvHeaders(results.meta.fields);
                    setCsvData(results.data as Record<string, string>[]);

                    // Set default value and display columns if available
                    if (results.meta.fields.length > 0) {
                        form.setValue('valueColumn', results.meta.fields[0]);
                        form.setValue('displayColumn', results.meta.fields[0]);
                    }
                }
                setIsParsingCsv(false);
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
                setIsParsingCsv(false);
            }
        });
    };

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (csvHeaders.length === 0 || csvData.length === 0) {
            toast.error("Please upload a valid CSV file");
            return;
        }

        addDatasourceAction.execute({
            name: data.name,
            description: data.description,
            valueColumn: data.valueColumn,
            displayColumn: data.displayColumn,
            isMultiple: data.isMultiple,
            columns: csvHeaders,
            csvData: csvData,
        });
    };

    return (
        <Dialog open={createDatasource!} onOpenChange={() => setParams(null)}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Datasource</DialogTitle>
                    <DialogDescription>Upload a CSV file to create a new datasource</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Brands, Countries, Products" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter a description for this datasource"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isMultiple"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Allow Multiple Selection
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Enable this if users should be able to select multiple values from this
                                            datasource
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="csvFile"
                            render={({field: {onChange, value, ...field}}) => (
                                <FormItem>
                                    <FormLabel>CSV File</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => {
                                                void value;
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    onChange(file);
                                                    handleCsvUpload(file);
                                                }
                                            }}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {csvHeaders.length > 0 && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="valueColumn"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Value Column</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    {csvHeaders.map((header) => (
                                                        <option key={header} value={header}>
                                                            {header}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="displayColumn"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Display Column</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    {csvHeaders.map((header) => (
                                                        <option key={header} value={header}>
                                                            {header}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            loading={addDatasourceAction.isPending || isParsingCsv}
                            disabled={csvHeaders.length === 0 || csvData.length === 0}
                        >
                            Add Datasource
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
