import { findSimilarityByScale, searchParamsCache } from "@/app/dashboard/brands/[brand]/queries";
import { SearchParams } from "nuqs/server";
import { BrandWithCharacteristicAndScales } from "@/db/schema";

const scaleNames = [
  'price',
  'quality',
  'focus',
  'design',
  'positioning',
  'origin',
  'heritage',
  'recognition',
  'revenue'
];

export const NeighborScaleType = async ({brand, searchParams}: {brand: BrandWithCharacteristicAndScales, searchParams: SearchParams}) => {
  const scaleSearchParams = searchParamsCache.parse(searchParams);
  const scaleResult = await findSimilarityByScale(brand, scaleSearchParams)

  console.log(scaleResult)

  return (
      <div>
        bok
      </div>
  )
}