'use client';

import type { Value } from '@udecode/plate';

import { withProps } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import {
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    SubscriptPlugin,
    SuperscriptPlugin,
    UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
    CodeBlockPlugin,
    CodeLinePlugin,
    CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';

import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
    TableCellHeaderPlugin,
    TableCellPlugin,
    TablePlugin,
    TableRowPlugin,
} from '@udecode/plate-table/react';
import {
    type CreatePlateEditorOptions,
    ParagraphPlugin,
    PlateLeaf,
    usePlateEditor,
} from '@udecode/plate/react';

import { editorPlugins } from '@/components/editor/plugins';
import { FixedToolbarPlugin } from '@/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/components/editor/plugins/floating-toolbar-plugin';
import { withPlaceholders } from '@/components/editor/ui/placeholder';

import { AILeaf } from '@/components/editor/ui/leaves/ai-leaf';
import { CodeSyntaxLeaf } from '@/components/editor/ui/leaves/code-syntax-leaf';
import { CodeLeaf } from '@/components/editor/ui/leaves/code-leaf';

import { BlockquoteElement } from '@/components/editor/ui/elements/blockquote-element';
import { CodeBlockElement } from '@/components/editor/ui/elements/code-block-element';
import { CodeLineElement } from '@/components/editor/ui/elements/code-line-element';
import { ColumnElement } from '@/components/editor/ui/elements/column-element';
import { ColumnGroupElement } from '@/components/editor/ui/elements/column-group-element';
import { EmojiInputElement } from '@/components/editor/ui/elements/emoji-input-element';
import { HeadingElement } from '@/components/editor/ui/elements/heading-element';
import { HrElement } from '@/components/editor/ui/elements/hr-element';
import { LinkElement } from '@/components/editor/ui/elements/link-element';
import { ParagraphElement } from '@/components/editor/ui/elements/paragraph-element';
import { SlashInputElement } from '@/components/editor/ui/elements/slash-input-element';
import {
    TableCellElement,
    TableCellHeaderElement,
} from '@/components/editor/ui/elements/table-cell-element';
import { TableElement } from '@/components/editor/ui/elements/table-element';
import { TableRowElement } from '@/components/editor/ui/elements/table-row-element';
import { TocElement } from '@/components/editor/ui/elements/toc-element';

export const viewComponents = {
    [BlockquotePlugin.key]: BlockquoteElement,
    [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [CodeBlockPlugin.key]: CodeBlockElement,
    [CodeLinePlugin.key]: CodeLineElement,
    [CodePlugin.key]: CodeLeaf,
    [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
    [ColumnItemPlugin.key]: ColumnElement,
    [ColumnPlugin.key]: ColumnGroupElement,
    [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
    [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
    [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
    [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
    [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
    [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
    [HorizontalRulePlugin.key]: HrElement,
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [LinkPlugin.key]: LinkElement,
    [ParagraphPlugin.key]: ParagraphElement,
    [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
    [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
    [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
    [TableCellHeaderPlugin.key]: TableCellHeaderElement,
    [TableCellPlugin.key]: TableCellElement,
    [TablePlugin.key]: TableElement,
    [TableRowPlugin.key]: TableRowElement,
    [TocPlugin.key]: TocElement,
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
};

export const editorComponents = {
    ...viewComponents,
    [AIPlugin.key]: AILeaf,
    [EmojiInputPlugin.key]: EmojiInputElement,
    [SlashInputPlugin.key]: SlashInputElement,
};

export const useCreateEditor = (
    {
        components,
        override,
        placeholders,
        readOnly,
        ...options
    }: {
        components?: Record<string, any>;
        placeholders?: boolean;
        plugins?: any[];
        readOnly?: boolean;
    } & Omit<CreatePlateEditorOptions, 'plugins'> = {},
    deps: any[] = []
) => {
    return usePlateEditor<Value, (typeof editorPlugins)[number]>(
        {
            override: {
                components: {
                    ...(readOnly
                        ? viewComponents
                        : placeholders
                            ? withPlaceholders(editorComponents)
                            : editorComponents),
                    ...components,
                },
                ...override,
            },
            plugins: [
                ...editorPlugins,
                FixedToolbarPlugin,
                FloatingToolbarPlugin,
            ],
            ...options,
        },
        deps
    );
};
