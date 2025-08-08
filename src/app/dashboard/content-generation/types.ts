import { z } from 'zod'

export const MetaOutputSchema = z.object({
    meta: z
        .object({
            title: z.string().describe('Meta title'),
            description: z.string().describe('Meta description, use ascii chars like ▶ between emphasis sentences'),
            category: z.string().describe('Category name'),
            openGraph: z
                .object({
                    type: z.string().describe('Open Graph type'),
                    title: z.string().describe('Open Graph title'),
                    description: z.string().describe('Open Graph description'),
                    locale: z.string().describe('Content locale'),
                })
                .describe('Facebook OpenGraph metadata'),
            twitter: z
                .object({
                    card: z.string().describe('Twitter card type'),
                    title: z.string().describe('Twitter title'),
                    description: z.string().describe('Twitter description'),
                })
                .describe('Twitter shareable link metadata'),
            robot: z.string().describe('Robot meta tag content'),
        })
        .describe('Meta information'),
    descriptions: z
        .object({
            header: z
                .string()
                .describe(
                    'Banner Hero Header description in html with *one h1* and at least *two p* tags without style. paragraphs should be minimum 50-100 words long'
                ),
            footer: z.string().describe('Bottom of the page Hero Footer description must use *html* without style, usually h2, h3, h4 and p tags'),
        })
        .describe('Content descriptions'),
})

export type MetaOutput = z.infer<typeof MetaOutputSchema>

export const PartialMetaOutputSchema = z.object({
    meta: z
        .object({
            title: z.string().optional().describe('Meta title'),
            description: z
                .string()
                .optional()
                .describe('Meta description, use ascii chars like ▶ between emphasis sentences'),
            category: z.string().optional().describe('Category name'),
            openGraph: z
                .object({
                    type: z.string().optional().describe('Open Graph type'),
                    title: z.string().optional().describe('Open Graph title'),
                    description: z.string().optional().describe('Open Graph description'),
                    locale: z.string().optional().describe('Content locale'),
                })
                .optional()
                .describe('Open Graph metadata'),
            twitter: z
                .object({
                    card: z.string().optional().describe('Twitter card type'),
                    title: z.string().optional().describe('Twitter title'),
                    description: z.string().optional().describe('Twitter description'),
                })
                .optional()
                .describe('Twitter metadata'),
            robot: z.string().optional().describe('Robot meta tag content'),
        })
        .optional()
        .describe('Meta information'),
    descriptions: z
        .object({
            header: z
                .string()
                .optional()
                .describe(
                    'Banner Hero Header description in html with *one h1* and at least *two p* tags. paragraphs should be minimum 50-100 words long'
                ),
            footer: z.string().optional().describe('Bottom of the page Hero Footer description'),
        })
        .optional()
        .describe('Content descriptions'),
})

export type PartialMetaOutput = z.infer<typeof PartialMetaOutputSchema>