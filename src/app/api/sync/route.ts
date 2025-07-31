import { NextResponse } from "next/server";
import { QSPayClient } from "@/lib/qs-pay-client";
import { QSPayBrand, QSPayCategory, QSPayCombin } from "@/qspay-types";
import { db } from "@/db";
import {
    brands as localBrandsTable,
    categories as localCategoriesTable,
    combinations as localCombinationsTable,
    contents, tasks
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { categoryFlat } from "@/utils/category-flat";
import { isEmpty } from "@/utils/is-empty";

export const GET = async () => {
    const [{result: remoteBrands}, {result: categories}, {result: combinations}] = await Promise.all([
        QSPayClient<QSPayBrand[]>("CmsBrand/GetAll"),
        QSPayClient<QSPayCategory[]>("CmsCategory/GetAll"),
        QSPayClient<QSPayCombin[]>("CmsCombinPage/GetAllWithConfig")
    ])

    await db.execute(sql.raw(`TRUNCATE TABLE tasks RESTART IDENTITY`))
    await db.execute(sql.raw(`TRUNCATE TABLE contents RESTART IDENTITY`))

    await processBrands(remoteBrands)
    await processCategories(categories)
    await processCombinations(combinations)

    return NextResponse.json({stat: "ok"})
}

const processBrands = async (brands: QSPayBrand[]) => {
    const remoteBrandContents = await Promise.all(brands.map(async brand => {
        return QSPayClient<QSPayBrand>("CmsBrand/Get", {
            query: {
                brandId: brand.id,
            }
        }).then(x => x.result)
    }))

    // await db.delete(contents).where(eq(contents.entityType, "brand"))
    await db.insert(contents).values(remoteBrandContents.filter(c => !isEmpty(c.config)).map(brandContent => ({
        entityType: "brand",
        entityId: brandContent.id,
        config: brandContent.config,
    })))

    const localBrands = await db.select().from(localBrandsTable)
    const insertDiff: QSPayBrand[] = []
    const updateDiff: QSPayBrand[] = []

    for (const remoteBrand of brands) {
        const isExists = localBrands.find(x => x.slug?.toLowerCase() === remoteBrand.slug.toLowerCase().replace(/\//g, ""))
        if (!isExists) {
            insertDiff.push(remoteBrand)
        } else if (isExists.integrationId !== remoteBrand.id) {
            updateDiff.push(remoteBrand)
        }
    }

    await db.transaction(async (tx) => {
        if (insertDiff.length > 0) {
            await tx.insert(localBrandsTable).values(insertDiff.map(brand => ({
                name: brand.description!,
                slug: brand.slug.toLowerCase().replace(/\//g, ""),
                integrationId: brand.id,
                integrationName: brand.name
            })))
        }

        if (updateDiff.length > 0) {
            await Promise.all(updateDiff.map(async (brand) => await tx
                .update(localBrandsTable)
                .set({
                    integrationId: brand.id,
                    integrationName: brand.name
                })
                .where(eq(localBrandsTable.slug, brand.slug.toLowerCase().replace(/\//g, "")))
            ))
        }
    })
}

const processCategories = async (categories: QSPayCategory[]) => {
    const remoteCategoryContents = await Promise.all(categories.map(async category => {
        return QSPayClient<QSPayBrand>("CmsCategory/Get", {
            query: {
                categoryId: category.id,
            }
        }).then(x => x.result)
    }))

    // await db.delete(contents).where(eq(contents.entityType, "category"))
    await db.insert(contents).values(remoteCategoryContents.filter(c => !isEmpty(c.config)).map(categoryContent => ({
        entityType: "category",
        entityId: categoryContent.id,
        config: categoryContent.config,
    })))

    const localCategories = await db.select().from(localCategoriesTable)
    const insertDiff: QSPayCategory[] = []
    const updateDiff: QSPayCategory[] = []
    for (const remoteCategory of categoryFlat(categories)) {
        const isExists = localCategories.find(x => x.slug?.toLowerCase() === remoteCategory.slug.toLowerCase().replace(/\//g, ""))
        if (!isExists) {
            insertDiff.push(remoteCategory)
        } else if (isExists.integrationId !== remoteCategory.id) {
            updateDiff.push(remoteCategory)
        }
    }

    await db.transaction(async (tx) => {
        if (insertDiff.length > 0) {
            await tx.insert(localCategoriesTable).values(insertDiff.map(category => ({
                name: category.name,
                slug: category.slug.toLowerCase().replace(/\//g, ""),
                description: category.description,
                integrationId: category.id,
                integrationName: category.name,
            })))
        }

        if (updateDiff.length > 0) {
            await Promise.all(updateDiff.map(async (category) => await tx
                .update(localCategoriesTable)
                .set({
                    integrationId: category.id,
                    integrationName: category.name
                })
                .where(eq(localCategoriesTable.slug, category.slug.toLowerCase().replace(/\//g, "")))
            ))
        }
    })
}

const processCombinations = async (combinations: QSPayCombin[]) => {
    const filteredCombinations = combinations.filter(combination => combination.category && !combination.catalog)
    return await db.transaction(async (tx) => {
        await tx.insert(localCombinationsTable).values(filteredCombinations.map(combination => ({
            name: combination.name,
            description: combination.description,
            integrationId: combination.id,
            brandId: combination.brand.id,
            categoryId: combination.category.id,
        })))

        // await tx.delete(contents).where(eq(contents.entityType, "combination"))
        await tx.insert(contents).values(filteredCombinations.filter(c => !isEmpty(c.config)).map(combination => ({
            entityType: "combination",
            entityId: combination.id,
            config: combination.config,
        })))
    })
}