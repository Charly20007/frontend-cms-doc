import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, guardarSesion, leerSesion } from '../lib/api';
import type { LoginRespuesta, UsuarioActual } from '../lib/tipos';

interface Sesion {
  token: string;
  expiraEn: string;
  usuario: UsuarioActual;
}

interface AuthContextType {
  usuario: UsuarioActual | null;
  puedeEditarContenido: boolean;
  iniciarSesion: (correo: string, password: string) => Promise<void>;
  cerrarSesion: (motivo?: string) => void;
  /** Mensaje mostrado en el login tras un cierre automático (p. ej. sesión vencida). */
  motivoCierre: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sesion, setSesion] = useState<Sesion | null>(() => leerSesion<Sesion>());
  const [motivoCierre, setMotivoCierre] = useState<string | null>(null);

  const cerrarSesion = useCallback((motivo?: string) => {
    guardarSesion(null);
    setSesion(null);
    setMotivoCierre(motivo ?? null);
  }, []);

  const iniciarSesion = useCallback(async (correo: string, password: string) => {
    const { data } = await api.post<LoginRespuesta>('/api/auth/login', { correo, password });
    const nueva: Sesion = { token: data.token, expiraEn: data.expiraEn, usuario: data.usuario };
    guardarSesion(nueva);
    setMotivoCierre(null);
    setSesion(nueva);
  }, []);

  // Cierre automático: token rechazado por la API o vencido por tiempo
  useEffect(() => {
    const alExpirar = () => cerrarSesion('Su sesión expiró. Inicie sesión nuevamente.');
    window.addEventListener('cms:sesion-expirada', alExpirar);
    if (!sesion) return () => window.removeEventListener('cms:sesion-expirada', alExpirar);

    const restante = new Date(sesion.expiraEn).getTime() - Date.now();
    const temporizador = window.setTimeout(alExpirar, Math.max(0, Math.min(restante, 2 ** 31 - 1)));
    return () => {
      window.removeEventListener('cms:sesion-expirada', alExpirar);
      window.clearTimeout(temporizador);
    };
  }, [sesion, cerrarSesion]);

  const valor = useMemo<AuthContextType>(() => ({
    usuario: sesion?.usuario ?? null,
    puedeEditarContenido: sesion?.usuario.rol === 'Administrador' || sesion?.usuario.rol === 'Cirujano',
    iniciarSesion,
    cerrarSesion,
    motivoCierre,
  }), [sesion, iniciarSesion, cerrarSesion, motivoCierre]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
