import {ManageForm} from "@/app/dashboard/content-generation/manage-form";

export default async function Page() {
    return (
        <div className="space-y-6">
            <header className="prose dark:prose-invert prose-sm">
                <h1 className="mb-2 text-2xl font-bold">Configure</h1>
                <p className="mt-1 text-base">
                    Configure parameters for your AI models. Settings are saved per model.
                </p>
            </header>
            <hr/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
                <ManageForm />
            </div>
        </div>
    )
}