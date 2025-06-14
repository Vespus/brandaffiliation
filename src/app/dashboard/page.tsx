import { StoreMissing } from "@/app/dashboard/session-errors/store-missing";

export default async function Page() {
    return (
        <div>
            StartPage
            <StoreMissing />
        </div>
    )
}