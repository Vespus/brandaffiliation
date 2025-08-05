'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { and, eq } from 'drizzle-orm'
import { PgTableWithColumns } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { db } from '@/db'
import {
    brandsStores,
    categoriesStores,
    contents,
    brands as localBrandsTable,
    categories as localCategoriesTable,
    combinations as localCombinationsTable,
    reviews,
    tasks,
} from '@/db/schema'
import { actionClient } from '@/lib/action-client'
import { QSPayClient } from '@/lib/qs-pay-client'
import { SoftHttpError } from '@/lib/soft-http-error'
import { QSPayAuthResponse, QSPayBrand, QSPayCategory, QSPayCombin, QSPaySingleStoreBasedCategory } from '@/qspay-types'
import { categoryFlat } from '@/utils/category-flat'
import { isEmpty } from '@/utils/is-empty'

export const connect = actionClient
    .inputSchema(
        z.object({
            email: z.string().email().min(1, 'Email is required'),
            password: z.string().min(1, 'Password is required'),
        })
    )
    .action(async ({ parsedInput: { email, password } }) => {
        const cookieList = await cookies()
        const { result } = await QSPayClient<QSPayAuthResponse>('User/Authenticate', {
            method: 'POST',
            body: JSON.stringify({
                userName: email,
                password,
            }),
        })

        if (!result) {
            throw new Error('Wrong credentials!')
        }

        cookieList.set('qs-pay-integration-key', result.accessToken, {
            expires: new Date(result.expires),
        })

        revalidatePath('/', 'layout')
    })

export const sync = actionClient.action(async () => {
    const cookieList = await cookies()
    const storeId = cookieList.get('qs-pay-store-id')?.value

    if (!storeId) {
        throw new SoftHttpError('Invalid request')
    }

    const [{ result: remoteBrands }, { result: categories }, { result: combinations }] = await Promise.all([
        QSPayClient<QSPayBrand[]>('CmsBrand/GetAll', { query: { storeId: storeId } }),
        QSPayClient<QSPayCategory[]>('CmsCategory/GetAll', { query: { storeId: storeId } }),
        QSPayClient<QSPayCombin[]>('CmsCombinPage/GetAllWithConfig', { query: { storeId: storeId } }),
    ])

    await processBrands(remoteBrands, storeId)
    await processCategories(categories, storeId)
    await processCombinations(combinations, storeId)

    await processTasks(tasks, storeId)
    await processTasks(reviews, storeId)

    revalidatePath('/', 'layout')

    return 'ok'
})

const processTasks = async (dbObj: PgTableWithColumns<any>, storeId: string) => {
    const taskList = await db.select().from(dbObj).where(eq(dbObj.storeId, storeId))
    await Promise.all(
        taskList.map(async (task) => {
            switch (task.entityType) {
                case 'brand':
                    const isBrandExists = await db
                        .select()
                        .from(brandsStores)
                        .where(eq(brandsStores.integrationId, task.entityId))
                    if (!isBrandExists) {
                        await db.delete(dbObj).where(eq(dbObj.id, task.id))
                    }
                    break
                case 'category':
                    const isCategoryExists = await db
                        .select()
                        .from(categoriesStores)
                        .where(eq(categoriesStores.integrationId, task.entityId))
                    if (!isCategoryExists) {
                        await db.delete(dbObj).where(eq(dbObj.id, task.id))
                    }
                    break
                case 'combination':
                    const isCombinationExists = await db
                        .select()
                        .from(localCombinationsTable)
                        .where(eq(localCombinationsTable.integrationId, task.entityId))
                    if (!isCombinationExists) {
                        await db.delete(dbObj).where(eq(dbObj.id, task.id))
                    }
                    break
            }
        })
    )
}

