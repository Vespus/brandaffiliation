import { ContentGenerationProvider } from "@/app/dashboard/content-generation/content-generation-context";
import { QspayApplyDialog } from "@/app/dashboard/content-generation/dialogs/qspay-apply-dialog";
import { ManageForm } from "@/app/dashboard/content-generation/manage-form";
import { TemporaryStudio } from "@/app/dashboard/content-generation/temporary-studio";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { QSPayClient } from "@/lib/qs-pay-client";
import { QSPayStore } from "@/qspay-types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getUser()
    const cookieList = await cookies();
    const {error} = await auth.api.userHasPermission({
        body: {
            userId: session.user.id,
            role: "user",
            permissions: {
                contentGeneration: ["list", "create"],
            },
        }
    })

    if (!cookieList.has("qs-pay-store-id")) {
        redirect("/dashboard?error=store-missing")
    }

    const {result: store} = await QSPayClient<QSPayStore>("Store/Get", {
        query: {
            storeId: cookieList.get("qs-pay-store-id")?.value
        }
    })

    return (
        <ContentGenerationProvider store={store}>
            <div
                className="flex gap-4 flex-1 min-h-0 max-h-[calc(100svh_-_calc(var(--spacing)_*_16)_-_calc(var(--spacing)_*_4)))] border-t divide-x">
                <ManageForm/>
                <TemporaryStudio/>
                {/*<ReactFlowProvider>
                <FlowStudio/>
            </ReactFlowProvider>*/}
            </div>
            <QspayApplyDialog />
        </ContentGenerationProvider>
    )
}