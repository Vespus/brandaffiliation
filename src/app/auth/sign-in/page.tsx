import { LoginForm } from "@/app/auth/sign-in/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function Login() {
    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Apple or Google account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm/>
                    test-{process.env.BETTER_AUTH_KEY || "-test"}
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