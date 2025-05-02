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
import {AIModelSelect} from "@/app/dashboard/content-generation/form-elements/ai-model-select";
import {useCompletion} from "@ai-sdk/react";
import {useMutation} from "@tanstack/react-query";
import {PromptArea} from "@/app/dashboard/content-generation/form-elements/prompt-area";
import {ResultEditor} from "@/app/dashboard/content-generation/form-elements/result-editor";


const steps = [1, 2]

export const ManageForm = () => {
    const form = useForm<z.infer<typeof ContentGenerateSchema>>({
        resolver: zodResolver(ContentGenerateSchema),
        defaultValues: {
            brand: undefined,
            category: "",
            season: "",
            aiModel: undefined,
            customPrompt: "",
        },
    })
    const [currentStep, setCurrentStep] = useState(1)
    const [result, setResult] = useState("")
    const [brand, season, category] = form.watch(["brand", "season", "category"])
    const isStep1Valid = ContentGenerationStep1Schema.safeParse({brand, season, category}).success
    const mutate = useMutation({
        mutationKey: ["completion", brand, season, category],
        mutationFn: async (values: z.infer<typeof ContentGenerateSchema>) => {
            const response = await fetch("/api/completion", {
                method: "POST",
                body: JSON.stringify(values),
            })

            if (!response.body) {
                setResult('No response')
                return
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let done = false

            while (!done) {
                const {value, done: doneReading} = await reader.read()
                done = doneReading
                const chunk = decoder.decode(value)
                setResult((prev) => prev + chunk)
            }

        },
    })

    async function onSubmit(values: z.infer<typeof ContentGenerateSchema>) {
        setResult("")
        mutate.mutate(values)
    }

    const nextStep = () => {
        if (isStep1Valid) {
            form.trigger(["brand", "season", "category"])
            setCurrentStep(2)
        } else {
            form.trigger(["brand", "season", "category"])
        }
    }

    const prevStep = () => {
        setCurrentStep(1)
    }

    return (
        <>
            <Card className="h-full overflow-hidden border-b flex-none w-full max-w-lg py-0 gap-0 border-0 shadow-none">
                <CardHeader className="py-6">
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle>Generate SEO Content</CardTitle>
                        <div className="flex items-center gap-2 w-24">
                            <Stepper value={currentStep} onValueChange={setCurrentStep}>
                                {steps.map((step) => (
                                    <StepperItem key={step} step={step} className="not-last:flex-1">
                                        <StepperTrigger asChild className="size-8">
                                            <StepperIndicator/>
                                        </StepperTrigger>
                                        {step < steps.length && <StepperSeparator/>}
                                    </StepperItem>
                                ))}
                            </Stepper>
                        </div>
                    </div>
                    <CardDescription>
                        {currentStep === 1
                            ? "Select product details for your content"
                            : "Choose AI model and customize your prompt"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {
                                    currentStep === 1 && (
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
                                                        <CategorySelect value={field.value} onValueChange={field.onChange}/>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </motion.div>
                                    )
                                }
                                {
                                    currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{opacity: 0, x: 20}}
                                            animate={{opacity: 1, x: 0}}
                                            exit={{opacity: 0, x: 20}}
                                            transition={{duration: 0.3}}
                                            className="space-y-6"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="aiModel"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>AI Model</FormLabel>
                                                        <AIModelSelect onValueChange={field.onChange} value={field.value}/>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="customPrompt"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Custom Prompt (Optional)</FormLabel>
                                                        <FormControl>
                                                            <PromptArea
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
                                    )
                                }
                            </AnimatePresence>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter
                    className="flex justify-between p-6 border-t">
                    {currentStep === 1 ? (
                        <Button
                            key="step-button-1"
                            type="button"
                            onClick={nextStep}
                            className="ml-auto"
                        >
                            Next Step
                            <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                        <>
                            <Button
                                key="step-button-2"
                                type="button"
                                onClick={prevStep}
                                variant="outline"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Previous
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit(onSubmit)}
                                className="transition bg-green-600 hover:bg-green-700"
                            >
                                <Sparkles className="mr-2 h-4 w-4"/>
                                Generate Content
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
            <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
                {
                    !result
                        ? (
                            <div className="w-full max-w-lg flex flex-col items-center justify-center text-center gap-4">
                                <div
                                    className="bg-green-100 rounded-full size-16 p-2 flex items-center justify-center text-green-700">
                                    <Sparkles size={32}/>
                                </div>
                                <div className="font-semibold text-xl">Ready to Generate Content</div>
                                <span>Complete the form and click <strong>Generate Content</strong> to create SEO text for your fashion category page.</span>
                            </div>
                        ) : (
                            <div className="max-w-2xl flex flex-col gap-4">
                                <div className="font-semibold text-xl flex space-x-2 items-center">
                                    <Sparkles size={32} className="text-green-500"/>
                                    <span>Generated Content</span>
                                </div>
                                <Textarea className=" bg-background max-h-[500px]" value={result}
                                          onChange={e => setResult(e.target.value)}></Textarea>
                            </div>
                        )
                }
            </div>
        </>
    )
}