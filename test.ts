import postgres from "postgres";
import json from "./bok.json" with {type: 'json'}

const client = postgres("postgresql://postgres.nmgrlogjrnetqbommmym:u2B0T0FSeGmC6aUR@aws-0-eu-central-1.pooler.supabase.com:6543/postgres");

async function main() {
    const brands = await client
        `select *
         from brands`

    const scales = await client`
        select *
        from scales`

    await client.begin(async sql => {
        for (const brand of brands) {
            const jsoneq = json.find(b => b["Marke / Brand"].toLowerCase() === brand.name.toLowerCase())
            if (!jsoneq) {
                continue
            }
            Object.entries(jsoneq).forEach(async ([key, value]) => {
                const scaleeq = scales.find(s => s.name_de.toLowerCase() === key.toLowerCase())
                if(scaleeq){
                    const insert = {
                        brand_id: brand.id,
                        scale_id: scaleeq.id,
                        value: parseFloat(value.toString().replace(',', '.'))
                    }
                    await sql`insert into brand_scales ${sql(insert, 'brand_id', 'scale_id', 'value')}`
                }
            })
        }
    })
    await client.end()
}

main()