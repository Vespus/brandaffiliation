import { EditorContent, EditorContext, generateJSON, useEditor } from '@tiptap/react'
import Paragraph from "@tiptap/extension-paragraph";
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import { ListKit } from '@tiptap/extension-list'
import { Toolbar, ToolbarGroup } from "@/components/tiptap/toolbar";
import {
    BoldIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    ItalicIcon,
    ListIcon,
    ListOrderedIcon,
    Redo2Icon,
    StrikethroughIcon,
    Undo2Icon
} from "lucide-react";
import * as React from "react";
import { MarkButton } from "@/components/tiptap-ui/mark-button/mark-button";
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { HeadingButton } from "@/components/tiptap-ui/heading-button/heading-button";
import { ListButton } from "@/components/tiptap-ui/list-button/list-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button/undo-redo-button";
import { renderToMarkdown } from '@tiptap/static-renderer/pm/markdown'
import { marked } from 'marked';
import { useEffect, useRef } from "react"; // or use 'markdown-it'

type EditorProps = {
    value?: string;
    onChange?: (value?: string) => void;
    htmlOnly?: boolean;
}

const exts = [
    Document,
    Paragraph,
    Text,
    Heading.configure({
        levels: [1, 2, 3],
    }),
    UndoRedo,
    ListKit,
    Bold,
    Italic,
    Placeholder.configure({
        placeholder: "User prompts generated automatically, this area will prepend the generated user prompt. For example you can use this area to give AI a purpose, specific mood or season like entries for content to generate"
    })
]

export const TipTapEditor = ({value, onChange, htmlOnly}: EditorProps) => {
    const hasInitialValueSet = useRef<boolean>(false)
    const editor = useEditor({
        extensions: exts,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-32 border-x border-b p-4 [&>p.iseditor-empty]',
            },
        },
        content: "",
        onUpdate: ({editor}) => {
            if (htmlOnly) {
                onChange?.(editor.getHTML())
                return
            }
            onChange?.(renderToMarkdown({extensions: exts, content: editor.getJSON()}))
        },
        immediatelyRender: false,
    })

    useEffect(() => {
        if(editor && !hasInitialValueSet.current){
            editor.commands.setContent(value ? generateJSON(htmlOnly ? value : marked(value, {async: false}), exts) : "")
            hasInitialValueSet.current = true
        }
    }, [editor]);

    return (
        <div>
            <EditorContext.Provider value={{editor}}>
                {editor &&
                    <Toolbar
                        className="sticky top-0 left-0 z-50 scrollbar-hide w-full overflow-x-auto rounded-t-lg border-b border-b-border bg-background/95 p-1 backdrop-blur-sm supports-backdrop-blur:bg-background/60"
                    >
                        <ToolbarGroup>
                            <UndoRedoButton action="undo">
                                <Undo2Icon/>
                            </UndoRedoButton>
                            <UndoRedoButton action="redo">
                                <Redo2Icon/>
                            </UndoRedoButton>
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <MarkButton type="bold" label="Bold (⌘+B)">
                                <BoldIcon/>
                            </MarkButton>
                            <MarkButton type="italic" label="Italic (⌘+I)">
                                <ItalicIcon/>
                            </MarkButton>
                            <MarkButton type="strike">
                                <StrikethroughIcon/>
                            </MarkButton>
                            <HeadingButton level={1}>
                                <Heading1Icon/>
                            </HeadingButton>
                            <HeadingButton level={2}>
                                <Heading2Icon/>
                            </HeadingButton>
                            <HeadingButton level={3}>
                                <Heading3Icon/>
                            </HeadingButton>
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ListButton type="bulletList">
                                <ListIcon/>
                            </ListButton>
                            <ListButton type="orderedList">
                                <ListOrderedIcon/>
                            </ListButton>
                        </ToolbarGroup>
                    </Toolbar>
                }
                <EditorContent editor={editor}/>
            </EditorContext.Provider>
        </div>
    )
}
