import { PromptForm } from "@/app/dashboard/prompts/[id]/prompt-form";
import { getPromptById } from "@/app/dashboard/prompts/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, unauthorized } from "next/navigation";

type PromptDetailPageProps = {
    params: Promise<{ id: string }>
}

export default async function PromptDetailPage(props: PromptDetailPageProps) {
    const { id } = await props.params;

    const {user} = await getUser()
    const {success} = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            role: "admin",
            permission: {
                prompt: ["list"],
            }
        }
    })

    if (!success) {
        unauthorized()
    }

    const prompt = await getPromptById(parseInt(id));

    if (!prompt) {
        notFound();
    }

    return (
        <div className="max-w-4xl w-full flex flex-col gap-6">
            <div className="flex space-x-2 items-center">
                <Link href="/dashboard/prompts"><ArrowLeft/></Link>
                <h1 className="font-semibold text-2xl">
                    {prompt.name}
                </h1>
            </div>
            
            <Card className="rounded-md shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Prompt Details</CardTitle>
                        <Badge variant="secondary">System Prompt</Badge>
                    </div>
                    <CardDescription>
                        {prompt.description || "No description provided"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Name</Label>
                            <p className="font-medium">{prompt.name}</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Created At</Label>
                            <p className="font-medium">
                                {prompt.createdAt ? format(new Date(prompt.createdAt), "MMM dd, yyyy HH:mm") : "—"}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Last Updated</Label>
                            <p className="font-medium">
                                {prompt.updatedAt ? format(new Date(prompt.updatedAt), "MMM dd, yyyy HH:mm") : "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PromptForm prompt={prompt} />
        </div>
    );
} 