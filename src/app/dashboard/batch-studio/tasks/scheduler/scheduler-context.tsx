"use client"

import React, { createContext, useContext } from "react";
import { useScheduler } from '@/app/dashboard/batch-studio/tasks/scheduler/use-scheduler'
import { SchedulerOptions } from '@/app/dashboard/batch-studio/tasks/scheduler/types'

type Ctx<T, Id extends string | number> =
    ReturnType<typeof useScheduler<T, Id>>;

const SchedulerContext = createContext<Ctx<any, any> | null>(null);

export function SchedulerProvider<T, Id extends string | number>(
    props: React.PropsWithChildren<{ options: SchedulerOptions<T, Id> }>
) {
    const runner = useScheduler<T, Id>(props.options);
    return (
        <SchedulerContext.Provider value={runner}>
            {props.children}
        </SchedulerContext.Provider>
    );
}

export function useSchedulerContext<T, Id extends string | number>() {
    const ctx = useContext(SchedulerContext);
    if (!ctx) throw new Error("useSchedulerContext must be inside SchedulerProvider");
    return ctx as Ctx<T, Id>;
}