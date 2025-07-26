"use client";

import { createPrompt, type PromptFormData, updatePrompt } from "@/app/dashboard/prompts/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { systemPrompts } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TipTapEditor } from "@/components/tiptap/editor";

const promptSchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name too long"),
    description: z.string().optional(),
    prompt: z.string().min(1, "Prompt content is required"),
});

type Prompt = typeof systemPrompts.$inferSelect;

interface PromptFormProps {
    prompt?: Prompt;
}

export function PromptForm({prompt}: PromptFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PromptFormData>({
        resolver: zodResolver(promptSchema),
        defaultValues: {
            name: prompt?.name || "",
            description: prompt?.description || "",
            prompt: prompt?.prompt || "",
        },
    });

    async function onSubmit(data: PromptFormData) {
        setIsSubmitting(true);
        try {
            const result = prompt
                ? await updatePrompt(prompt.id, data)
                : await createPrompt(data);

            if (result.success) {
                toast.success(prompt ? "Prompt updated successfully" : "Prompt created successfully");
                if (!prompt) {
                    router.push("/dashboard/prompts");
                }
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            void error;
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Card className="rounded-md shadow-none">
            <CardHeader>
                <CardTitle>{prompt ? "Edit Prompt" : "Create New Prompt"}</CardTitle>
                <CardDescription>
                    {prompt ? "Update the system prompt details" : "Create a new system prompt for AI agents"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter prompt name..." {...field} />
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
                                            <Input placeholder="Brief description..." {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Prompt Content</FormLabel>
                                    <FormControl>
                                        <TipTapEditor value={field.value} onChange={field.onChange}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-4 pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4"/>
                                {isSubmitting
                                    ? "Saving..."
                                    : prompt
                                        ? "Update Prompt"
                                        : "Create Prompt"
                                }
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 