import { FlowStudio } from "@/app/dashboard/content-generation/flow-studio";
import { ManageForm } from "@/app/dashboard/content-generation/manage-form";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";

export default async function Page() {
    const session = await getUser()
    const {error} = await auth.api.userHasPermission({
        body: {
            userId: session.user.id,
            role: "user",
            permissions: {
                contentGeneration: ["list", "create"],
            },
        }
    })

    return (
        <div className="flex gap-8 flex-1 min-h-0 max-h-[calc(100svh_-_calc(var(--spacing)_*_16)_-_calc(var(--spacing)_*_4)))] border-t">
            <ManageForm/>
            <FlowStudio/>
        </div>
    )
}