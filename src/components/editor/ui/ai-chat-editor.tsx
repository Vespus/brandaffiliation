'use client';

import * as React from 'react';

import { withProps } from '@udecode/cn';
import { BaseParagraphPlugin, SlateLeaf } from '@udecode/plate';
import { useAIChatEditor } from '@udecode/plate-ai/react';
import {
    BaseBoldPlugin,
    BaseCodePlugin,
    BaseItalicPlugin,
    BaseStrikethroughPlugin,
    BaseSubscriptPlugin,
    BaseSuperscriptPlugin,
    BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import {
    BaseCodeBlockPlugin,
    BaseCodeLinePlugin,
    BaseCodeSyntaxPlugin,
} from '@udecode/plate-code-block';
import {
    BaseFontBackgroundColorPlugin,
    BaseFontColorPlugin,
    BaseFontFamilyPlugin,
    BaseFontSizePlugin,
    BaseFontWeightPlugin,
} from '@udecode/plate-font';
import {
    BaseHeadingPlugin,
    BaseTocPlugin,
    HEADING_KEYS,
} from '@udecode/plate-heading';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLinkPlugin } from '@udecode/plate-link';
import {
    BaseTableCellHeaderPlugin,
    BaseTableCellPlugin,
    BaseTablePlugin,
    BaseTableRowPlugin,
} from '@udecode/plate-table';
import { usePlateEditor } from '@udecode/plate/react';
import { all, createLowlight } from 'lowlight';

import { markdownPlugin } from '@/components/editor/plugins/markdown-plugin';
import {
    TodoLiStatic,
    TodoMarkerStatic,
} from '@/components/editor/ui/elements/static/indent-todo-marker-static';

import { BlockquoteElementStatic } from '@/components/editor/ui/elements/static/blockquote-element-static';
import { CodeBlockElementStatic } from '@/components/editor/ui/elements/static/code-block-element-static';
import { CodeLeafStatic } from '@/components/editor/ui/leaves/static/code-leaf-static';
import { CodeLineElementStatic } from '@/components/editor/ui/elements/static/code-line-element-static';
import { CodeSyntaxLeafStatic } from '@/components/editor/ui/leaves/static/code-syntax-leaf-static';
import { ColumnElementStatic } from '@/components/editor/ui/elements/static/column-element-static';
import { ColumnGroupElementStatic } from '@/components/editor/ui/elements/static/column-group-element-static';
import { EditorStatic } from '@/components/editor/ui/editor-static';
import { HeadingElementStatic } from '@/components/editor/ui/elements/static/heading-element-static';
import { HrElementStatic } from '@/components/editor/ui/elements/static/hr-element-static';
import { LinkElementStatic } from '@/components/editor/ui/elements/static/link-element-static';
import { ParagraphElementStatic } from '@/components/editor/ui/elements/static/paragraph-element-static';
import {
    TableCellElementStatic,
    TableCellHeaderStaticElement,
} from '@/components/editor/ui/elements/static/table-cell-element-static';
import { TableElementStatic } from '@/components/editor/ui/elements/static/table-element-static';
import { TableRowElementStatic } from '@/components/editor/ui/elements/static/table-row-element-static';
import { TocElementStatic } from '@/components/editor/ui/elements/static/toc-element-static';

const components = {
    [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
    [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
    [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
    [BaseCodeLinePlugin.key]: CodeLineElementStatic,
    [BaseCodePlugin.key]: CodeLeafStatic,
    [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
    [BaseColumnItemPlugin.key]: ColumnElementStatic,
    [BaseColumnPlugin.key]: ColumnGroupElementStatic,
    [BaseHorizontalRulePlugin.key]: HrElementStatic,
    [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
    [BaseLinkPlugin.key]: LinkElementStatic,
    [BaseParagraphPlugin.key]: ParagraphElementStatic,
    [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 's' }),
    [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: 'sub' }),
    [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: 'sup' }),
    [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
    [BaseTableCellPlugin.key]: TableCellElementStatic,
    [BaseTablePlugin.key]: TableElementStatic,
    [BaseTableRowPlugin.key]: TableRowElementStatic,
    [BaseTocPlugin.key]: TocElementStatic,
    [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),

    [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),

    [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
    [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
};
const lowlight = createLowlight(all);

const plugins = [
    BaseColumnItemPlugin,
    BaseColumnPlugin,
    BaseBlockquotePlugin,
    BaseSubscriptPlugin,
    BaseSuperscriptPlugin,
    BaseBoldPlugin,
    BaseCodeBlockPlugin.configure({ options: { lowlight } }),
    BaseCodePlugin,
    BaseItalicPlugin,
    BaseStrikethroughPlugin,
    BaseUnderlinePlugin,
    BaseFontColorPlugin,
    BaseFontSizePlugin,
    BaseFontFamilyPlugin,
    BaseFontWeightPlugin,
    BaseFontBackgroundColorPlugin,
    BaseHeadingPlugin,
    BaseHorizontalRulePlugin,
    BaseTablePlugin,
    BaseTocPlugin,
    BaseLinkPlugin,
    BaseParagraphPlugin,
    BaseIndentPlugin.extend({
        inject: {
            targetPlugins: [BaseParagraphPlugin.key],
        },
    }),
    BaseIndentListPlugin.extend({
        inject: {
            targetPlugins: [BaseParagraphPlugin.key],
        },
        options: {
            listStyleTypes: {
                todo: {
                    liComponent: TodoLiStatic,
                    markerComponent: TodoMarkerStatic,
                    type: 'todo',
                },
            },
        },
    }),
    markdownPlugin,
];

export const AIChatEditor = React.memo(function AIChatEditor({
                                                                 content,
                                                             }: {
    content: string;
}) {
    const aiEditor = usePlateEditor({
        plugins,
    });

    useAIChatEditor(aiEditor, content);

    return (
        <EditorStatic variant="aiChat" components={components} editor={aiEditor} />
    );
});