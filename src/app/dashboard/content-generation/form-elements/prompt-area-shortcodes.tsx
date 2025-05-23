import * as React from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger
} from "@/components/ui/context-menu";

const shortCodes = [
    {
        label: "Brand Features",
        val: "{brand.characteristics}"
    },
    {
        label: "Brand Name",
        val: "{brand.name}"
    },
    {
        label: "Scale List",
        val: "{brand.scales}"
    },
    {
        label: "Category",
        val: "{form.category}"
    },
    {
        label: "Saison",
        val: "{form.season}"
    }
]

export const ShortcodeWrapper = ({
                                     editor,
                                     children
                                 }: {
                                     children: React.ReactNode
                                     editor: React.RefObject<HTMLTextAreaElement | null>
                                 }
) => {
    const appendText = (value: string) => {
        if (!editor.current) {
            return
        }
        const start = editor.current.selectionStart;
        const end = editor.current.selectionEnd;
        const text = editor.current.value;

        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        if (nativeTextAreaValueSetter) {
            nativeTextAreaValueSetter.call(editor.current, text.substring(0, start) + value + text.substring(end))
        }

        setTimeout(() => {
            if(editor.current) {
                editor.current.focus();
                editor.current.setSelectionRange(start + value.length, start + value.length);

                // Trigger change event
                editor.current.dispatchEvent(new Event('input', {bubbles: true}))
            }
        }, 100)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                {shortCodes.map(shortCode => (
                    <ContextMenuItem
                        key={shortCode.val}
                        onClick={() => {
                            appendText(shortCode.val)
                        }}
                    >
                        {shortCode.label}
                        <ContextMenuShortcut>
                            {shortCode.val}
                        </ContextMenuShortcut>
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    )
}
