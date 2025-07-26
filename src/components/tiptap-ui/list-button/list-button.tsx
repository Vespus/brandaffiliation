"use client"

import * as React from "react"

import {useTiptapEditor} from "@/hooks/use-tiptap-editor"
import {useList, UseListConfig} from "@/components/tiptap-ui/list-button/use-list";
import {ToolbarButton} from "@/components/tiptap/toolbar";

export type ListButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & UseListConfig

export const ListButton = (
    {
        editor: providedEditor,
        type,
        hideWhenUnavailable = false,
        onToggled,
        onClick,
        children,
        ...buttonProps
    }: ListButtonProps
) => {
    const {editor} = useTiptapEditor(providedEditor)
    const {
        isVisible,
        canToggle,
        isActive,
        handleToggle,
        label,
    } = useList({
        editor,
        type,
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

ListButton.displayName = "ListButton"
