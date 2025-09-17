export type StreamProgressOptions = {
    signal?: AbortSignal
    stepPercent?: Record<string, number> // e.g. {'thinking...':10,'processing...':60,'finished':100}
    totalSteps?: number                   // if statuses are evenly spaced
    onStatus?: (status: string) => void
}

const clamp = (n: number) => Math.max(0, Math.min(100, n))
const evenPct = (i: number, total: number) => clamp(Math.round((i / total) * 100))

export async function streamProgressFromRoute(
    fetcher: () => Promise<Response>,
    onMilestone: (pct: number, latestStatus: string) => void,
    opts: StreamProgressOptions = {}
) {
    const res = await fetcher()
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if (!res.body) throw new Error('No response body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    const all: string[] = []

    while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        let nl
        while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim()
            buf = buf.slice(nl + 1)
            if (!line) continue

            const msg = JSON.parse(line)
            if (msg.error) throw new Error(msg.error)
            if (msg.done) {
                onMilestone(100, 'done')
                continue
            }

            let latest: string | undefined
            let pct: number | undefined

            if (Array.isArray(msg.statuses)) {
                all.splice(0, all.length, ...msg.statuses)
                latest = all[all.length - 1]
            } else if (typeof msg.append === 'string') {
                all.push(msg.append)
                latest = msg.append
            }

            if (latest) {
                opts.onStatus?.(latest)
                if (opts.stepPercent?.[latest] != null) {
                    pct = opts.stepPercent[latest]
                } else if (opts.totalSteps) {
                    pct = evenPct(all.length, opts.totalSteps)
                } else {
                    // guess 3 steps minimum so early movement doesn’t jump to 100 too soon
                    pct = evenPct(all.length, Math.max(3, all.length))
                }
                onMilestone(pct, latest)
            }
        }
    }
}