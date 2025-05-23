import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export default async function Page() {
    const user = await getUser()

    if (user) {
        return redirect("/dashboard")
    }

    return null
}