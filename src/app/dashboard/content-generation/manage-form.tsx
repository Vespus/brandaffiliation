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
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {ArrowLeft, ArrowRight, CloudRainIcon, Sparkles, SunIcon} from "lucide-react";
import {CategorySelect} from "@/app/dashboard/content-generation/form-elements/category-select";
import {AIModelSelect} from "@/app/dashboard/content-generation/form-elements/ai-model-select";
import {PromptArea} from "@/app/dashboard/content-generation/form-elements/prompt-area";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {useCustomAction} from "@/hooks/use-custom-action";
import {CompletionStream} from "@/app/dashboard/content-generation/actions";
import {readStreamableValue} from "ai/rsc";
import {useContentGenerationStore} from "@/app/dashboard/content-generation/store";
import { GeneratedContentView } from "@/app/dashboard/content-generation/generated-content-view";


const steps = [1, 2]
const defaultSystemPrompt = `Erstelle einen SEO-optimierten Produktkategorietext für {form.category} von {brand.name} für die {form.season}-Saison mit ca. 200–250 Wörtern.

1. Verwende deine eigenen Kenntnisse über die Marke als Basis.
2. Als Ergänzung dienen dir diese Informationen:
{brand.characteristics}
{brand.scales}

Textstruktur:
1. Einleitung (1–2 Sätze): 
   - Prägnante Vorstellung der Marke mit Bezug auf die Kategorie
   - Idealerweise eine prägnante Headline, gefolgt vom eigentlichen Text

2. Hauptteil (3–4 Absätze):
   - Verbinde die Kernwerte der Marke logisch mit der Produktkategorie
   - Fokussiere auf die Designsprache und Ästhetik statt auf technische Details
   - Beschreibe die typischen Stilmerkmale dieser Marke in der Kategorie
   - Erkläre, für welche Anlässe und zu welchen Outfits die Produkte ideal passen

3. Abschluss (1–2 Sätze): 
   - Call-to-Action zum Entdecken bei Herrenausstatter
`

export const ManageForm = () => {
    const form = useForm<z.infer<typeof ContentGenerateSchema>>({
        resolver: zodResolver(ContentGenerateSchema),
        defaultValues: {
            brand: undefined,
            category: "",
            season: "Spring/Summer",
            aiModel: [],
            customPrompt: defaultSystemPrompt,
        },
    })
    const [currentStep, setCurrentStep] = useState(1)
    const [brand, season, category] = form.watch(["brand", "season", "category"])
    const isStep1Valid = ContentGenerationStep1Schema.safeParse({brand, season, category}).success
    const contentStore = useContentGenerationStore()

    async function onSubmit(values: z.infer<typeof ContentGenerateSchema>) {
        contentStore.setProgressState("started")
        const response = await CompletionStream(values);
        contentStore.updateModels(response.aiModelList)
        contentStore.setProgressState("loading")
        await Promise.all(values.aiModel.map(async (model) => {
            const relevantAIModel = response.aiModelList.find((aiModel) => aiModel.id === model)!
            for await (const value of readStreamableValue(response.streams[model])){
                contentStore.updateStreams(relevantAIModel, value || "")
            }
        }))
        contentStore.setProgressState("complete")
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
        <div className="flex w-full flex-1 flex-col gap-0 shadow-none lg:max-w-lg xl:max-w-xl min-h-0">
            <div className="flex-none py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Generate SEO Content</h1>
                    <div className="flex w-24 items-center gap-2">
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
                <p className="text-sm text-muted-foreground">
                    {currentStep === 1
                        ? "Select product details for your content"
                        : "Choose AI model and customize your prompt"}
                </p>
            </div>
            <div className="h-0 flex-1 p-6 overflow-auto scrollbar-hide">
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
                                            name="category"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <CategorySelect value={field.value} onValueChange={field.onChange}/>
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
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            className="grid-cols-2"
                                                            defaultValue="Spring/Summer"
                                                        >
                                                            <div
                                                                className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
                                                                <RadioGroupItem id="summer" value="Spring/Summer" className="sr-only"/>
                                                                <SunIcon className="opacity-60" size={20} aria-hidden="true"/>
                                                                <label htmlFor="summer" className="after:absolute after:inset-0 cursor-pointer text-xs font-medium leading-none text-foreground">
                                                                    Spring/Summer
                                                                </label>
                                                            </div>
                                                            <div
                                                                className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
                                                                <RadioGroupItem id="winter" value="Fall/Winter" className="sr-only"/>
                                                                <CloudRainIcon className="opacity-60" size={20} aria-hidden="true" />
                                                                <label htmlFor="winter" className="after:absolute after:inset-0 cursor-pointer text-xs font-medium leading-none text-foreground">
                                                                    Fall/Winter
                                                                </label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
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
            </div>
            <div className="flex flex-none justify-between p-6">
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
                            className="bg-green-600 transition hover:bg-green-700"
                        >
                            <Sparkles className="mr-2 h-4 w-4"/>
                            Generate Content
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}