import * as React from "react";
import {Textarea} from "@/components/ui/textarea";
import {useFormContext} from "react-hook-form";
import {api} from "@/lib/trpc/react";
import {useEffect} from "react";

export const PromptArea = ({...props}: React.ComponentProps<"textarea">) => {
    const formContext = useFormContext()
    const aiModelId = formContext.watch('aiModel') as number

    const [brand, season, category] = formContext.watch(['brand', 'season', 'category'])
    const {data: prompt} = api.genericRoute.getPrompt.useQuery({
        brand,
        season,
        category,
        aiModelId
    }, {
        enabled: Boolean(aiModelId)
    })

    useEffect(() => {
        if (prompt) {
            formContext.setValue(props.name as string, prompt)
        }
    }, [formContext, prompt])

    return (
        <Textarea
            {...props}
            className="max-h-96"
        />
    )
}