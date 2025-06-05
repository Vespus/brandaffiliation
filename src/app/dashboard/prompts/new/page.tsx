import { PromptForm } from "@/app/dashboard/prompts/[id]/prompt-form";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { unauthorized } from "next/navigation";

export default async function NewPromptPage() {
    const {user} = await getUser()
    const {success} = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            role: "admin",
            permission: {
                prompt: ["create"],
            }
        }
    })

    if (!success) {
        unauthorized()
    }

    return (
        <div className="max-w-7xl w-full flex flex-col gap-6">
            <div className="flex space-x-2 items-center">
                <Link href="/dashboard/prompts"><ArrowLeft/></Link>
                <h1 className="font-semibold text-2xl">Create New System Prompt</h1>
            </div>
            <PromptForm />
        </div>
    );
} 