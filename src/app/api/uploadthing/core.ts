import { getUser } from "@/lib/get-user";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { UploadThingError, UTFiles } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    profilePictures: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ req, files }) => {
            const {user} = await getUser();
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            if (!user) throw new UploadThingError("Unauthorized");

            const newFiles = files.map((file) => {
                return {
                    ...file,
                    name: `avatars/${user.id}/${file.name}`,
                }
            })

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.id, [UTFiles]: newFiles };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);

            console.log("file url", file.ufsUrl);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;