// lib/progressTweener.ts
export type ApplyFn = (pct: number) => void

export class ProgressTweener {
    private raf: number | null = null
    private from = 0
    private to = 0
    private start = 0
    private duration = 800
    private apply: ApplyFn
    private stopped = false

    constructor(apply: ApplyFn, initial = 0) {
        this.apply = apply
        this.from = this.to = initial
        this.apply(initial)
    }

    /** Smoothly tween to next target (0..100). If called again, it retargets. */
    toPercent(target: number, opts?: { duration?: number }) {
        this.duration = Math.max(0, opts?.duration ?? 800)
        this.from = this.to // continue from last target (or current if in-flight)
        this.to = Math.max(0, Math.min(100, target))
        this.start = performance.now()
        this.stopped = false
        this.loop()
    }

    /** Immediately set value, canceling any tween. */
    snap(target: number) {
        this.cancel()
        this.from = this.to = Math.max(0, Math.min(100, target))
        this.apply(this.to)
    }

    cancel() {
        this.stopped = true
        if (this.raf != null) cancelAnimationFrame(this.raf)
        this.raf = null
    }

    private loop = () => {
        if (this.stopped) return
        const now = performance.now()
        const t = this.duration === 0 ? 1 : Math.min(1, (now - this.start) / this.duration)
        // easeOutCubic (nicer than linear)
        const eased = 1 - Math.pow(1 - t, 3)
        const value = this.from + (this.to - this.from) * eased
        this.apply(value)

        if (t < 1) {
            this.raf = requestAnimationFrame(this.loop)
        } else {
            this.raf = null
            this.from = this.to
        }
    }
}