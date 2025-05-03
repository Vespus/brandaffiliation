"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useCustomAction} from "@/hooks/use-custom-action";
import {updateTranslation} from "./actions";
import {toast} from "sonner";
import {useEffect} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose, DialogDescription
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {api} from "@/lib/trpc/react";
import {useTranslationParams} from "@/app/dashboard/translations/use-translation-params";

// Schema for the form validation
const formSchema = z.object({
    id: z.number(),
    entityType: z.string(),
    entityId: z.string(),
    langCode: z.string(),
    textValue: z.string().min(1, "Translation text is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function TranslationEditDialog() {
    // Find the translation by ID
    const {editTranslation, setParams} = useTranslationParams()
    const isOpen = Boolean(editTranslation)

    const {data: translation, isPending} = api.genericRoute.getTranslationById.useQuery({id: editTranslation!}, {
        enabled: isOpen
    })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: 0,
            entityType: "",
            entityId: "",
            langCode: "",
            textValue: "",
        },
    });

    // Reset form when translation changes
    useEffect(() => {
        form.reset()
        if (translation) {
            form.reset({
                id: translation.id,
                entityType: translation.entityType,
                entityId: translation.entityId,
                langCode: translation.langCode,
                textValue: translation.textValue,
            });
        }
    }, [translation, form]);

    const updateTranslationAction = useCustomAction(updateTranslation, {
        onSuccess: ({data}) => {
            toast.success(data?.message);
            setParams(null);
        },
    });

    const onSubmit = (values: FormValues) => {
        updateTranslationAction.execute(values);
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => setParams(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Translation</DialogTitle>
                    <DialogDescription>Edit the translation of {translation?.langCode}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Entity Type</p>
                                <p className="text-sm">{translation?.entityType}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Entity ID</p>
                                <p className="text-sm">{translation?.entityId}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Language</p>
                                <p className="text-sm">{translation?.langCode}</p>
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="textValue"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Translation Text</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={() => setParams(null)}>Cancel</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                loading={updateTranslationAction.isPending || isPending}
                            >
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
