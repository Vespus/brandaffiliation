"use client"
import {useTranslationParams} from "@/app/dashboard/translations/use-translation-params";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "lucide-react";

export const TranslationPageHeader = () => {
    const {setParams} = useTranslationParams()

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-6">Manage Translations</h1>
            <Button
                variant="outline"
                onClick={() => {
                    setParams({createTranslation: true})
                }}
            >
                <PlusIcon/>
                Add new Translation
            </Button>
        </div>
    )
}