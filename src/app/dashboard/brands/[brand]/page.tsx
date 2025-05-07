import {eq} from "drizzle-orm"
import {db} from "@/db";
import {brandWithScales} from "@/db/schema";

type BrandPageProps = {
    params: Promise<{ brand: string }>
}
export default async function Brand(props: BrandPageProps) {
    const {brand: brandSlug} = await props.params
    const [brand] = await db.select().from(brandWithScales).where(eq(brandWithScales.slug, brandSlug)).limit(1)

    console.log(brand)

    return (
        <div>a</div>
    )
}