"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useCustomAction} from "@/hooks/use-custom-action";
import {addTranslation} from "./actions";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useTranslationParams} from "@/app/dashboard/translations/use-translation-params";

// Schema for the form
const formSchema = z.object({
    entityType: z.string().min(1, "Entity type is required").max(20, "Entity type must be less than 20 characters"),
    entityId: z.string().min(1, "Entity ID is required").max(50, "Entity ID must be less than 50 characters"),
    langCode: z.string().min(2, "Language code is required").max(10, "Language code must be less than 10 characters"),
    textValue: z.string().min(1, "Translation text is required")
});

export function TranslationCreateForm() {
    const {createTranslation, setParams} = useTranslationParams()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entityType: "",
            entityId: "",
            langCode: "en",
            textValue: ""
        }
    });

    // Use the custom action hook for the server action
    const addTranslationAction = useCustomAction(addTranslation, {
        onSuccess: ({data}) => {
            toast.success(data?.message);
            form.reset();
        },
    });

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        addTranslationAction.execute(data)
    };

    return (
        <Dialog open={createTranslation!} onOpenChange={() => setParams(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Translation</DialogTitle>
                    <DialogDescription>Adds a new translation</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="entityType"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Entity Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., app, common, auth" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="entityId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Entity ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., title, welcome, signIn" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="langCode"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="textValue"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Translation Text</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter translation text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            loading={addTranslationAction.isPending}
                        >
                            Add Translation
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}