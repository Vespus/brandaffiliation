import {Suspense} from "react";
import {Models} from "@/app/dashboard/configure/models";

export default async function BrandsPage() {
    return (
        <div className="max-w-4xl">
            <Suspense>
                <Models />
            </Suspense>
        </div>
    );
}