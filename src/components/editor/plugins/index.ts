'use client';

import emojiMartData from '@emoji-mart/data';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import {
    FontBackgroundColorPlugin,
    FontColorPlugin,
    FontSizePlugin,
} from '@udecode/plate-font/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { FixedToolbarPlugin } from '@/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/components/editor/plugins/floating-toolbar-plugin';

import { aiPlugins } from './ai-plugins';
import { alignPlugin } from './align-plugin';
import { autoformatPlugin } from './autoformat-plugin';
import { basicNodesPlugins } from './basic-nodes-plugins';
import { blockMenuPlugins } from './block-menu-plugins';
import { cursorOverlayPlugin } from './cursor-overlay-plugin';
import { dndPlugins } from './dnd-plugins';
import { exitBreakPlugin } from './exit-break-plugin';
import { indentListPlugins } from './indent-list-plugins';
import { lineHeightPlugin } from './line-height-plugin';
import { linkPlugin } from './link-plugin';
import { markdownPlugin } from './markdown-plugin';
import { resetBlockTypePlugin } from './reset-block-type-plugin';
import { skipMarkPlugin } from './skip-mark-plugin';
import { softBreakPlugin } from './soft-break-plugin';
import { tablePlugin } from './table-plugin';
import { tocPlugin } from './toc-plugin';

export const viewPlugins = [
    ...basicNodesPlugins,
    HorizontalRulePlugin,
    linkPlugin,
    tablePlugin,
    tocPlugin,
    ColumnPlugin,

    // Marks
    FontColorPlugin,
    FontBackgroundColorPlugin,
    FontSizePlugin,
    skipMarkPlugin,

    // Block Style
    alignPlugin,
    ...indentListPlugins,
    lineHeightPlugin,
] as const;

export const editorPlugins = [
    // AI
    ...aiPlugins,

    // Nodes
    ...viewPlugins,

    // Functionality
    SlashPlugin.extend({
        options: {
            triggerQuery(editor) {
                return !editor.api.some({
                    match: { type: editor.getType(CodeBlockPlugin) },
                });
            },
        },
    }),
    autoformatPlugin,
    cursorOverlayPlugin,
    ...blockMenuPlugins,
    ...dndPlugins,
    EmojiPlugin.configure({ options: { data: emojiMartData as any } }),
    exitBreakPlugin,
    resetBlockTypePlugin,
    softBreakPlugin,
    TrailingBlockPlugin,

    // Deserialization
    markdownPlugin,

    // UI
    FixedToolbarPlugin,
    FloatingToolbarPlugin,
];
