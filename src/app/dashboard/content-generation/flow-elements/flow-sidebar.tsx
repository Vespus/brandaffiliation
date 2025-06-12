import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { CommandIcon, GitCompareIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { Accordion as AccordionPrimitive} from "radix-ui";
import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

const items = [
    {
        id: "1",
        icon: CommandIcon,
        title: "Content Agents",
        agents: [
            {
                id: "compare",
                icon: GitCompareIcon,
                title: "Compare Content",
                type: "compare-agent",
                createNode: (x: number, y: number) => ({
                    id: uuidv4(),
                    type: "compare-agent",
                    position: { x, y },
                    data: {
                        label: "Compare Content",
                        inputs: [],
                        output: ""
                    }
                })
            },
            {
                id: "tone",
                icon: MessageSquareIcon,
                title: "Adjust Tone",
                type: "tone-agent",
                createNode: (x: number, y: number) => ({
                    id: uuidv4(),
                    type: "tone-agent",
                    position: { x, y },
                    data: {
                        label: "Adjust Tone",
                        input: "",
                        output: "",
                        tone: "professional"
                    }
                })
            }
        ]
    }
]

export const FlowSidebar = () => {
    const { addNode } = useContentGenerationStore();

    const onDragStart = useCallback((event: React.DragEvent, nodeType: string, createNode: (x: number, y: number) => any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('createNode', JSON.stringify(createNode));
    }, []);

    return (
        <div className="w-full flex-none max-w-sm border-x px-4 h-full">
            <Accordion type="single" collapsible className="w-full" defaultValue="1">
                {items.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="py-2">
                        <AccordionPrimitive.Header className="flex">
                            <AccordionPrimitive.Trigger
                                className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md py-2 text-left text-sm text-[15px] leading-6 font-semibold transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0">
                                <span className="flex items-center gap-3">
                                    <item.icon
                                      size={16}
                                      className="shrink-0 opacity-60"
                                      aria-hidden="true"
                                    />
                                    <span>{item.title}</span>
                                </span>
                                <PlusIcon
                                    size={16}
                                    className="pointer-events-none shrink-0 opacity-60 transition-transform duration-200"
                                    aria-hidden="true"
                                />
                            </AccordionPrimitive.Trigger>
                        </AccordionPrimitive.Header>
                        <AccordionContent className="text-muted-foreground ps-7 pb-2">
                            <div className="flex flex-col gap-2">
                                {item.agents?.map((agent) => (
                                    <div
                                        key={agent.id}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-move"
                                        draggable
                                        onDragStart={(e) => onDragStart(e, agent.type, agent.createNode)}
                                    >
                                        <agent.icon size={16} className="shrink-0 opacity-60" />
                                        <span>{agent.title}</span>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}