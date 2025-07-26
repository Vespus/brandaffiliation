"use client"

import * as React from "react"

import {useTiptapEditor} from "@/hooks/use-tiptap-editor"
import {useHeading, UseHeadingConfig} from "@/components/tiptap-ui/heading-button/use-heading";
import {ToolbarButton} from "@/components/tiptap/toolbar";

export type HeadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & UseHeadingConfig

export const HeadingButton = (
    {
        editor: providedEditor,
        level,
        hideWhenUnavailable = false,
        onToggled,
        onClick,
        children,
        ...buttonProps
    }: HeadingButtonProps) => {
    const {editor} = useTiptapEditor(providedEditor)
    const {
        isVisible,
        canToggle,
        isActive,
        handleToggle,
        label,
    } = useHeading({
        editor,
        level,
        hideWhenUnavailable,
        onToggled,
    })

    const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            handleToggle()
        },
        [handleToggle, onClick]
    )

    if (!isVisible) {
        return null
    }

    return (
        <ToolbarButton
            type="button"
            data-style="ghost"
            data-active-state={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canToggle}
            data-disabled={!canToggle}
            aria-label={label}
            aria-pressed={isActive}
            tooltip={label}
            onClick={handleClick}
            pressed={isActive}
            {...buttonProps}
        >
            {children}
        </ToolbarButton>
    )
}

HeadingButton.displayName = "HeadingButton"
