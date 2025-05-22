import { DEFAULT_SCALE_WEIGHTS } from "@/app/dashboard/brands/[brand]/constant";
import { findSimilarityByScale } from "@/app/dashboard/brands/[brand]/queries";
import { searchParamsCache } from "@/app/dashboard/brands/[brand]/search-params";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrandWithCharacteristicAndScales } from "@/db/types";
import { cn } from "@/lib/utils";
import { ArrowBigRightDash, ArrowUp, GitCompareIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SearchParams } from "nuqs/server";

export const NeighborScaleType = async ({brand, searchParams}: {
    brand: BrandWithCharacteristicAndScales,
    searchParams: SearchParams
}) => {
    const locale = await getLocale();
    const t = await getTranslations({locale});
    const scaleSearchParams = searchParamsCache.parse(searchParams);
    const similarBrands = await findSimilarityByScale(brand, scaleSearchParams)

    const formatSimilarity = (similarity: number) => {
        return `${Math.round(similarity * 100)}%`

    }

    const metrics = (a: BrandWithCharacteristicAndScales, b: BrandWithCharacteristicAndScales) => Object.keys(DEFAULT_SCALE_WEIGHTS).map(scale => ({
        label: t(`scale.${scale}`),
        value: a[scale as keyof typeof DEFAULT_SCALE_WEIGHTS],
        parentValue: b[scale as keyof typeof DEFAULT_SCALE_WEIGHTS]
    }))

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-normal">
                    <GitCompareIcon/>
                    <span>Similar Brands</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {similarBrands.map(neighborBrand => (
                        <Card key={neighborBrand.id} className="shadow-none">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-center">
                                    <span>{neighborBrand.name}</span>
                                    <Badge
                                        className="ml-2 bg-green-600">{formatSimilarity(neighborBrand.combined_similarity)}</Badge>
                                </CardTitle>
                                <CardDescription className="flex justify-between">
                                    <div>Scale Similarity: {formatSimilarity(neighborBrand.scale_similarity)}</div>
                                    <div>Character Similarity: {formatSimilarity(neighborBrand.text_similarity)}</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 grid grid-cols-3 gap-2">
                                    {metrics(neighborBrand, brand).map((metric, i) => (
                                        <MetricItem key={i} {...metric}/>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Characteristics:</h4>
                                    <ul className="flex flex-col gap-2">
                                        {neighborBrand.characteristic?.map((char) => (
                                            <div key={char.id} className="flex items-start gap-2 text-xs">
                                                <ArrowBigRightDash size={12} className="flex-none mt-0.5"/>
                                                <span>{char.value}</span>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function MetricItem({label, value, parentValue}: { label: string; value: number; parentValue: number }) {
    const percentage = (value / parentValue) * 100
    const isExceeding = value > parentValue

    return (
        <div className="space-y-1">
            <div className="flex flex-col justify-between">
                <span className="text-xs font-medium truncate text-muted-foreground">{label}</span>
                <div className="flex justify-between tabular-nums">
                    <span className="text-xs">{value} vs {parentValue}</span>
                    <span
                        className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            value > parentValue && "text-orange-500",
                            value === parentValue && "text-green-700",
                            value < parentValue && "text-muted-foreground"
                        )}>
                        {Math.round(percentage)}%
                        {isExceeding && <ArrowUp size={12}/>}
                    </span>
                </div>
            </div>
            <Progress
                value={percentage}
                className={cn(
                    "h-2",
                    value > parentValue && "bg-orange-100",
                    value === parentValue && "bg-green-100",
                    value < parentValue && "bg-muted"
                )}
            />
        </div>
    )
}