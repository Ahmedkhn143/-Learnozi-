export const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || '';
export const API = API_URL;
