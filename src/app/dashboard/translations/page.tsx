import { TranslationCreateForm } from './translation-create-form';
import { TranslationTable } from './translation-table';
import { TranslationEditDialog } from "@/app/dashboard/translations/translation-edit-dialog";
import { TranslationPageHeader } from "@/app/dashboard/translations/translation-page-header";
import { getTranslations, searchParamsCache } from "@/app/dashboard/translations/queries";
import { Suspense } from "react";
import { SearchParams } from "nuqs/server";

interface TranslationPageProps {
    searchParams: Promise<SearchParams>
}

export default async function TranslationPage(props: TranslationPageProps) {
    const searchParams = await props.searchParams;
    const parsedParams = searchParamsCache.parse(searchParams);
    const translationsPromise = getTranslations(parsedParams);

    return (
        <div className="max-w-7xl">
            <TranslationPageHeader/>
            <Suspense fallback={<div>Loading translations...</div>}>
                <TranslationTable promise={translationsPromise}/>
            </Suspense>
            <TranslationEditDialog/>
            <TranslationCreateForm/>
        </div>
    );
}
