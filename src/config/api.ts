/**
 * URL base de la API .NET (backend-doc).
 * Se define con VITE_API_URL en .env.local (ver .env.example).
 */
export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5029').replace(/\/$/, '');
