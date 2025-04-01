'use client';

import { useState } from 'react';
import { parseCSV } from '@/utils/csv';

export default function CSVUploadExample() {
  const [data, setData] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseCSV(file);
      setData(parsedData as any[]);
    } catch (error) {
      console.error('Fehler beim Parsen der CSV-Datei:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CSV Upload Beispiel</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {data.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Geladene Daten:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((header) => (
                    <th key={header} className="border border-gray-200 px-4 py-2 bg-gray-50">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="border border-gray-200 px-4 py-2">
                        {value?.toString() ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 