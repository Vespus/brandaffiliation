"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DEFAULT_SCALE_WEIGHTS } from "@/app/dashboard/brands/[brand]/constant"
import { searchParams } from "@/app/dashboard/brands/[brand]/search-params"
import { useQueryStates } from "nuqs";

// Create a schema for form validation
const ScaleWeightsSchema = z.object({
    price: z.number().min(0).max(1),
    quality: z.number().min(0).max(1),
    focus: z.number().min(0).max(1),
    design: z.number().min(0).max(1),
    positioning: z.number().min(0).max(1),
    heritage: z.number().min(0).max(1),
    origin: z.number().min(0).max(1),
    recognition: z.number().min(0).max(1),
    revenue: z.number().min(0).max(1),
    similarityWeight: z.array(z.coerce.number().min(0).max(1)).max(2),
}).refine(data => {
    // Calculate the sum of all values
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {similarityWeight, ...rest} = data
    const sum = Object.values(rest).reduce((acc, val) => acc + val, 0)
    // Ensure the sum doesn't exceed 1.0
    return sum <= 1.0
}, {
    message: "The sum of all weights must not exceed 1.0",
    path: ["price"] // This will show the error on the price field, but it applies to all fields
})

function roundTo(n: number) {
    return parseFloat(n.toFixed(1));
}

export function ScaleWeightsForm() {
    const [params, setParams] = useQueryStates(searchParams, {
        shallow: false
    })

    // Initialize form with values from URL or defaults
    const form = useForm<z.infer<typeof ScaleWeightsSchema>>({
        resolver: zodResolver(ScaleWeightsSchema),
        defaultValues: {
            similarityWeight: params.similarityWeight,
            price: params.price,
            quality: params.quality,
            focus: params.focus,
            design: params.design,
            positioning: params.positioning,
            heritage: params.heritage,
            origin: params.origin,
            recognition: params.recognition,
            revenue: params.revenue,
        }
    })

    // Calculate the current sum of all weights
    const values = form.watch()
    const {similarityWeight, ...valuesExceptWeight} = values
    const totalSum = Object.values(valuesExceptWeight).reduce((acc, val) => acc + val, 0)
    const formattedSum = totalSum.toFixed(2)

    const onSubmit = (data: z.infer<typeof ScaleWeightsSchema>) => {
        // Create a new URLSearchParams object
        setParams(data)
    }

    const onReset = () => {
        form.reset({
            ...DEFAULT_SCALE_WEIGHTS,
            similarityWeight: [0.4, 0.6]
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scale Weights</CardTitle>
                <CardDescription>
                    Adjust the importance of each scale factor. The sum of all weights must not exceed 1.0.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="similarityWeight"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="flex justify-between items-center">
                                        <span>Similarity Weight</span>
                                        <span>{similarityWeight[0] * 100}% / {similarityWeight[1] * 100}%</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            value={[field.value[0]]}
                                            onValueChange={val => {
                                                field.onChange([roundTo(val[0]), roundTo(1 - val[0])])
                                            }}
                                        />
                                    </FormControl>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div>Characteristics Affinity ({similarityWeight[1] * 100}%)</div>
                                        <div>Scale Affinity ({similarityWeight[0] * 100}%)</div>
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <hr/>
                        {Object.keys(DEFAULT_SCALE_WEIGHTS).map((key) => (
                            <FormField
                                key={key}
                                control={form.control}
                                name={key as keyof Omit<z.infer<typeof ScaleWeightsSchema>, "similarityWeight">}
                                render={({field}) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="flex justify-between">
                                            <span className="capitalize">{key}</span>
                                            <span>{field.value.toFixed(3)}</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Slider
                                                min={0}
                                                max={1}
                                                step={0.001}
                                                value={[field.value]}
                                                onValueChange={(values) => field.onChange(values[0])}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}
                        <p className="text-xs text-right">Current sum: <span
                            className={totalSum > 1.0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>{formattedSum}</span>
                        </p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onReset}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={totalSum > 1.0}
                            >
                                Apply Weights
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}