const processBrands = async (brands: QSPayBrand[], storeId: string) => {
    const remoteBrandContents = await Promise.all(
        brands.map(async (brand) => {
            return QSPayClient<QSPayBrand>('CmsBrand/Get', {
                query: {
                    brandId: brand.id,
                    storeId: storeId,
                },
            }).then((x) => x.result)
        })
    )

    await db.delete(brandsStores).where(eq(brandsStores.storeId, storeId))
    await db.delete(contents).where(and(eq(contents.entityType, 'brand'), eq(contents.storeId, storeId)))

    const contentTargets = remoteBrandContents.filter(x => !isEmpty(x.config))
    if(contentTargets.length > 0) {
        await db.insert(contents).values(
            contentTargets
                .map((brandContent) => ({
                    entityType: 'brand',
                    entityId: brandContent.id,
                    config: brandContent.config,
                    storeId: brandContent.storeId,
                }))
        )
    }

    const localBrands = await db.select().from(localBrandsTable)
    await db.insert(brandsStores).values(
        remoteBrandContents
            .map((brandContent) => {
                const localBrand = localBrands.find(
                    (lb) => lb.slug?.toLowerCase() === brandContent.slug.toLowerCase().replace(/\//g, '')
                )

                if (!localBrand) {
                    console.info(brandContent.name, ': Brand not found')
                    return false
                }

                return {
                    brandId: localBrand.id,
                    storeId: brandContent.storeId,
                    slug: brandContent.slug.toLowerCase().replace(/\//g, ''),
                    integrationId: brandContent.id,
                    integrationName: brandContent.name,
                }
            })
            .filter((x) => !!x)
    )
}

const processCategories = async (categories: QSPayCategory[], storeId: string) => {
    const remoteCategoryContents = await Promise.all(
        categoryFlat(categories).map(async (category) => {
            return QSPayClient<QSPaySingleStoreBasedCategory>('CmsCategory/Get', {
                query: {
                    categoryId: category.id,
                    storeId,
                },
            }).then((x) => x.result)
        })
    )

    await db.delete(categoriesStores).where(eq(categoriesStores.storeId, storeId))
    await db.delete(contents).where(and(eq(contents.entityType, 'category'), eq(contents.storeId, storeId)))

    await db.insert(contents).values(
        remoteCategoryContents
            .filter((c) => !isEmpty(c.config))
            .map((categoryContent) => ({
                entityType: 'category',
                entityId: categoryContent.id,
                config: categoryContent.config,
                storeId: categoryContent.storeId,
            }))
    )

    const localCategories = await db.select().from(localCategoriesTable)
    await db.insert(categoriesStores).values(
        remoteCategoryContents
            .map((categoryContent) => {
                const localCategory = localCategories.find(
                    (lb) => lb.slug?.toLowerCase() === categoryContent.slug.toLowerCase().replace(/\//g, '')
                )

                if (!localCategory) {
                    console.info(categoryContent.name, ': Category not found')
                    return false
                }

                return {
                    categoryId: localCategory.id,
                    storeId: categoryContent.storeId,
                    slug: categoryContent.slug.toLowerCase().replace(/\//g, ''),
                    integrationId: categoryContent.id,
                    integrationName: categoryContent.name,
                }
            })
            .filter((x) => !!x)
    )
}

const processCombinations = async (combinations: QSPayCombin[], storeId: string) => {
    const filteredCombinations = combinations.filter((combination) => combination.category && !combination.catalog)

    await db.delete(localCombinationsTable).where(eq(localCombinationsTable.storeId, storeId))
    await db.delete(contents).where(and(eq(contents.entityType, 'combination'), eq(contents.storeId, storeId)))

    await db.insert(localCombinationsTable).values(
        filteredCombinations.map((combination) => ({
            name: combination.name,
            description: combination.description,
            integrationId: combination.id,
            brandId: combination.brand.id,
            categoryId: combination.category.id,
            storeId: combination.storeId,
        }))
    )

    await db.insert(contents).values(
        filteredCombinations
            .filter((c) => !isEmpty(c.config))
            .map((combination) => ({
                entityType: 'combination',
                entityId: combination.id,
                config: combination.config,
                storeId: combination.storeId,
            }))
    )
}
