'use client';

import * as React from 'react';

import {
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';

import { useEditorReadOnly } from '@udecode/plate/react';
import {
    BoldIcon,
    Code2Icon,
    ItalicIcon,
    StrikethroughIcon,
    UnderlineIcon,
    WandSparklesIcon,
} from 'lucide-react';

import { MoreDropdownMenu } from '@/components/editor/ui/more-dropdown-menu';

import { AIToolbarButton } from './ai-toolbar-button';
import { AlignDropdownMenu } from './align-dropdown-menu';
import { EmojiDropdownMenu } from './emoji-dropdown-menu';
import { FontSizeToolbarButton } from './font-size-toolbar-button';
import { RedoToolbarButton, UndoToolbarButton } from './history-toolbar-button';
import {
    BulletedIndentListToolbarButton,
    NumberedIndentListToolbarButton,
} from './indent-list-toolbar-button';
import { IndentTodoToolbarButton } from './indent-todo-toolbar-button';
import { IndentToolbarButton } from './indent-toolbar-button';
import { InsertDropdownMenu } from './insert-dropdown-menu';
import { LineHeightDropdownMenu } from './line-height-dropdown-menu';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { OutdentToolbarButton } from './outdent-toolbar-button';
import { TableDropdownMenu } from './table-dropdown-menu';
import { ToolbarGroup } from './toolbar';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

export function FixedToolbarButtons() {
    const readOnly = useEditorReadOnly();

    return (
        <div className="flex w-full">
            {!readOnly && (
                <>
                    <ToolbarGroup>
                        <UndoToolbarButton />
                        <RedoToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <AIToolbarButton tooltip="AI commands">
                            <WandSparklesIcon />
                        </AIToolbarButton>
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <InsertDropdownMenu />
                        <TurnIntoDropdownMenu />
                        <FontSizeToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                            <BoldIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={ItalicPlugin.key}
                            tooltip="Italic (⌘+I)"
                        >
                            <ItalicIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={UnderlinePlugin.key}
                            tooltip="Underline (⌘+U)"
                        >
                            <UnderlineIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={StrikethroughPlugin.key}
                            tooltip="Strikethrough (⌘+⇧+M)"
                        >
                            <StrikethroughIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
                            <Code2Icon />
                        </MarkToolbarButton>

                    </ToolbarGroup>

                    <ToolbarGroup>
                        <AlignDropdownMenu />

                        <NumberedIndentListToolbarButton />
                        <BulletedIndentListToolbarButton />
                        <IndentTodoToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <LinkToolbarButton />
                        <TableDropdownMenu />
                        <EmojiDropdownMenu />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <LineHeightDropdownMenu />
                        <OutdentToolbarButton />
                        <IndentToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <MoreDropdownMenu />
                    </ToolbarGroup>
                </>
            )}

            <div className="grow" />

        </div>
    );
}
