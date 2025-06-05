import { PromptPageHeader } from "@/app/dashboard/prompts/prompt-page-header";
import { PromptsTable } from "@/app/dashboard/prompts/prompt-table";
import { getPrompts, searchParamsCache } from "@/app/dashboard/prompts/queries";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { unauthorized } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

type PromptsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function PromptsPage(props: PromptsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const {user} = await getUser()
    const {success} = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            role: "admin",
            permission: {
                prompt: ["list"],
            }
        }
    })

    if (!success) {
        unauthorized()
    }

    const prompts = getPrompts(search)

    return (
        <div className="flex flex-col gap-6 max-w-7xl">
            <PromptPageHeader/>
            <Suspense>
                <PromptsTable promise={prompts}/>
            </Suspense>
        </div>
    );
}