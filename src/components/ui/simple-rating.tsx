"use client"

import { Star, StarHalf } from "lucide-react"

type SimpleRatingProps = React.HTMLAttributes<HTMLDivElement> & {
    value: number,
    maxStars?: number
}

export const SimpleRating = ({ value, maxStars = 5, children }: SimpleRatingProps) => {
    const roundedValue = Math.round(value * 2) / 2
    const wholeStars = Math.floor(roundedValue)
    const halfStar = roundedValue % 1 === 0.5

    return (
        <div className="flex flex-col">
            <div className="flex">
                {[...Array(wholeStars)].map((_, i) => (
                    <Star key={i} className="fill-yellow-500 stroke-0 size-4" />
                ))}
                {halfStar && (
                    <span className="relative">
                        <Star className="fill-gray-200 dark:fill-muted stroke-0 size-4" />
                        <StarHalf className="fill-yellow-500 absolute top-0 left-0 stroke-0 size-4" />
                    </span>
                )}
                {[...Array(maxStars - wholeStars - (halfStar ? 1 : 0))].map((_, i) => (
                    <Star key={i} className="fill-gray-200 dark:fill-muted stroke-0 size-4" />
                ))}
            </div>
            {children}
        </div>
    )
}