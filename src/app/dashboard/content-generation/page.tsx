import { GeneratedContentView } from "@/app/dashboard/content-generation/generated-content-view";
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

    console.log(error)

    return (
        <div className="flex gap-8 flex-1 mb-6 min-h-0 min-w-0">
            <ManageForm/>
            <GeneratedContentView/>
        </div>
    )
}