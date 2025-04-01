'use client';

import { Brand } from '@/types/brands';
import { preisLabels, designLabels, bekannheitLabels, sortimentsbreiteLabels, positionierungLabels } from '@/utils/scales';

interface ScaleDisplayProps {
  value: number;
  label: string;
  maxStars: number;
}

function ScaleDisplay({ value, label, maxStars }: ScaleDisplayProps) {
  return (
    <div className="flex flex-col">
      <div className="text-yellow-500">{'★'.repeat(value)}{'☆'.repeat(maxStars - value)}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

interface BrandTableProps {
  brands: Brand[];
}

export default function BrandTable({ brands }: BrandTableProps) {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marke</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charakteristik</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Design</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bekanntheit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sortimentsbreite</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positionierung</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {brands.map((brand, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{brand.Marke}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{brand['Kurzcharakteristik 1']}</div>
                {brand['Kurzcharakteristik 2'] && (
                  <div className="text-sm text-gray-500 mt-1">{brand['Kurzcharakteristik 2']}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ScaleDisplay value={brand.Preis} label={preisLabels[brand.Preis]} maxStars={5} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ScaleDisplay value={brand.Design} label={designLabels[brand.Design]} maxStars={5} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ScaleDisplay value={brand.Bekanntheit} label={bekannheitLabels[brand.Bekanntheit]} maxStars={5} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ScaleDisplay value={brand.Sortimentsbreite} label={sortimentsbreiteLabels[brand.Sortimentsbreite]} maxStars={5} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ScaleDisplay value={brand.Positionierung} label={positionierungLabels[brand.Positionierung]} maxStars={3} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 