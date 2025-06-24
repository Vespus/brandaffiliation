"use server"

import { ContentGenerateSchema } from "@/app/dashboard/content-generation/schema";
import { MetaOutputSchema } from "@/app/dashboard/content-generation/types";
import { appendMarkdown, getDriver } from "@/app/dashboard/content-generation/utils";
import { db } from "@/db";
import { getAIModelsWithProviderAndSettings } from "@/db/presets";
import { datasources, datasourceValues, systemPrompts } from "@/db/schema";
import { AIModelWithProviderAndSettings } from "@/db/types";
import { actionClient } from "@/lib/action-client";
import { QSPayClient } from "@/lib/qs-pay-client";
import { QSPayBrand, QSPayCategory, QSPayCombin, QSPayStore } from "@/qspay-types";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { and, eq, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";

export const CompletionStream = async (parsedInput: z.infer<typeof ContentGenerateSchema>) => {
    const cookieList = await cookies()
    const [
        models,
        prompt,
        {result: brand},
        {result: category},
        {result: store}
    ] = await Promise.all([
        getAIModelsWithProviderAndSettings(parsedInput.aiModel),
        db.query.systemPrompts.findFirst({
            where: eq(systemPrompts.id, parsedInput.prompt)
        }),
        QSPayClient<QSPayBrand>("CmsBrand/Get", {
            query: {
                brandId: parsedInput.brand,
            }
        }),
        QSPayClient<QSPayCategory>("CmsCategory/Get", {
            query: {
                categoryId: parsedInput.category,
            }
        }),
        QSPayClient<QSPayStore>("Store/Get", {
            query: {
                storeId: cookieList.get("qs-pay-store-id")?.value
            }
        })
    ])

    if (!models.length || !prompt) {
        throw new Error("Model not found")
    }

    let dataSourcePrompt = ""

    if (brand) {
        dataSourcePrompt = appendMarkdown(dataSourcePrompt, `<Brand>${JSON.stringify(brand)}</Brand>`)
    }

    if (category) {
        dataSourcePrompt = appendMarkdown(dataSourcePrompt, `<Category>${JSON.stringify(category)}</Category>`)
    }

    if (store) {
        dataSourcePrompt = appendMarkdown(dataSourcePrompt, `<StoreName>${store.name}</StoreName>`)
    }

    const queryableDataSources = parsedInput.dataSources?.filter(ds => ds.datasourceId)
    if (queryableDataSources) {
        for await (const source of queryableDataSources) {
            const [ds] = await db.select({
                name: datasources.name,
                description: datasources.description,
                data: sql<string[]>`array_agg
                    ((${datasourceValues.data} ->> ${datasources.valueColumn}):: text)`,
            })
                .from(datasources)
                .leftJoin(datasourceValues,
                    and(
                        eq(datasourceValues.datasourceId, datasources.id),
                        inArray(datasourceValues.id, [source.datasourceValueId!])
                    )
                )
                .where(eq(datasources.id, source.datasourceId as number))
                .groupBy(datasources.id)

            dataSourcePrompt = appendMarkdown(dataSourcePrompt, `<Datasource>${source.datasourcePrompt}: ${ds.data.join(", ")}</Datasource>`)
        }
    }

    const streamList = new Map(models.map((model) => ([model.id, createStreamableValue()])));

    Promise.all(models.map(async (model) => {
        const driver = getDriver(model)

        const {partialObjectStream} = streamObject({
            model: driver,
            maxTokens: model.settings.maxTokens,
            temperature: model.settings.temperature,
            topP: model.settings.topP,
            frequencyPenalty: model.settings.frequencyPenalty,
            presencePenalty: model.settings.presencePenalty,
            system: prompt.prompt,
            schema: MetaOutputSchema,
            prompt: dataSourcePrompt,

        })

        for await (const partialObject of partialObjectStream) {
            streamList.set(model.id, streamList.get(model.id)!.update(partialObject));
        }

        streamList.set(model.id, streamList.get(model.id)!.done())
    }))

    return [...streamList].map(([id, stream]) => ({
        model: models.find((model) => model.id === id) as AIModelWithProviderAndSettings,
        streamValue: stream.value
    }))
}

export const SaveToQSPay = actionClient
    .inputSchema(z.object({
        brandId: z.string().optional(),
        brandName: z.string().optional(),
        categoryName: z.string().optional(),
        categoryId: z.string().optional(),
        output: MetaOutputSchema
    }), {
        handleValidationErrorsShape: async (ve, utils) => console.dir(ve._errors),
    })
    .action(async ({parsedInput: {brandId, brandName, categoryName, categoryId, output}}) => {
        console.log(brandId)
        if (brandId && categoryId) {
            //combin page
            const {result: allCombinationPages} = await QSPayClient<QSPayCombin[]>("CmsCombinPage/GetAll")
            const foundCombinationPage = allCombinationPages.find(cp => cp.category.id === categoryId && cp.brand.id === brandId)

            if (!foundCombinationPage) {
                throw new Error("Combination page not found. BrandAffiliation can't create a new one, please create one manually then try again.")
            }

            const {result: editResult} = await QSPayClient<QSPayCombin[]>("CmsCombinPage/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    categoryName,
                    brandName,
                    config: output
                })
            })

            return editResult
        }

        if(brandId && !categoryId) {
            //brand page
            const {result: allBrandPages} = await QSPayClient<QSPayBrand[]>("CmsBrand/GetAll")
            const foundBrandPage = allBrandPages.find(cp => cp.id === brandId)

            if (!foundBrandPage) {
                throw new Error("Brand page not found. BrandAffiliation can't create a new one, please create one manually then try again.")
            }

            const {result: editResult} = await QSPayClient<QSPayBrand[]>("CmsBrand/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    brandName,
                    config: output
                })
            })

            return editResult
        }

        if(!brandId && categoryId) {
            //category page
            const {result: allCategoryPages} = await QSPayClient<QSPayCategory[]>("CmsCategory/GetAll")
            const foundCategoryPage = allCategoryPages.find(cp => cp.id === categoryId)

            if (!foundCategoryPage) {
                throw new Error("Category page not found. BrandAffiliation can't create a new one, please create one manually then try again.")
            }

            const {result: editResult} = await QSPayClient<QSPayCategory[]>("CmsCategory/EditDescription", {
                method: "POST",
                body: JSON.stringify({
                    categoryName,
                    config: output
                })
            })

            return editResult
        }

        throw new Error("Something went wrong. Please try again. If the problem persists, please contact support.")
    })