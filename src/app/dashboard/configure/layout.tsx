export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="space-y-6">
            <header className="prose dark:prose-invert prose-sm">
                <h1 className="mb-2 text-2xl font-bold">Configure</h1>
                <p className="mt-1 text-base">Configure parameters for your AI models. Settings are saved per model.</p>
            </header>
            <hr />
            {children}
        </div>
    )
}
