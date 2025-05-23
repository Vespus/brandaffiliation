import { BrandWithCharacteristicAndScales } from "@/db/types";

export const DEFAULT_SCALE_WEIGHTS: Record<keyof Omit<BrandWithCharacteristicAndScales, "characteristic" | "slug" | "name" | "id">, number> = {
    price: 0.125,
    quality: 0.125,
    focus: 0.1,
    design: 0.1,
    positioning: 0.125,
    origin: 0.1,
    heritage: 0.1,
    recognition: 0.125,
    revenue: 0.1
};
