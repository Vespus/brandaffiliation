import Papa from 'papaparse';

export type CSVParseOptions = {
  header?: boolean;
  skipEmptyLines?: boolean;
  dynamicTyping?: boolean;
};

export const parseCSV = async (file: File, options: CSVParseOptions = {}) => {
  const defaultOptions = {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    ...options,
  };

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      ...defaultOptions,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseCSVString = (csvString: string, options: CSVParseOptions = {}) => {
  const defaultOptions = {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    ...options,
  };

  return Papa.parse(csvString, defaultOptions).data;
};

export const convertToCSV = (data: any[], options: CSVParseOptions = {}) => {
  const defaultOptions = {
    header: true,
    skipEmptyLines: true,
    ...options,
  };

  return Papa.unparse(data, defaultOptions);
}; 