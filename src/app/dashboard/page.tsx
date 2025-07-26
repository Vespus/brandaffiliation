"use client"
import { StoreMissing } from "@/app/dashboard/session-errors/store-missing";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default  function Page() {
    const handle = async () => {
        const newUser = await authClient.admin.createUser({
            name: "Alex Depauli",
            email: "a.depauli@depauli.com",
            password: "Test123!",
            role: "user", // this can also be an array for multiple roles (e.g. ["user", "sale"])
        });
        console.log(newUser);
    }

    return (
        <div>
            <StoreMissing />
        </div>
    )
}