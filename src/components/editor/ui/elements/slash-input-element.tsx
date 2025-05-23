'use client';

import * as React from 'react';

import type { TSlashInputElement } from '@udecode/plate-slash-command';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { INDENT_LIST_KEYS, ListStyleType } from '@udecode/plate-indent-list';

import { TablePlugin } from '@udecode/plate-table/react';
import {
    type PlateEditor,
    type PlateElementProps,
    ParagraphPlugin,
} from '@udecode/plate/react';
import { PlateElement } from '@udecode/plate/react';
import {
    Code2,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    ListIcon,
    ListOrdered,
    PilcrowIcon,
    Quote,
    Square,
    Table,
    TableOfContentsIcon,
} from 'lucide-react';

import {
    insertBlock,
} from '@/components/editor/transforms';

import {
    InlineCombobox,
    InlineComboboxContent,
    InlineComboboxEmpty,
    InlineComboboxGroup,
    InlineComboboxGroupLabel,
    InlineComboboxInput,
    InlineComboboxItem,
} from '../inline-combobox';

type Group = {
    group: string;
    items: Item[];
};

interface Item {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
}

const groups: Group[] = [
    {
        group: 'Basic blocks',
        items: [
            {
                icon: <PilcrowIcon />,
                keywords: ['paragraph'],
                label: 'Text',
                value: ParagraphPlugin.key,
            },
            {
                icon: <Heading1Icon />,
                keywords: ['title', 'h1'],
                label: 'Heading 1',
                value: HEADING_KEYS.h1,
            },
            {
                icon: <Heading2Icon />,
                keywords: ['subtitle', 'h2'],
                label: 'Heading 2',
                value: HEADING_KEYS.h2,
            },
            {
                icon: <Heading3Icon />,
                keywords: ['subtitle', 'h3'],
                label: 'Heading 3',
                value: HEADING_KEYS.h3,
            },
            {
                icon: <ListIcon />,
                keywords: ['unordered', 'ul', '-'],
                label: 'Bulleted list',
                value: ListStyleType.Disc,
            },
            {
                icon: <ListOrdered />,
                keywords: ['ordered', 'ol', '1'],
                label: 'Numbered list',
                value: ListStyleType.Decimal,
            },
            {
                icon: <Square />,
                keywords: ['checklist', 'task', 'checkbox', '[]'],
                label: 'To-do list',
                value: INDENT_LIST_KEYS.todo,
            },
            {
                icon: <Code2 />,
                keywords: ['```'],
                label: 'Code Block',
                value: CodeBlockPlugin.key,
            },
            {
                icon: <Table />,
                label: 'Table',
                value: TablePlugin.key,
            },
            {
                icon: <Quote />,
                keywords: ['citation', 'blockquote', 'quote', '>'],
                label: 'Blockquote',
                value: BlockquotePlugin.key,
            },
        ].map((item) => ({
            ...item,
            onSelect: (editor, value) => {
                insertBlock(editor, value);
            },
        })),
    },
    {
        group: 'Advanced blocks',
        items: [
            {
                icon: <TableOfContentsIcon />,
                keywords: ['toc'],
                label: 'Table of contents',
                value: TocPlugin.key,
            },
        ].map((item) => ({
            ...item,
            onSelect: (editor, value) => {
                insertBlock(editor, value);
            },
        })),
    },
];

export function SlashInputElement(
    props: PlateElementProps<TSlashInputElement>
) {
    const { editor, element } = props;

    return (
        <PlateElement {...props} as="span" data-slate-value={element.value}>
            <InlineCombobox element={element} trigger="/">
                <InlineComboboxInput />

                <InlineComboboxContent>
                    <InlineComboboxEmpty>No results</InlineComboboxEmpty>

                    {groups.map(({ group, items }) => (
                        <InlineComboboxGroup key={group}>
                            <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

                            {items.map(
                                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                                    <InlineComboboxItem
                                        key={value}
                                        value={value}
                                        onClick={() => onSelect(editor, value)}
                                        label={label}
                                        focusEditor={focusEditor}
                                        group={group}
                                        keywords={keywords}
                                    >
                                        <div className="mr-2 text-muted-foreground">{icon}</div>
                                        {label ?? value}
                                    </InlineComboboxItem>
                                )
                            )}
                        </InlineComboboxGroup>
                    ))}
                </InlineComboboxContent>
            </InlineCombobox>

            {props.children}
        </PlateElement>
    );
}