import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { datasourceValues } from '@/db/schema'

export const getDatasourceValues = async (datasourceId: number) => {
    const values = await db.query.datasourceValues.findMany({
        where: eq(datasourceValues.datasourceId, datasourceId),
        orderBy: (datasourceValues, { asc }) => [asc(datasourceValues.id)],
    })

    return values
}
