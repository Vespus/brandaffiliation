'use client'

import { useTranslations } from 'next-intl'

import { Star, StarHalf } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { roundBothWays } from '@/utils/round-both-ways'

type SimpleRatingProps = React.HTMLAttributes<HTMLDivElement> & {
    value: number
    maxStars?: number
    scale?: string
    content?: string[]
}

export const SimpleRating = ({ value, scale, maxStars = 5 }: SimpleRatingProps) => {
    const roundedValue = Math.round(value * 2) / 2
    const wholeStars = Math.floor(roundedValue)
    const halfStar = roundedValue % 1 === 0.5
    const t = useTranslations()

    const StarRender = () => {
        return (
            <div className="flex min-w-max">
                {[...Array(wholeStars)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-500 stroke-0" />
                ))}
                {halfStar && (
                    <span className="relative">
                        <Star className="dark:fill-muted size-4 fill-gray-200 stroke-0" />
                        <StarHalf className="absolute top-0 left-0 size-4 fill-yellow-500 stroke-0" />
                    </span>
                )}
                {[...Array(maxStars - wholeStars - (halfStar ? 1 : 0))].map((_, i) => (
                    <Star key={i} className="dark:fill-muted size-4 fill-gray-200 stroke-0" />
                ))}
            </div>
        )
    }

    if (!value) {
        return null
    }

    const andLabel = t('generic.and')
    const scaleLabel = t(`scale.${scale}`)
    const scaleValues = roundBothWays(value)
    const scaleLabels = scaleValues.map((v) => t(`scale_value.${scale}_${v}`)).join(`<br />${andLabel}<br/>`)

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col">
                        <StarRender />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <span>
                                {scaleLabel}: <strong>{value}</strong>
                            </span>
                            <StarRender />
                        </div>
                        <div className="flex flex-col space-y-1">
                            {scaleValues.length > 1 && <span>{t('generic.scale_within', { scale: scaleLabel })}</span>}
                            <span dangerouslySetInnerHTML={{ __html: scaleLabels }} />
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
