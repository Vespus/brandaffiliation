import * as React from "react"

import {useTiptapEditor} from "@/hooks/use-tiptap-editor"
import {ToolbarButton} from "@/components/editor/ui/toolbar";
import {useMark, UseMarkConfigType} from "@/components/tiptap-ui/mark-button/use-mark";

type MarkButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & UseMarkConfigType

export const MarkButton = ({
                               editor: providedEditor,
                               type,
                               onToggled,
                               onClick,
                               children,
                           }: MarkButtonProps) => {

    const {editor} = useTiptapEditor(providedEditor)
    const {
        isVisible,
        handleMark,
        label,
        canToggle,
        isActive,
    } = useMark({
        editor,
        type,
        onToggled,
    })

    const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            handleMark()
        },
        [handleMark, onClick]
    )

    if (!isVisible) {
        return null
    }

    return (
        <ToolbarButton
            type="button"
            disabled={!canToggle}
            data-style="ghost"
            data-active-state={isActive ? "on" : "off"}
            data-disabled={!canToggle}
            role="button"
            tabIndex={-1}
            aria-label={label}
            aria-pressed={isActive}
            pressed={isActive}
            tooltip={label}
            onClick={handleClick}
        >
            {children}
        </ToolbarButton>
    )
}

MarkButton.displayName = "MarkButton"
