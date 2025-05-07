import * as React from "react";
import {Textarea} from "@/components/ui/textarea";
import {useFormContext} from "react-hook-form";
import {api} from "@/lib/trpc/react";
import {Check, ChevronsUpDown, Trash2Icon} from "lucide-react";
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
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {AnimatePresence, motion} from "motion/react";

export const PromptArea = ({...props}: React.ComponentProps<"textarea">) => {
    return (
        <div className="flex flex-col gap-2" data-registry="plate">
            <UserPrompts/>
            <Textarea
                {...props}
                className="max-h-96"
            />
        </div>
    )
}

const UserPrompts = () => {
    const {data} = api.genericRoute.getUserPrompts.useQuery()
    const formContext = useFormContext()
    const [value, setValue] = React.useState<number | undefined>(undefined)
    const [open, setOpen] = React.useState(false)

    const onChange = (val: number) => {
        const prompt = data?.find((prompt) => prompt.id === val)

        if (prompt) {
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
            <div className="flex gap-2 overflow-hidden">
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
                                <Trash2Icon />
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