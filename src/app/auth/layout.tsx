import React from "react";
import {BluetoothConnected} from "lucide-react";

export default function AuthLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[1fr_40%] min-h-screen w-full">
            <div className="shadow-2xl z-10 border-r">
                {/*//TODO: Header*/}
                <div className="absolute top-10 left-10 text-2xl select-none flex items-center space-x-4">
                    <BluetoothConnected/>
                    <div>
                        <span className="text-gray-500 font-light">Brand</span>
                        <span className="text-black font-bold">Affiliation</span>
                    </div>
                </div>

                <main className="flex flex-col items-center justify-center w-full h-full">
                    {children}
                </main>
            </div>
            <div className="z-0 relative flex items-center justify-center">
                <div className="absolute z-[-1] top-0 left-0 w-full h-full bg-gray-200 bg-repeat opacity-10 pointer-events-none"></div>
                <div className="prose dark:prose-invert grid place-items-center">
                    <div className="text-2xl select-none flex items-center space-x-4">
                        <BluetoothConnected/>
                        <div>
                            <span className="text-gray-500 font-light">Brand</span>
                            <span className="text-black font-bold">Affiliation</span>
                        </div>
                    </div>
                    <p className="font-semibold text-xs uppercase">A simple and secure way to brand management</p>
                    <small>Made with ❤️ by DePauli</small>
                </div>
            </div>
        </div>
    )
}