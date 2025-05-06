"use client"

import {Star, StarHalf} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {useFormatter, useTranslations} from "next-intl";

type SimpleRatingProps = React.HTMLAttributes<HTMLDivElement> & {
    value: number,
    maxStars?: number,
    scale?: string
    content?: string[]
}

export const SimpleRating = ({value, scale, maxStars = 5, content, children}: SimpleRatingProps) => {
    const roundedValue = Math.round(value * 2) / 2
    const wholeStars = Math.floor(roundedValue)
    const halfStar = roundedValue % 1 === 0.5
    const t = useTranslations()
    const format = useFormatter();

    const StarRender = () => {
        return (
            <div className="flex min-w-max">
                {[...Array(wholeStars)].map((_, i) => (
                    <Star key={i} className="fill-yellow-500 stroke-0 size-4"/>
                ))}
                {halfStar && (
                    <span className="relative">
                                <Star className="fill-gray-200 dark:fill-muted stroke-0 size-4"/>
                                <StarHalf className="fill-yellow-500 absolute top-0 left-0 stroke-0 size-4"/>
                            </span>
                )}
                {[...Array(maxStars - wholeStars - (halfStar ? 1 : 0))].map((_, i) => (
                    <Star key={i} className="fill-gray-200 dark:fill-muted stroke-0 size-4"/>
                ))}
            </div>
        )
    }

    const andLabel = t("generic.and")
    const scaleLabel = t(`scale.${scale}`)
    const scaleValues = roundBothWays(value)
    const scaleLabels = scaleValues.map((v) => t(`scale_value.${scale}_${v}`)).join(`<br />${andLabel}<br/>`)

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col">
                        <StarRender/>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                            <span>{scaleLabel}: <strong>{value}</strong></span>
                            <StarRender/>
                        </div>
                        <div className="flex flex-col space-y-1">
                            {
                                scaleValues.length > 1 && <span>{t("generic.scale_within", {scale: scaleLabel})}</span>
                            }
                            <span dangerouslySetInnerHTML={{__html: scaleLabels}}/>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function roundBothWays(n: number) {
    if (Number.isInteger(n)) {
        return [n];
    } else {
        return [Math.floor(n), Math.ceil(n)];
    }
}