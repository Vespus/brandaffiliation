import {FormMessage, Message} from "@/components/form-message";
import {SignupForm} from "@/app/auth/sign-up/signup-form";

export default async function Page(props: { searchParams: Promise<Message> }) {
    const searchParams = await props.searchParams;
    return (
        <div className="my-auto mx-auto min-w-96">
            <div className="mb-4">
                <h1 className="font-semibold text-lg">Sign Up</h1>
                <p className="text-xs text-muted-foreground">Create a new account</p>
            </div>
            <SignupForm />
            <FormMessage message={searchParams} />
        </div>
    );
}