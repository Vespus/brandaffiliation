import {ManageForm} from "@/app/dashboard/content-generation/manage-form";

export default async function Page() {
    return (
        <div className="flex flex-col xl:flex-row gap-8 flex-1 mb-6">
            <ManageForm />
        </div>
    )
}