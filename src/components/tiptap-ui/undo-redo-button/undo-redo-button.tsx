'use client'

import * as React from 'react'

import { UseUndoRedoConfig, useUndoRedo } from '@/components/tiptap-ui/undo-redo-button/use-undo-redo'
import { ToolbarButton } from '@/components/tiptap/toolbar'
import { useTiptapEditor } from '@/hooks/use-tiptap-editor'

export type UndoRedoButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & UseUndoRedoConfig

export const UndoRedoButton = ({
    editor: providedEditor,
    action,
    hideWhenUnavailable = false,
    onExecuted,
    onClick,
    children,
    ...buttonProps
}: UndoRedoButtonProps) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { isVisible, handleAction, label, canExecute } = useUndoRedo({
        editor,
        action,
        hideWhenUnavailable,
        onExecuted,
    })

    const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            handleAction()
        },
        [handleAction, onClick]
    )

    if (!isVisible) {
        return null
    }

    return (
        <ToolbarButton
            type="button"
            disabled={!canExecute}
            data-style="ghost"
            data-disabled={!canExecute}
            role="button"
            tabIndex={-1}
            aria-label={label}
            tooltip={label}
            onClick={handleClick}
            {...buttonProps}
        >
            {children}
        </ToolbarButton>
    )
}

UndoRedoButton.displayName = 'UndoRedoButton'
