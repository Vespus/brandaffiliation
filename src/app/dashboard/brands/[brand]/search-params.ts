import { createSearchParamsCache, parseAsArrayOf, parseAsFloat } from "nuqs/server";
import { DEFAULT_SCALE_WEIGHTS } from "@/app/dashboard/brands/[brand]/constant";
import { z } from "zod";

export const searchParams = {
    price: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.price),
    quality: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.quality),
    focus: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.focus),
    design: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.design),
    positioning: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.positioning),
    heritage: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.heritage),
    origin: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.origin),
    recognition: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.recognition),
    revenue: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.revenue),
    similarityWeight: parseAsArrayOf(z.coerce.number()).withDefault([0.4, 0.6])
};

export const searchParamsCache = createSearchParamsCache(searchParams)