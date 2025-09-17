// useScheduler.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
    RunStatus,
    RunView,
    SchedulerOptions,
    HandlerHelpers,
} from "@/app/dashboard/batch-studio/tasks/scheduler/types"

type RunState = {
    status: RunStatus;
    streamStatus?: string;
    progress: number;
    retryCount: number;
    error?: string;
};

const toMsg = (e: unknown) =>
    e instanceof Error ? e.message || String(e) :
        typeof e === "string" ? e :
            (() => { try { return JSON.stringify(e); } catch { return String(e); } })();

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function useScheduler<T, Id extends string | number>(
    opts: SchedulerOptions<T, Id>
) {
    const maxRetries = opts.maxRetries ?? 3;

    // Natural task list & runtime state (keyed by string key)
    const tasks = useRef<Map<string, T>>(new Map());
    const state = useRef<Map<string, RunState>>(new Map());
    const order = useRef<string[]>([]);

    // Queues & runner flags
    const mainQ = useRef<string[]>([]);
    const retryQ = useRef<string[]>([]);
    const active = useRef(0);
    const running = useRef(false); // global "Process all"

    // Per-task completion promises
    const awaiting = useRef<Map<string, { resolve: () => void; reject: (e:any)=>void }>>(new Map());

    // UI snapshot (optional convenience for tables)
    const [runs, setRuns] = useState<RunView<T, Id>[]>([]);

    // --- key helpers ---
    const keyOfId      = (id: Id) => String(id);
    const keyOfRecord  = (r: T)   => String(opts.identity(r));
    const rawIdOfKey   = (key: string) => {
        const rec = tasks.current.get(key)!;
        return opts.identity(rec);
    };

    // --- emit snapshot ---
    const emit = () => {
        const out: RunView<T, Id>[] = [];
        for (const key of order.current) {
            const rec = tasks.current.get(key);
            const st  = state.current.get(key);
            console.log(rec, st)
            if (!rec || !st) continue;
            out.push({ id: opts.identity(rec), record: rec, ...st });
        }
        setRuns(out);
    };

    // --- state helpers ---
    const ensureRunState = (key: string) => {
        if (!state.current.has(key)) {
            state.current.set(key, { status: "idle", streamStatus: '', progress: 0, retryCount: 0 });
            order.current.push(key);
        }
        return state.current.get(key)!;
    };
    const setStatus = (key: string, status: RunStatus, patch?: Partial<RunState>) => {
        const st = ensureRunState(key);
        Object.assign(st, patch);
        st.status = status;
        emit();
    };
    const setStreamProgressKey = (key: string, status: string) => {
        const st = ensureRunState(key);
        st.streamStatus = status;
        emit();
    }

    const setProgressKey = (key: string, p: number) => {
        const st = ensureRunState(key);
        st.progress = Math.max(0, Math.min(100, p));
        emit();
    };
    const setProgress = (id: Id, p: number) => setProgressKey(keyOfId(id), p);

    const removeFromQueues = (key: string) => {
        mainQ.current = mainQ.current.filter(k => k !== key);
        retryQ.current = retryQ.current.filter(k => k !== key);
    };

    const hasPending = () =>
        active.current > 0 || mainQ.current.length > 0 || retryQ.current.length > 0;

    const maybeStopIfDrained = () => {
        if (running.current && !hasPending()) running.current = false;
    };

    const ensureAwait = (key: string) => {
        if (!awaiting.current.has(key)) {
            let resolve!: () => void, reject!: (e:any)=>void;
            const p = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
            awaiting.current.set(key, { resolve, reject });
            return p;
        }
        return new Promise<void>((res, rej) => {
            const prev = awaiting.current.get(key)!;
            awaiting.current.set(key, {
                resolve: () => { prev.resolve(); res(); },
                reject:  (e) => { prev.reject(e);  rej(e);  },
            });
        });
    };

    const waitForCapacity = (step = 16) =>
        new Promise<void>((resolve) => {
            const tick = () => {
                if (active.current < opts.maxConcurrency) return resolve();
                setTimeout(tick, step);
            };
            tick();
        });

    // --- scheduling ---
    const takeNext = () => mainQ.current.shift() ?? retryQ.current.shift();

    const maybeRun = useCallback(() => {
        if (!running.current) return;
        while (active.current < opts.maxConcurrency) {
            const key = takeNext();
            if (!key) break;
            runOne(key, false);
        }
        maybeStopIfDrained();
    }, [opts.maxConcurrency]);

    const runOne = (key: string, single: boolean) => {
        const rec = tasks.current.get(key);
        if (!rec) { setStatus(key, "abandoned"); return; }
        const st  = ensureRunState(key);

        active.current++;
        setStatus(key, "running");

        const helpers: HandlerHelpers<Id> = {
            setProgress: (id, p) => setProgressKey(keyOfId(id), p),
            setStreamProgress: (id, status) => setStreamProgressKey(keyOfId(id), status)
        };
        const arg = { ...st, id: opts.identity(rec), record: rec } as RunView<T, Id>;

        opts.handler(arg, helpers).then(
            async () => {
                active.current--;
                setStatus(key, "succeeded", { progress: 100, error: undefined, retryCount: 0 });
                awaiting.current.get(key)?.resolve();
                awaiting.current.delete(key);
                if (!single) maybeRun();
                maybeStopIfDrained();

                   if (!single) {
                        if (opts.delayMs) await sleep(opts.delayMs);
                        maybeRun();
                      }
                   maybeStopIfDrained();
            },
            async (err) => {
                active.current--;
                const st2 = ensureRunState(key);
                const next = st2.retryCount + 1;
                st2.retryCount = next;
                st2.error = toMsg(err);

                if (next <= maxRetries) {
                    if (single) {
                        setStatus(key, "retry_queued");
                        await waitForCapacity();
                        setStatus(key, "running", { progress: 0 });
                        setTimeout(() => runOne(key, true), 0);
                    } else {
                        setStatus(key, "retry_queued");
                        retryQ.current.push(key);
                        maybeRun();
                    }
                } else {
                    setStatus(key, "failed"); // keep last message in st2.error
                    awaiting.current.get(key)?.reject(err);
                    awaiting.current.delete(key);
                    if (!single) maybeRun();
                         if (!single) {
                              if (opts.delayMs) await sleep(opts.delayMs);
                              maybeRun();
                            }
                         maybeStopIfDrained();
                    maybeStopIfDrained();
                }
            }
        );
    };

    // --- public: load/update tasks (no auto-enqueue) ---
    const loadTasks = useCallback((records: T[], prune: "none" | "abandon" | "delete" = "none") => {
        const nextKeys = new Set<string>();
        for (const r of records) {
            const key = keyOfRecord(r);
            nextKeys.add(key);
            tasks.current.set(key, r);
            mainQ.current.push(key);
            ensureRunState(key); // ensure visible row
        }
        if (prune !== "none") {
            for (const key of Array.from(tasks.current.keys())) {
                if (nextKeys.has(key)) continue;
                removeFromQueues(key);
                if (prune === "delete") {
                    tasks.current.delete(key);
                    state.current.delete(key);

                    mainQ.current = mainQ.current.filter(k => k !== key);
                    order.current = order.current.filter(k => k !== key);
                } else {
                    setStatus(key, "abandoned");
                }
            }
        }
        emit();
    }, []);

    const loadTask = useCallback((record: T) => {
        const key = keyOfRecord(record);
        tasks.current.set(key, record);
        mainQ.current.push(key);
        ensureRunState(key); // makes it visible
        emit();
    }, []);

    const removeTask = useCallback((id: Id, mode: "abandon" | "delete" = "abandon") => {
        const key = keyOfId(id);
        removeFromQueues(key);
        if (mode === "delete") {
            tasks.current.delete(key);
            state.current.delete(key);
            order.current = order.current.filter(k => k !== key);
        } else {
            setStatus(key, "abandoned");
        }
        emit();
    }, []);

    const removeAllTasks = useCallback(() => {
        mainQ.current = []
        retryQ.current = []
        active.current = 0
        running.current = false
        tasks.current.clear()
        state.current.clear()
        order.current = []

        emit()
    }, [])

    // --- public: queue ops ---
    const enqueue = useCallback((id: Id) => {
        const key = keyOfId(id);
        if (!tasks.current.has(key)) return;
        const st = ensureRunState(key);
        if (["idle","failed","abandoned","succeeded"].includes(st.status)) {
            st.error = undefined;
            st.progress = 0;
            removeFromQueues(key);
            mainQ.current.push(key);
            setStatus(key, "queued");
            if (running.current) maybeRun();
        }
    }, [maybeRun]);

    const dequeue = useCallback((id: Id) => {
        const key = keyOfId(id);
        removeFromQueues(key);
        const st = ensureRunState(key);
        if (st.status === "queued" || st.status === "retry_queued") setStatus(key, "idle");
    }, []);

    const isEnqueued = useCallback((id: Id) => {
        const key = keyOfId(id);
        const st = state.current.get(key);
        return !!st && (st.status === "queued" || st.status === "retry_queued");
    }, []);

    // Run exactly one (and its retries) even if paused
    const runOneNow = useCallback(async (id: Id) => {
        const key = keyOfId(id);
        if (!tasks.current.has(key)) return Promise.reject(new Error(`Task ${String(id)} not found`));
        const done = ensureAwait(key);
        removeFromQueues(key);
        const st = ensureRunState(key);
        st.error = undefined; st.progress = 0;
        await waitForCapacity();
        setTimeout(() => runOne(key, true), 0);
        return done;
    }, []);

    // --- public: global controls ---
    const startAll = useCallback(() => {
        if (running.current) return;
        running.current = true;
        maybeRun();
    }, [maybeRun]);

    const stopAll = useCallback(() => { running.current = false; }, []);
    const isRunning = useCallback(() => running.current, []);

    // --- public: failed-only helpers ---
    const startFailedOnly = useCallback((resetRetries = true) => {
        for (const [key, st] of state.current.entries()) {
            if (st.status !== "failed") continue;
            if (resetRetries) st.retryCount = 0;
            st.error = undefined;
            st.progress = 0;
            removeFromQueues(key);
            mainQ.current.push(key);
            setStatus(key, "queued");
        }
        startAll();
    }, [startAll]);

    const rerunIfFailed = useCallback((id: Id, resetRetries = true) => {
        const key = keyOfId(id);
        const st = state.current.get(key);
        if (!st || st.status !== "failed") return;
        if (resetRetries) st.retryCount = 0;
        st.error = undefined; st.progress = 0;
        return runOneNow(id);
    }, [runOneNow]);

    // --- public: queries ---
    const getRun = useCallback((id: Id): RunView<T, Id> | undefined => {
        const key = keyOfId(id);
        const rec = tasks.current.get(key);
        const st  = state.current.get(key);
        if (!rec || !st) return undefined;
        return { id, record: rec, ...st };
    }, []);

    const getRecord = useCallback((id: Id) => tasks.current.get(keyOfId(id)), []);

    // initial empty paint
    useEffect(() => { emit(); }, []);

    return useMemo(() => ({
        // snapshot list (handy for tables; optional)
        runs,                                  // RunView<T, Id>[]
        // load/update the natural task list
        loadTasks, loadTask, removeTask, removeAllTasks,
        // queue ops
        enqueue, dequeue, isEnqueued,
        // run controls
        startAll, stopAll, isRunning,
        // single-task run (paused ok)
        runOne: runOneNow,
        // failed-only
        startFailedOnly,                       // start queue only for failed tasks
        rerunIfFailed,                         // re-run one if fully failed
        // lookup
        getRun, getRecord,
        // progress setter if you need it in custom places
        setProgress,
    }), [
        runs, loadTasks,
        enqueue, dequeue, isEnqueued,
        startAll, stopAll, isRunning,
        runOneNow, startFailedOnly, rerunIfFailed,
        getRun, getRecord, setProgress,
    ]);
}
