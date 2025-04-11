"use client"

type SimpleRatingProps = React.HTMLAttributes<HTMLDivElement> & { value: number, maxStars?: number }

export const SimpleRating = ({ value, maxStars = 5, children }: SimpleRatingProps) => {
    return (
        <div className="flex flex-col">
            <div className="text-yellow-500">{'★'.repeat(value)}{'☆'.repeat(maxStars - value)}</div>
            {children}
        </div>
    )
}