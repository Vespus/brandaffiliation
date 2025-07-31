'use client'

import { useEffect, useState } from 'react'

import { useTheme } from 'next-themes'

import { MoonIcon, SlidersHorizontalIcon, SunIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const ThemeSelector = () => {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }
    const onThemeChange = (theme: string) => {
        setTheme(theme)
    }

    return (
        <RadioGroup className="gap-2" defaultValue={theme} onValueChange={onThemeChange}>
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <RadioGroupItem value="light" id="light" className="order-1 after:absolute after:inset-0" />
                <div className="flex grow items-start gap-3">
                    <SunIcon className="flex-none" />
                    <div className="grid grow gap-2">
                        <Label htmlFor="light">light</Label>
                        <p className="text-muted-foreground text-xs">Pick a clean and classic light theme.</p>
                    </div>
                </div>
            </div>
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <RadioGroupItem value="dark" id="dark" className="order-1 after:absolute after:inset-0" />
                <div className="flex grow items-start gap-3">
                    <MoonIcon className="flex-none" />
                    <div className="grid grow gap-2">
                        <Label htmlFor="dark">Dark</Label>
                        <p className="text-muted-foreground text-xs">Select a sleek and modern dark theme.</p>
                    </div>
                </div>
            </div>
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <RadioGroupItem value="system" id="system" className="order-1 after:absolute after:inset-0" />
                <div className="flex grow items-start gap-3">
                    <SlidersHorizontalIcon className="flex-none" />
                    <div className="grid grow gap-2">
                        <Label htmlFor="system">System</Label>
                        <p className="text-muted-foreground text-xs">Adapts to your device&#39;s theme.</p>
                    </div>
                </div>
            </div>
        </RadioGroup>
    )
}
