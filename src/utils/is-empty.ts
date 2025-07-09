export const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
        return Object.values(value).every(isEmpty);
    }
    return false;
}