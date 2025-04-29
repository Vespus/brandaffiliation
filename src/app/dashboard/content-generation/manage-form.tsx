"use client"

import {useForm} from "react-hook-form";
import {ContentGenerateSchema, ContentGenerationStep1Schema} from "@/app/dashboard/content-generation/schema";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTrigger} from "@/components/ui/stepper";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {AnimatePresence, motion} from "motion/react";
import {BrandSelect} from "@/app/dashboard/content-generation/form-elements/brand-select";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {ArrowLeft, ArrowRight, Sparkles} from "lucide-react";
import {CategorySelect} from "@/app/dashboard/content-generation/form-elements/category-select";

export const ManageForm = () => {
    const form = useForm<z.infer<typeof ContentGenerateSchema>>({
        resolver: zodResolver(ContentGenerateSchema),
        defaultValues: {
            brand: undefined,
            category: "",
            season: "",
            aiModel: "",
            customPrompt: "",
        },
    })
    const [currentStep, setCurrentStep] = useState(0)
    const [brand, season, category] = form.watch(["brand", "season", "category"])
    const isStep1Valid = ContentGenerationStep1Schema.safeParse({brand, season, category }).success

    async function onSubmit(values: z.infer<typeof ContentGenerateSchema>) {
        console.log(values)
    }

    const nextStep = () => {
        if (isStep1Valid) {
            form.trigger(["brand", "season", "category"])
            setCurrentStep(1)
        } else {
            form.trigger(["brand", "season", "category"])
        }
    }

    const prevStep = () => {
        setCurrentStep(0)
    }

    return (
        <>
            <Card className="h-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader
                    className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle>Generate SEO Content</CardTitle>
                        <div className="flex items-center gap-2">
                            <Stepper defaultValue={1}>
                                {[1, 2].map((step) => (
                                    <StepperItem key={step} step={step} className="not-last:flex-1">
                                        <StepperTrigger>
                                            <StepperIndicator asChild>{step}</StepperIndicator>
                                        </StepperTrigger>
                                        {step < [1, 2].length && <StepperSeparator/>}
                                    </StepperItem>
                                ))}
                            </Stepper>
                        </div>
                    </div>
                    <CardDescription>
                        {currentStep === 0
                            ? "Select product details for your content"
                            : "Choose AI model and customize your prompt"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {currentStep === 0 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        exit={{opacity: 0, x: -20}}
                                        transition={{duration: 0.3}}
                                        className="space-y-6"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="brand"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Brand</FormLabel>
                                                    <BrandSelect onValueChange={field.onChange} value={field.value}/>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="season"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Season</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a season"/>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Spring/Summer">Spring/Summer</SelectItem>
                                                            <SelectItem value="Fall/Winter">Fall/Winter</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <CategorySelect value={field.value} onValueChange={field.onChange} />
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{opacity: 0, x: 20}}
                                        animate={{opacity: 1, x: 0}}
                                        exit={{opacity: 0, x: 20}}
                                        transition={{duration: 0.3}}
                                        className="space-y-6"
                                    >
                                        {/*<FormField
                                            control={form.control}
                                            name="aiModel"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>AI Model</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12">
                                                                <SelectValue placeholder="Select an AI model"/>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {aiModels.map((model) => (
                                                                <SelectItem key={model.id} value={model.id}>
                                                                    {model.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
*/}
                                        <FormField
                                            control={form.control}
                                            name="customPrompt"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Custom Prompt (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Add specific instructions for the AI model..."
                                                            className="resize-none min-h-[120px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter
                    className="flex justify-between p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    {currentStep === 0 ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            className="ml-auto bg-emerald-600 hover:bg-emerald-700"
                        >
                            Next Step
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                        <>
                            <Button type="button" onClick={prevStep} variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Previous
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit(onSubmit)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Sparkles className="mr-2 h-4 w-4"/>
                                Generate Content
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </>
    )
}