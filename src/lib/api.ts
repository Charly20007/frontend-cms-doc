import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/api';

const CLAVE_SESION = 'cms.sesion';

/** Cliente HTTP de la API: añade el token y avisa cuando la sesión expira. */
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = leerSesion()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    // 401 en cualquier llamada que no sea el propio login = token vencido o inválido
    if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/login')) {
      window.dispatchEvent(new Event('cms:sesion-expirada'));
    }
    return Promise.reject(error);
  },
);

export interface SesionGuardada {
  token: string;
  expiraEn: string;
}

export function leerSesion<T extends SesionGuardada>(): T | null {
  try {
    const raw = localStorage.getItem(CLAVE_SESION);
    if (!raw) return null;
    const sesion = JSON.parse(raw) as T;
    if (new Date(sesion.expiraEn).getTime() <= Date.now()) {
      localStorage.removeItem(CLAVE_SESION);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: SesionGuardada | null) {
  try {
    if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
    // almacenamiento no disponible: la sesión dura lo que la pestaña
  }
}

/** Convierte cualquier error de la API en un mensaje legible en español. */
export function mensajeError(error: unknown, porDefecto = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con la API. Verifique que esté encendida.';
    const data = error.response.data as { mensaje?: string; errors?: Record<string, string[]>; title?: string } | undefined;
    if (data?.mensaje) return data.mensaje;
    if (data?.errors) return Object.values(data.errors).flat().join(' ');
    if (error.response.status === 403) return 'Su usuario no tiene permiso para esta acción.';
    if (error.response.status === 429) return 'Demasiados intentos. Espere un momento.';
  }
  return porDefecto;
}
