import {
    bigint,
    boolean,
    foreignKey,
    index,
    integer,
    jsonb,
    pgTable, pgView,
    real,
    serial,
    text,
    timestamp,
    varchar
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const brands = pgTable("brands", {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    slug: varchar()
});

export const characteristics = pgTable("characteristics", {
    id: serial().primaryKey().notNull(),
    brandId: integer("brand_id").notNull(),
    value: text().notNull(),
}, (table) => [
    index("similarity_gin").using("gin", table.value.asc().nullsLast().op("gin_trgm_ops")),
    index("similarity_gist").using("gist", table.value.asc().nullsLast().op("gist_trgm_ops")),
    foreignKey({
        columns: [table.brandId],
        foreignColumns: [brands.id],
        name: "fk_brand"
    }).onDelete("cascade"),
]);

export const scaleGroups = pgTable("scale_groups", {
    label: varchar({ length: 50 }).notNull(),
    isAdditional: boolean("is_additional").default(false).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "scale_groups_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
});

export const scales = pgTable("scales", {
    label: varchar({ length: 50 }).notNull(),
    id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "scales_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    scaleGroupId: bigint("scale_group_id", { mode: "number" }),
});

export const brandScales = pgTable("brand_scales", {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id).notNull(),
    scaleId: integer("scale_id").references(() => scales.id).notNull(),
    value: integer("value").notNull(),
})


export const brandWithScales = pgView("brand_with_scales", {	id: integer(),
    name: text(),
    price: real(),
    quality: real(),
    focus: real(),
    design: real(),
    positioning: real(),
    origin: real(),
    heritage: real(),
    recognition: real(),
    revenue: real(),
    characteristic: jsonb(),
    slug: varchar(),
}).as(sql`SELECT brands.id, brands.name, max( CASE WHEN scales.label::text = 'price'::text THEN brand_scales.value ELSE NULL::real END) AS price, max( CASE WHEN scales.label::text = 'quality'::text THEN brand_scales.value ELSE NULL::real END) AS quality, max( CASE WHEN scales.label::text = 'focus'::text THEN brand_scales.value ELSE NULL::real END) AS focus, max( CASE WHEN scales.label::text = 'design'::text THEN brand_scales.value ELSE NULL::real END) AS design, max( CASE WHEN scales.label::text = 'positioning'::text THEN brand_scales.value ELSE NULL::real END) AS positioning, max( CASE WHEN scales.label::text = 'origin'::text THEN brand_scales.value ELSE NULL::real END) AS origin, max( CASE WHEN scales.label::text = 'heritage'::text THEN brand_scales.value ELSE NULL::real END) AS heritage, max( CASE WHEN scales.label::text = 'recognition'::text THEN brand_scales.value ELSE NULL::real END) AS recognition, max( CASE WHEN scales.label::text = 'revenue'::text THEN brand_scales.value ELSE NULL::real END) AS revenue, COALESCE(( SELECT jsonb_agg(jsonb_build_object('id', c.id, 'value', c.value)) AS jsonb_agg FROM characteristics c WHERE c.brand_id = brands.id), '[]'::jsonb) AS characteristic, brands.slug FROM brands LEFT JOIN brand_scales ON brands.id = brand_scales.brand_id LEFT JOIN scales ON brand_scales.scale_id = scales.id GROUP BY brands.id, brands.name`);