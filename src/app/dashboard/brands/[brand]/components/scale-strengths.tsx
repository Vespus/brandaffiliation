import { getLocale, getTranslations } from 'next-intl/server'

import { BrandWithCharacteristicAndScales } from '@/db/types'
import { roundBothWays } from '@/utils/round-both-ways'

interface ScaleStrengthsProps {
    scale: string
    brand: BrandWithCharacteristicAndScales
}

export const ScaleStrengths = async ({ scale, brand }: ScaleStrengthsProps) => {
    const locale = await getLocale()
    const t = await getTranslations({ locale })
    const value = brand[scale as keyof typeof brand] as number

    const scaleLabel = t(`scale.${scale}`)
    const scaleValues = roundBothWays(value)
    const scaleLabels = scaleValues.map((v) => t(`scale_value.${scale}_${v}`))

    return (
        <div className="flex flex-col text-xs">
            <div className="font-medium">{scaleLabel}:</div>
            <ul className="list list-inside list-disc">
                {scaleLabels.map((feature) => (
                    <li className="text-muted-foreground text-xs" key={feature}>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    )
}
