import { BrandWithCharacteristicAndScales } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowBigRightDash } from "lucide-react";

interface BrandInfoCardProps {
    brand: BrandWithCharacteristicAndScales;
}

export const BrandInfoCard = ({brand}: BrandInfoCardProps) => {
    return (
        <Card className="flex-none">
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Avatar className="size-12">
                        <AvatarFallback>
                            {brand.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div>{brand.name}</div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="font-semibold">Characteristics</h2>
                    <ul className="flex flex-col gap-2">
                        {brand.characteristic?.map((char) => (
                            <div key={char.id} className="flex items-center gap-2 text-xs">
                                <ArrowBigRightDash size={12}/>
                                <span>{char.value}</span>
                            </div>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};