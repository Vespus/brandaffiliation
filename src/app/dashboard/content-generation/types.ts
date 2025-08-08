import { z } from 'zod'

export const MetaOutputSchema = z.object({
    meta: z
        .object({
            title: z
                .string()
                .describe('Meta title text. Plain string only. No HTML. Concise and relevant to page content.'),
            description: z
                .string()
                .describe(
                    'Meta description. Use only ASCII characters. Use the "▶" character between emphasis sentences.'
                ),
            category: z.string().describe('Category name for the content. Single plain string.'),
            openGraph: z
                .object({
                    type: z.string().describe('Open Graph type. Value must be exactly "article".'),
                    title: z.string().describe('Open Graph title. Should closely match the meta title.'),
                    description: z
                        .string()
                        .describe('Open Graph description. Should closely match the meta description.'),
                    locale: z.string().describe('Open Graph content locale in BCP47 format (e.g., "en_US").'),
                })
                .describe('Open Graph metadata for Facebook and other platforms.'),
            twitter: z
                .object({
                    card: z.string().describe('Twitter card type. Value must be exactly "summary".'),
                    title: z.string().describe('Twitter title. Should closely match the meta title.'),
                    description: z.string().describe('Twitter description. Maximum 200 characters.'),
                })
                .describe('Twitter Card metadata for shareable links.'),
            robot: z.string().describe('Robots meta tag content (e.g., "index, follow").'),
        })
        .describe('SEO meta information object.'),
    descriptions: z
        .object({
            header: z
                .string()
                .describe(
                    'HTML string for the banner hero header. Must contain exactly one <h1> tag and at least two <p> tags. Each paragraph must be 50–100 words long. No inline styles allowed.'
                ),
            footer: z
                .string()
                .describe(
                    'HTML string for the page footer section. Should contain headings (<h2>, <h3>, or <h4>) and <p> tags. No inline styles allowed.'
                ),
        })
        .describe('Structured HTML content descriptions. Return only JSON, not a stringified JSON.'),
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
