import { ContentGenerationProvider } from "@/app/dashboard/content-generation/content-generation-context";
import { getStore } from "@/utils/get-store";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({children}: Readonly<{ children: React.ReactNode; }>) {
    const cookieList = await cookies();

    if (!cookieList.has("qs-pay-store-id")) {
        redirect("/dashboard?error=store-missing")
    }

    const store = await getStore()
    return (
        <ContentGenerationProvider store={store}>
            {children}
        </ContentGenerationProvider>
    )
}