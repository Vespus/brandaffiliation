import {Suspense} from "react";
import {Models} from "@/app/dashboard/configure/models";
import {AISetting} from "@/db/types";
import {getAISettings} from "@/db/presets";
import { db } from "@/db";
import {aiModels} from "@/db/schema";
import {eq} from "drizzle-orm";

export default async function BrandsPage() {
    const [AIModels, AISettings] = await Promise.all([
        db.query.aiModels.findMany({
            where: (
                eq(aiModels.isActive, true)
            ),
            with: {
                aiProvider: {
                    columns: {
                        name: true,
                        code: true
                    }
                }
            }
        }),
        getAISettings()
    ])

    return (
        <div className="max-w-4xl">
            <Suspense>
                <Models aiModels={AIModels} aiSettings={AISettings as AISetting[]} />
            </Suspense>
        </div>
    );
}