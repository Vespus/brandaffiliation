import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/editor/ui/editor";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { MarkdownPlugin } from "@platejs/markdown";
import { Plate, usePlateEditor } from "platejs/react";
import { LoaderCircle } from "lucide-react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface PromptEditorProps {
    defaultValue: string;
    onChange: (value: string) => void;
}

export const PromptEditor = ({defaultValue, onChange}: PromptEditorProps) => {
    const editor = usePlateEditor({
        plugins: EditorKit,
        skipInitialization: true
    });

    const editorInitialized = useRef(false);
    const [loading, setLoading] = useState(false);

    const handleChange = () => {
        setLoading(true);
        const serializedValue = editor.api.markdown.serialize({value: editor.children});
        onChange?.(serializedValue);
        setLoading(false);
    };

    const debouncedHandleChange = useDebouncedCallback(handleChange, 800)

    useEffect(() => {
        if(!editorInitialized.current) {
            editor.tf.init({
                value: editor.getApi(MarkdownPlugin).markdown.deserialize(defaultValue || ""),
            });
            editorInitialized.current = true
        }
    }, [defaultValue, editorInitialized]);

    return (
        <DndProvider backend={HTML5Backend}>
            <Plate
                editor={editor}
                onChange={({editor, value}) => {
                    setLoading(true)
                    debouncedHandleChange()
                }}
            >
                <EditorContainer>
                    <Editor
                        defaultValue={defaultValue}
                        onChange={(val) => console.log(val)}
                        placeholder="Type..."
                    />
                    {loading && (
                        <div className="absolute right-2 bottom-2 z-10 rounded-full opacity-20">
                            <LoaderCircle data-loader={true} className="animate-spin origin-center size-4"
                                          aria-hidden="true"/>
                        </div>
                    )}
                </EditorContainer>
            </Plate>
        </DndProvider>
    );
};