import { z } from "zod";

export const MetaOutputSchema = z.object({
    meta: z.object({
        title: z.string().describe("Meta title"),
        description: z.string().describe("Meta description, use ascii chars like ▶ between emphasis sentences"),
        category: z.string().describe("Category name"),
        openGraph: z.object({
            type: z.string().describe("Open Graph type"),
            title: z.string().describe("Open Graph title"),
            description: z.string().describe("Open Graph description"),
            locale: z.string().describe("Content locale")
        }).describe("Open Graph metadata"),
        twitter: z.object({
            card: z.string().describe("Twitter card type"),
            title: z.string().describe("Twitter title"),
            description: z.string().describe("Twitter description"),
        }).describe("Twitter metadata"),
        robot: z.string().describe("Robot meta tag content")
    }).describe("Meta information"),
    descriptions: z.object({
        header: z.string().describe("Banner Hero Header description in html with *one h1* and at least *two p* tags. paragraphs should be minimum 50-100 words long"),
        footer: z.string().describe("Bottom of the page Hero Footer description")
    }).describe("Content descriptions")
})