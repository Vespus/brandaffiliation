"use client"

import { Button } from '@/components/ui/button'

import { useFileUpload } from '@/hooks/use-file-upload'
import { uploadFiles } from "@/lib/uploadthing";
import { CircleUserRoundIcon, Loader, XIcon } from "lucide-react"
import * as React from "react";

type AvatarFieldProps = React.ComponentProps<"select"> & {
    onChange?: (value: string) => void
}

export default function AvatarField({onChange, ...props}: AvatarFieldProps) {
    const [loading, setLoading] = React.useState(false)
    const [
        {files, isDragging},
        {
            removeFile,
            openFileDialog,
            getInputProps,
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
        },
    ] = useFileUpload({
        accept: "image/*",
        maxFiles: 1,
        multiple: false,
        maxSize: 1024 * 1024 * 4,
        initialFiles: [],
        onFilesAdded: async (files) => {
            const [file] = await uploadFiles("profilePictures", {
                files: files.map((file) => file.file as File),
                onUploadBegin: () => {
                    setLoading(true)
                },
            });
            setLoading(false);
            onChange?.(file.ufsUrl);
        }
    })

    const previewUrl = files[0]?.preview || props.value as string || null

    return (
        <div className="relative inline-flex">
            {/* Drop area */}
            <button
                className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none"
                onClick={openFileDialog}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                data-dragging={isDragging || undefined}
                type="button"
                aria-label={previewUrl ? "Change image" : "Upload image"}
            >
                {previewUrl ? (
                    <img
                        loading="lazy"
                        className="size-full object-cover"
                        src={previewUrl}
                        alt={files[0]?.file?.name || "Avatar image"}
                        width={64}
                        height={64}
                        style={{objectFit: "cover"}}
                    />
                ) : (
                    <div aria-hidden="true">
                        <CircleUserRoundIcon className="size-4 opacity-60"/>
                    </div>
                )}
            </button>
            {previewUrl && (
                <Button
                    onClick={() => removeFile(files[0]?.id)}
                    size="icon"
                    className="border-background focus-visible:border-background absolute -top-1 -right-1 size-6 rounded-full border-2 shadow-none z-20"
                    aria-label="Remove image"
                >
                    <XIcon className="size-3.5"/>
                </Button>
            )}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-2xl z-10 rounded-full">
                    <Loader data-loader={true} className="animate-spin origin-center" aria-hidden="true"/>
                </div>
            )}
            <input
                {...getInputProps()}
                className="sr-only"
                aria-label="Upload image file"
                tabIndex={-1}
            />
        </div>
    )
}
