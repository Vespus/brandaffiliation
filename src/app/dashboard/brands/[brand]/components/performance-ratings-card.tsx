import { BrandWithCharacteristicAndScales, Scale } from "@/db/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartAreaIcon } from "lucide-react";
import { SimpleRating } from "@/components/ui/simple-rating";
import { getLocale, getTranslations } from "next-intl/server";

interface PerformanceRatingsCardProps {
    brand: BrandWithCharacteristicAndScales;
    scales: Scale[];
}

export const PerformanceRatingsCard = async ({brand, scales}: PerformanceRatingsCardProps) => {
    const locale = await getLocale();
    const t = await getTranslations({locale});

    return (
        <Card className="flex-1">
            <CardContent className="flex flex-col gap-4">
                <CardHeader className="flex items-center px-0 space-x-2">
                    <ChartAreaIcon/>
                    Performance Ratings
                </CardHeader>
                <div>
                    <div className="grid grid-cols-3 gap-6">
                        {scales.map((scale) => (
                            <div key={scale.id} className="flex flex-col">
                                <div className="flex justify-between gap-4 text-xs">
                                    <span>{t(`scale.${scale.label}`)}</span>
                                    <span className="text-indigo-500">
                                        {brand[scale.label as keyof typeof brand] as number}/5
                                    </span>
                                </div>
                                <SimpleRating
                                    value={brand[scale.label as keyof typeof brand] as number}
                                    scale={scale.label}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};