import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { api } from "@/lib/trpc/react";
import { Check, ChevronsUpDown, Trash2Icon } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/editor/ui/editor";
import { Plate, PlateEditor } from "@udecode/plate/react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { useEffect } from "react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

type PromptAreaType = React.ComponentProps<"textarea"> & {
    onChange: (val: string) => void
}

export const PromptArea = ({...props}: PromptAreaType) => {
    const runOnce = React.useRef(true)
    const debounce = useDebouncedCallback((val: string) => props.onChange(val), 800)
    const editor = useCreateEditor({
        skipInitialization: true
    });

    useEffect(() => {
        if (runOnce.current && props.value) {
            runOnce.current = false
            editor.tf.init({
                value: editor.getApi(MarkdownPlugin).markdown.deserialize(props.value as string),
                autoSelect: 'start'
            });
        }
    }, [props.value]);

    return (
        <div className="flex flex-col gap-4 min-w-0" data-registry="plate">
            <UserPrompts editor={editor}/>
            <DndProvider backend={HTML5Backend}>
                <Plate editor={editor}>
                    <EditorContainer>
                        <Editor
                            onBlur={() => {
                                editor.api.markdown.serialize({value: editor.children})
                            }}
                            placeholder="Type..."
                        />
                    </EditorContainer>
                </Plate>
            </DndProvider>

            {/*<Textarea
                {...props}
                onChange={onChange}
                className="max-h-96"
            />*/}
        </div>
    )
}

const UserPrompts = ({editor}: { editor: PlateEditor }) => {
    const {data} = api.genericRoute.getUserPrompts.useQuery()
    const formContext = useFormContext()
    const [value, setValue] = React.useState<number | undefined>(undefined)
    const [open, setOpen] = React.useState(false)

    const onChange = (val: number) => {
        const prompt = data?.find((prompt) => prompt.id === val)

        if (prompt) {
            editor.tf.setValue(editor.getApi(MarkdownPlugin).markdown.deserialize(prompt.prompt as string))
            formContext.setValue("customPrompt", prompt.prompt)
            setValue(val)
        }
    }

    const resetPrompt = () => {
        setValue(undefined)
        formContext.resetField("customPrompt")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="flex gap-2">
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="flex-1 justify-between"
                    >
                        {value
                            ? data?.find((prompt) => prompt.id === value)?.name
                            : "Your saved prompts..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <AnimatePresence>
                    {value && (
                        <motion.div
                            initial={{opacity: 0, x: 20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: 20}}
                            className="flex-none"
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-none"
                                onClick={resetPrompt}
                            >
                                <Trash2Icon/>
                                Reset
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                    <CommandInput placeholder="Search prompts..."/>
                    <CommandList>
                        <CommandEmpty>No prompt found.</CommandEmpty>
                        <CommandGroup>
                            {data?.map((prompt) => (
                                <CommandItem
                                    key={prompt.id}
                                    value={prompt.id.toString()}
                                    keywords={[prompt.name!, prompt.prompt!]}
                                    onSelect={(currentValue) => {
                                        onChange(Number(currentValue))
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === prompt.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold">{prompt.name}</span>
                                        <span className="truncate min-w-0">{prompt.prompt}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
