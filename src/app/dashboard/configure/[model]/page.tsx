import {db} from "@/db";
import {eq} from "drizzle-orm";
import {aiModels} from "@/db/schema";
import {redirect} from "next/navigation";
import {buttonVariants} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {ManageForm} from "@/app/dashboard/configure/[model]/manage-form";
import {AISetting, getAISettings, getDefaultSettings} from "@/db/presets";

type PageProps = {
    params: Promise<{ model: string }>
}

export default async function Page(props: PageProps) {
    const {model: modelName} = await props.params
    const [model, settings, defaultSettings] = await Promise.all([
        db.query.aiModels.findFirst({where: eq(aiModels.modelName, modelName)}),
        await getAISettings(modelName) as AISetting,
        await getDefaultSettings(modelName) as AISetting
    ])

    if (!model) {
        redirect("/dashboard/configure?error=not-found")
    }


    return (
        <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/configure" className={cn(buttonVariants({variant: "ghost", size: "icon"}))}>
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">Back to models</span>
                </Link>
                <div>
                    <h1 className="text-base font-semibold">{model.name} Settings</h1>
                    <p className="text-muted-foreground text-xs">{model.description}</p>
                </div>
            </div>
            <div className="grid gap-6">
                <ManageForm
                    data={settings}
                    model={model}
                    defaultConfig={defaultSettings}
                />
            </div>
        </div>
    )
}