import { SignupForm } from "@/app/auth/sign-up/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page() {
    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader className="text-center flex items-start">
                    <div className="flex-none mr-2 pt-0.5">
                        <Link href="/auth/sign-in">
                            <ArrowLeft/>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl">Welcome to Brand Afilliation</CardTitle>
                        <CardDescription>
                            Create an account
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <SignupForm/>
                </CardContent>
            </Card>
            <div
                className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}