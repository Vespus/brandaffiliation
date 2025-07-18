import * as React from "react";
import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ShortcodeWrapper } from "@/app/dashboard/content-generation/form-elements/prompt-area-shortcodes";
import { UserPrompts } from "@/app/dashboard/content-generation/form-elements/prompt-area-user-prompts";
import { Button } from "@/components/ui/button";
import { ScanEyeIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import Markdown from "react-markdown";
import { api } from "@/lib/trpc/react";
import { useFormContext } from "react-hook-form";
import { ContentGenerateSchema } from "@/app/dashboard/content-generation/schema";
import { z } from "zod";

type PromptAreaType = React.ComponentProps<"textarea"> & {
    onChange: (val: string) => void
}

export const PromptArea = ({...props}: PromptAreaType) => {
    const ref = useRef<HTMLTextAreaElement | null>(null)

    return (
        <div className="flex flex-col gap-4 min-w-0" data-registry="plate">
            <div className="flex gap-4">
                <UserPrompts/>
            </div>

            <ShortcodeWrapper editor={ref}>
                <Textarea
                    {...props}
                    ref={ref}
                    onChange={props.onChange}
                    className="max-h-96"
                />
                <p className="text-muted-foreground text-xs mt-1">Shortcode list is available on *right click*</p>
            </ShortcodeWrapper>
        </div>
    )
}
