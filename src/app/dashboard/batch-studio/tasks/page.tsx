import { Tasks } from '@/app/dashboard/batch-studio/tasks/tasks'
import { getTasks, searchParamsCache } from '@/app/dashboard/batch-studio/tasks/queries'
import { SearchParams } from 'nuqs/server'

type TasksPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: TasksPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)
    const promise = getTasks(search)

    return <Tasks promise={promise} />
}
