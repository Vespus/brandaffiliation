import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import ToolbarPlugin from "@/app/dashboard/content-generation/form-elements/editor/plugin/toolbar-plugin";

const theme = {
    paragraph: 'editor-paragraph',
}

export const ResultEditor = () => {
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError(error: Error) {
            console.log(error);
        },
    };

    return (
        <div className="shadow ring ring-muted/50 rounded p-2 bg-background">
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin/>
                <div className="bg-background relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                placeholder={<div className="text-muted-foreground/70">Enter sosme text...</div>}
                            />
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin/>
                <AutoFocusPlugin/>
            </LexicalComposer>
        </div>
    );
}