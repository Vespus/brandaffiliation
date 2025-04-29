import {createCallerFactory, createTRPCRouter} from "@/lib/trpc/trpc";
import {genericRoute} from "@/lib/trpc/routes/generic.route";

export const appRouter = createTRPCRouter({
    genericRoute
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
