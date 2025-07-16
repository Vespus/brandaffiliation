"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Check, Edit, Save, X} from "lucide-react";
import {MetaOutput} from "@/app/dashboard/content-generation/types";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Scroller} from "@/components/ui/scroller";
import {format} from "date-fns";
import {PromptEditor} from "@/app/dashboard/prompts/prompt-editor";

interface ContentCardProps {
    id: string;
    entityType: string;
    entityName: string;
    oldConfig: MetaOutput;
    config: MetaOutput;
    createdAt: Date;
    onSave: (id: string, config: MetaOutput) => void;
    onAccept: (id: string) => void;
}

export function ContentCard({
                                id,
                                entityType,
                                entityName,
                                oldConfig,
                                config,
                                createdAt,
                                onSave,
                                onAccept,
                            }: ContentCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedConfig, setEditedConfig] = useState<MetaOutput>(config);
    const date = new Date(createdAt);

    const handleChange = (path: string[], value: string) => {
        setEditedConfig((prev) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            let current = newConfig;

            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }

            current[path[path.length - 1]] = value;

            return newConfig;
        });
    };

    const handleEdit = () => {
        setEditedConfig(JSON.parse(JSON.stringify(config)));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = () => {
        onSave(id, editedConfig);
        setIsEditing(false);
    };

    return (
        <Card className="w-full h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <div className="font-medium text-lg">{entityName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{entityType}</div>
                    </div>
                    <div className="text-xs">
                        Created: {format(date, "dd/MM/yyyy HH:mm")}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 pb-2 pt-4">
                <Scroller className="max-h-[500px]">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor={`meta-title-${id}`}>Meta Title</Label>
                            <Input
                                id={`meta-title-${id}`}
                                value={editedConfig.meta.title}
                                onChange={(e) => handleChange(["meta", "title"], e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`meta-description-${id}`}>Meta Description</Label>
                            <Textarea
                                id={`meta-description-${id}`}
                                value={editedConfig.meta.description}
                                onChange={(e) => handleChange(["meta", "description"], e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`meta-category-${id}`}>Category</Label>
                            <Input
                                id={`meta-category-${id}`}
                                value={editedConfig.meta.category}
                                onChange={(e) => handleChange(["meta", "category"], e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`meta-robot-${id}`}>Robot</Label>
                            <Input
                                id={`meta-robot-${id}`}
                                value={editedConfig.meta.robot}
                                onChange={(e) => handleChange(["meta", "robot"], e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Open Graph</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor={`og-type-${id}`}>Type</Label>
                                    <Input
                                        id={`og-type-${id}`}
                                        value={editedConfig.meta.openGraph.type}
                                        onChange={(e) => handleChange(["meta", "openGraph", "type"], e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`og-locale-${id}`}>Locale</Label>
                                    <Input
                                        id={`og-locale-${id}`}
                                        value={editedConfig.meta.openGraph.locale}
                                        onChange={(e) => handleChange(["meta", "openGraph", "locale"], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor={`og-title-${id}`}>Title</Label>
                                <Input
                                    id={`og-title-${id}`}
                                    value={editedConfig.meta.openGraph.title}
                                    onChange={(e) => handleChange(["meta", "openGraph", "title"], e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor={`og-description-${id}`}>Description</Label>
                                <Textarea
                                    id={`og-description-${id}`}
                                    value={editedConfig.meta.openGraph.description}
                                    onChange={(e) => handleChange(["meta", "openGraph", "description"], e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Twitter</Label>
                            <div>
                                <Label htmlFor={`twitter-card-${id}`}>Card</Label>
                                <Input
                                    id={`twitter-card-${id}`}
                                    value={editedConfig.meta.twitter.card}
                                    onChange={(e) => handleChange(["meta", "twitter", "card"], e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor={`twitter-title-${id}`}>Title</Label>
                                <Input
                                    id={`twitter-title-${id}`}
                                    value={editedConfig.meta.twitter.title}
                                    onChange={(e) => handleChange(["meta", "twitter", "title"], e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor={`twitter-description-${id}`}>Description</Label>
                                <Textarea
                                    id={`twitter-description-${id}`}
                                    value={editedConfig.meta.twitter.description}
                                    onChange={(e) => handleChange(["meta", "twitter", "description"], e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Descriptions</Label>
                            <div>
                                <Label htmlFor={`desc-header-${id}`}>Header</Label>
                                <PromptEditor
                                    isMarkdown={false}
                                    defaultValue={editedConfig.descriptions.header}
                                    onChange={value => handleChange(["descriptions", "header"], value)}
                                />

                            </div>
                            <div>
                                <Label htmlFor={`desc-footer-${id}`}>Footer</Label>
                                <PromptEditor
                                    isMarkdown={false}
                                    defaultValue={editedConfig.descriptions.footer}
                                    onChange={value => handleChange(["descriptions", "footer"], value)}
                                />
                            </div>
                        </div>
                    </div>
                </Scroller>
            </CardContent>
            <CardFooter className="pt-2 flex justify-end gap-2 border-t">
                {isEditing ? (
                    <>
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1"/>
                            Cancel
                        </Button>
                        <Button variant="default" size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1"/>
                            Save
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-1"/>
                            Edit
                        </Button>
                        <Button variant="default" size="sm" onClick={() => onAccept(id)}>
                            <Check className="h-4 w-4 mr-1"/>
                            Accept
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}