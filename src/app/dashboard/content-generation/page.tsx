import {ManageForm} from "@/app/dashboard/content-generation/manage-form";
import { GeneratedContentView } from "@/app/dashboard/content-generation/generated-content-view";

export default async function Page() {
    return (
        <div className="flex gap-8 flex-1 mb-6 min-h-0 min-w-0">
            <ManageForm />
            <GeneratedContentView/>
        </div>
    )
}