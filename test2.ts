import postgres from 'postgres'

const client = postgres(
    'postgresql://postgres.nmgrlogjrnetqbommmym:u2B0T0FSeGmC6aUR@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
)

async function main() {
    await client.begin(async (sql) => {
        const brands = await sql`select * from brands`
        const scales = await sql`select * from scales`
        console.log(scales)
        const map = {
            price: 'price',
            quality: 'quality',
            focus: 'focus',
            design: 'design',
            positioning: 'positioning',
            origin: 'origin',
            heritage: 'heritage',
            recognition: 'fame',
            revenue: 'sales_volume',
        }

        for (const brand of brands) {
            for (const scale of scales) {
                const insq = {
                    brand_id: brand.id,
                    scale_id: scale.id,
                    value: brand[map[scale.label]],
                }

                await sql`insert into brand_scales ${sql(insq, 'brand_id', 'scale_id', 'value')}`
            }
        }
    })
    await client.end()
}

main()
