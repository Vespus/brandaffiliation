import {qspayRoute} from "@/lib/trpc/routes/qspay.route";
import {createCallerFactory, createTRPCRouter} from "@/lib/trpc/trpc";
import {genericRoute} from "@/lib/trpc/routes/generic.route";
import {batchStudioRoute} from "@/lib/trpc/routes/batch-studio.route";

export const appRouter = createTRPCRouter({
    genericRoute,
    qspayRoute,
    batchStudioRoute
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
