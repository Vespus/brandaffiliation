"use client"

import { saveSettingsAction } from "@/app/dashboard/configure/[model]/actions";
import { AISettingsSaveSchema } from "@/app/dashboard/configure/[model]/schema";
import { HelpTooltip } from "@/components/help-tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AIModel, AISetting } from "@/db/types";
import { useCustomAction } from "@/hooks/use-custom-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const ManageForm = ({data, defaultConfig, model}: {
    data: AISetting,
    defaultConfig: AISetting,
    model: AIModel
}) => {
    const form = useForm<z.infer<typeof AISettingsSaveSchema>>({
        resolver: zodResolver(AISettingsSaveSchema),
        defaultValues: {
            id: data?.id,
            model: data?.model || model.modelName,
            temperature: data?.temperature || 1,
            maxTokens: data?.maxTokens || 4000,
            topP: data?.topP || 1,
            frequencyPenalty: data?.frequencyPenalty || 0,
            presencePenalty: data?.presencePenalty || 0,
        }
    })

    const saveSettingsActionCall = useCustomAction(saveSettingsAction, {
        onSuccess: () => {
            toast.success('Settings erfolgreich gespeichert');
        }
    })

    const onSubmit = (values: z.infer<typeof AISettingsSaveSchema>) => {
        saveSettingsActionCall.execute(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="general">
                    <TabsList className="grid grid-cols-3 mb-4 w-full">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Parameters</CardTitle>
                                <CardDescription>Configure the basic parameters that control the model&#39;s
                                    behavior.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="temperature"
                                    render={({field}) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="justify-between items-center">
                                                <span className="inline-flex space-x-2">
                                                    <span>Temperature</span>
                                                    <HelpTooltip>Temperature is a value between 0 and 2. Higher values make the output more random, while lower values make the output more focused and deterministic.</HelpTooltip>
                                                </span>
                                                <span>{field.value}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={2}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={val => field.onChange(val[0])}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Precise (0.0)</span>
                                                <span>Balanced (1.0)</span>
                                                <span>Creative (2.0)</span>
                                            </div>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxTokens"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="justify-between items-center">
                                        <span className="inline-flex space-x-2">
                                            <span>Max Tokens</span>
                                            <HelpTooltip>The maximum number of tokens to generate in the response. One token is roughly 4 characters for English text.</HelpTooltip>
                                        </span>
                                                <span>{field.value}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={32000}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="advanced">
                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Parameters</CardTitle>
                                <CardDescription>Fine-tune the model&#39;s behavior with advanced
                                    parameters.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="topP"
                                    render={({field}) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="justify-between items-center">
                                        <span className="inline-flex space-x-2">
                                            <span>Top P</span>
                                        </span>
                                                <span>{field.value}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={val => field.onChange(val[0])}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Focused (0)</span>
                                                <span>Balanced (0.5)</span>
                                                <span>Creative (1)</span>
                                            </div>
                                            <FormDescription>
                                                Controls diversity via nucleus sampling: 0.1 means only tokens with the
                                                top 10%
                                                probability mass are considered. We recommend altering this or
                                                temperature but
                                                not both.
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <hr/>
                                <FormField
                                    control={form.control}
                                    name="frequencyPenalty"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="justify-between items-center">
                                        <span className="inline-flex space-x-2">
                                            <span>Frequency Penalty</span>
                                        </span>
                                                <span>{field.value}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={-2}
                                                    max={2}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={val => field.onChange(val[0])}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>-2.0</span>
                                                <span>0.0</span>
                                                <span>2.0</span>
                                            </div>
                                            <FormDescription>
                                                Reduces repetition by penalizing tokens based on their frequency in the
                                                text so
                                                far. Higher values decrease repetition of the same phrases.
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <hr/>
                                <FormField
                                    control={form.control}
                                    name="presencePenalty"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="justify-between items-center">
                                        <span className="inline-flex space-x-2">
                                            <span>Presence Penalty</span>

                                        </span>
                                                <span>{field.value}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={-2}
                                                    max={2}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={val => field.onChange(val[0])}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>-2.0</span>
                                                <span>0.0</span>
                                                <span>2.0</span>
                                            </div>
                                            <FormDescription>
                                                Reduces repetition by penalizing tokens that have appeared at all in the
                                                text so
                                                far. Higher values encourage the model to talk about new topics.
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="flex justify-end gap-4 mt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                Reset to Defaults
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
                                <AlertDialogDescription>This will reset all settings to their default values. You can
                                    still refresh page to restore your custom settings if you have
                                    any.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => form.reset(defaultConfig)}>Proceed</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button loading={saveSettingsActionCall.isPending}>Save Settings</Button>
                </div>
            </form>
        </Form>
    )
}