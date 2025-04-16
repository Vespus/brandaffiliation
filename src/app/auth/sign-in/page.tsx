import {LoginForm} from "@/app/auth/sign-in/login-form";

export default async function Login() {
    return (
        <div className="my-auto mx-auto min-w-96">
            <div className="mb-4">
                <h1 className="font-semibold text-lg">Login</h1>
                <p className="text-xs text-muted-foreground">Login to your account</p>
            </div>
            <LoginForm/>
        </div>
    );
}