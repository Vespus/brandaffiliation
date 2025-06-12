'use client';

import { type Value, TrailingBlockPlugin } from 'platejs';
import { type TPlateEditor, useEditorRef } from 'platejs/react';

import { AIKit } from '@/components/editor/plugins/ai-kit';
import { AlignKit } from '@/components/editor/plugins/align-kit';
import { AutoformatKit } from '@/components/editor/plugins/autoformat-kit';
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { BlockMenuKit } from '@/components/editor/plugins/block-menu-kit';
import { BlockPlaceholderKit } from '@/components/editor/plugins/block-placeholder-kit';
import { CodeBlockKit } from '@/components/editor/plugins/code-block-kit';
import { ColumnKit } from '@/components/editor/plugins/column-kit';
import { CursorOverlayKit } from '@/components/editor/plugins/cursor-overlay-kit';
import { DateKit } from '@/components/editor/plugins/date-kit';
import { DndKit } from '@/components/editor/plugins/dnd-kit';
import { EmojiKit } from '@/components/editor/plugins/emoji-kit';
import { ExitBreakKit } from '@/components/editor/plugins/exit-break-kit';
import { FixedToolbarKit } from '@/components/editor/plugins/fixed-toolbar-kit';
import { FontKit } from '@/components/editor/plugins/font-kit';
import { LineHeightKit } from '@/components/editor/plugins/line-height-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { SlashKit } from '@/components/editor/plugins/slash-kit';
import { TableKit } from '@/components/editor/plugins/table-kit';
import { TocKit } from '@/components/editor/plugins/toc-kit';

export const EditorKit = [
    ...AIKit,

    // Elements
    ...BasicBlocksKit,
    ...CodeBlockKit,
    ...TableKit,
    ...TocKit,
    ...ColumnKit,
    ...DateKit,
    ...LinkKit,

    // Marks
    ...BasicMarksKit,
    ...FontKit,

    // Block Style
    ...ListKit,
    ...AlignKit,
    ...LineHeightKit,

    // Editing
    ...SlashKit,
    ...AutoformatKit,
    ...CursorOverlayKit,
    ...BlockMenuKit,
    ...DndKit,
    ...EmojiKit,
    ...ExitBreakKit,
    TrailingBlockPlugin,

    // Parsers
    ...MarkdownKit,

    // UI
    ...BlockPlaceholderKit,
    ...FixedToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();