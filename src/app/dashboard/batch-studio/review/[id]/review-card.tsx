"use client"

import { ReviewJoin } from "@/app/dashboard/batch-studio/tasks/type";
import { MetaOutput, PartialMetaOutput, PartialMetaOutputSchema } from "@/app/dashboard/content-generation/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { toHtml } from 'hast-util-to-html'
import { common, createLowlight } from 'lowlight'
import { SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import {useCustomAction} from "@/hooks/use-custom-action";
import {SaveReviewTaskToQSPay} from "@/app/dashboard/batch-studio/actions";
import {toast} from "sonner";

export const ReviewCard = ({item}: { item: ReviewJoin }) => {
    const form = useForm<PartialMetaOutput>({
        resolver: zodResolver(PartialMetaOutputSchema),
        defaultValues: {
            meta: {
                title: item.content.config?.meta?.title || "",
                description: item.content.config?.meta?.description || "",
                category: item.content.config?.meta?.category || "",
                openGraph: {
                    type: item.content.config?.meta?.openGraph?.type || "",
                    title: item.content.config?.meta?.openGraph?.title || "",
                    description: item.content.config?.meta?.openGraph?.description || "",
                    locale: item.content.config?.meta?.openGraph?.locale || "",
                },
                twitter: {
                    card: item.content.config?.meta?.twitter?.card || "",
                    title: item.content.config?.meta?.twitter?.title || "",
                    description: item.content.config?.meta?.twitter?.description || "",
                }
            },
            descriptions: {
                header: item.content.config?.descriptions?.header || "<p></p>",
                footer: item.content.config?.descriptions?.footer || "<p></p>",
            }
        }
    })

    const singleSaveAction = useCustomAction(SaveReviewTaskToQSPay, {
        onSuccess: () => {
            toast.success("Successfully saved")
        }
    })

    const handleSubmit = async (values: PartialMetaOutput) => {
        singleSaveAction.execute({
            config: values,
            content: {
                contentId: item.content.id,
                entityType: item.content.entityType,
                entityId: item.content.entityId
            }
        })
    }

    return (
        <div className="flex flex-col flex-1 px-6">
            <div>
                <h1 className="font-bold text-2xl">{item.entityName}</h1>
                <p className="capitalize text-muted-foreground">{item.content.entityType}</p>
            </div>
            <div className="flex gap-12 min-w-0 w-full py-4">
                <div className="flex-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="flex flex-col space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-lg">Meta Contents</h3>
                                <FormField
                                    control={form.control}
                                    name="meta.title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Meta Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Meta title"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                The title that valued inside head section.
                                                e.g: <code>{"<title></title>"}</code>
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="meta.description"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Meta Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Meta description"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                The title that valued inside head section.
                                                e.g: <code>{"<meta name='description' content='...'/>"}</code>
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="meta.title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Meta Category</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Meta category"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Useful for e-commerce pages, defines the category of page
                                                e.g: <code>{"<meta name='category' content='hemden'/>"}</code>
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-lg">Facebook OpenGraph Controls</h3>
                                <span className="text-xs text-muted-foreground">Link sharing preview meta contents used by Whatsapp or Facebook or other opengraph used platforms</span>
                                <div className="flex flex-col space-y-4 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="meta.openGraph.type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>OpenGraph Type</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Opengraph type"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Type defines what the shared page is all about. Mostly selected
                                                    value
                                                    is <code>&ldquo;website&ldquo;</code>
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="meta.openGraph.title"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>OpenGraph Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Opengraph title"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    This will appear as the title of shared link preview
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="meta.openGraph.description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>OpenGraph Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Opengraph Description"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    this will appear as a short text below title of shared link preview
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="meta.openGraph.locale"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>OpenGraph Locale</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Opengraph locale like 'de-DE'"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Defines the locale of shared link target
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-lg">Twitter SharedLinkPreview Controls</h3>
                                <span className="text-xs text-muted-foreground">Link sharing preview meta contents used by Twitter owned platforms just like Facebook&#39;s OpenGraph</span>
                                <div className="flex flex-col space-y-4 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="meta.twitter.card"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>OpenGraph Type</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Twitter Card Type"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    The card type. It&#39;s the card when you share something on twitter
                                                    as
                                                    post. most common value is <code>summary or
                                                    summary_large_image</code>
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="meta.twitter.title"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Twitter Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Twittler title"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    This will appear as the title of shared link preview
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="meta.twitter.description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Twitter Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Twitter Description"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    this will appear as a short text below title of shared link preview
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-lg">In-Site Content</h3>
                                <span className="text-xs text-muted-foreground">Link sharing preview meta contents used by Twitter owned platforms just like Facebook&#39;s OpenGraph</span>
                                <div className="flex flex-col space-y-4 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="descriptions.header"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Top Content</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Content descriptions - Top describe text on search pages
                                                </FormDescription>
                                                <FormControl>
                                                    <Textarea {...field}/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="descriptions.footer"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Footer Content</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Content descriptions - Footer describe text on search pages
                                                </FormDescription>
                                                <FormControl>
                                                    <Textarea {...field}/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="justify-self-end">
                                <Button
                                    type="submit"
                                >
                                    <SaveIcon/> Accept And Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                {item.content.oldConfig && <OldContent config={item.content.oldConfig}/>}
            </div>
        </div>
    )
}

const OldContent = ({config}: { config: MetaOutput }) => {
    const lowlight = createLowlight(common)
    const Component = toHtml(lowlight.highlight("json", JSON.stringify(config, null, 2)))

    return (
        <div className="flex-none max-w-2xl">
            <link rel="stylesheet"
                  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/styles/github.min.css"/>
            <div className="mb-4">
                <h3 className="font-semibold text-lg">Current Content on Production Site</h3>
                <p className="text-sm text-muted-foreground">Below JSON is the current content of the live webpage.</p>
            </div>
            <pre className="whitespace-pre-wrap text-xs"
                 dangerouslySetInnerHTML={{__html: Component}}/>
        </div>
    )
}