import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/editor/ui/editor";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { LoaderCircle } from "lucide-react";
import { Plate, usePlateEditor } from "platejs/react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PromptEditorProps {
    defaultValue: string;
    onChange: (value: string) => void;
    isMarkdown?: boolean;
}

export const PromptEditor = ({defaultValue, onChange, isMarkdown = true}: PromptEditorProps) => {
    const editor = usePlateEditor({
        plugins: EditorKit,
    });

    const [loading, setLoading] = useState(false);
    const defaultValuePer = useRef(defaultValue);

    const handleChange = useCallback(async (editor) => {
        //setLoading(true);
        //const serializedValue = isMarkdown ? editor.api.markdown.serialize({value: editor.children}) : await serializeHtml(editor);
        //console.log(serializedValue)
        //onChange?.(serializedValue);
        //setLoading(false);
    }, [isMarkdown]);

    const debouncedHandleChange = useDebouncedCallback(handleChange, 800)

    useEffect(() => {
        if (isMarkdown) {
            editor.tf.setValue(editor.api.markdown.deserialize(defaultValuePer.current))
        } else {
            editor.tf.setValue(editor.api.html.deserialize({element: defaultValuePer.current}))
        }
    }, [defaultValuePer]);

    return (
        <Plate
            editor={editor}
            onChange={({editor, value}) => {
                //setLoading(true)
                handleChange(editor)
            }}
        >
            <EditorContainer>
                <Editor
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
    );
};