import {Suspense} from "react";
import {AIModels} from "@/app/dashboard/configure/ai-models";

export default async function BrandsPage() {
    return (
        <div className="max-w-4xl">
            <Suspense>
                <AIModels />
            </Suspense>
        </div>
    );
}