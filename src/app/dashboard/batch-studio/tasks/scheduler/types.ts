// types.ts
export type RunStatus =
    | "idle"
    | "queued"
    | "running"
    | "retry_queued"
    | "succeeded"
    | "failed"
    | "abandoned";

export type RunView<T, Id extends string | number> = {
    id: Id;                // your natural id
    record: T;             // latest task record (immutable to runner)
    status: RunStatus;
    streamStatus?: string;
    progress: number;      // 0..100
    retryCount: number;    // resets to 0 on success
    error?: string;        // keeps final failure message
};

export type HandlerHelpers<Id extends string | number> = {
    setProgress: (id: Id, p: number) => void;
    setStreamProgress: (id: Id, status: string) => void;
};

export type SchedulerOptions<T, Id extends string | number> = {
    maxConcurrency: number;
    maxRetries?: number;   // default 3
    delayMs?: number; // 👈 NEW optional, default 0
    identity: (record: T) => Id; // REQUIRED stable id (number or string)
    handler: (run: RunView<T, Id>, helpers: HandlerHelpers<Id>) => Promise<void>;
};
