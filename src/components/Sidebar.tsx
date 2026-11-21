import React from 'react';
import { LayoutDashboard, CalendarCheck, Scissors, MessageSquareQuote, ShieldCheck, LogOut, Sun, Moon, Newspaper, Search, Settings, ExternalLink, Scale } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { navegar, WEB_URL } from '../lib/router';

export type Seccion = 'dashboard' | 'citas' | 'procedimientos' | 'blog' | 'testimonios' | 'legales' | 'seo' | 'configuracion';

interface SidebarProps {
  activa: Seccion;
  darkMode: boolean;
  onToggleTheme: () => void;
}

interface Item {
  id: Seccion;
  label: string;
  icon: React.ReactNode;
  soloContenido?: boolean;
}

const GRUPOS: { titulo: string; items: Item[] }[] = [
  {
    titulo: 'Consultorio',
    items: [
      { id: 'dashboard', label: 'Resumen', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'citas', label: 'Agenda y citas', icon: <CalendarCheck className="w-5 h-5" /> },
    ],
  },
  {
    titulo: 'Contenido web',
    items: [
      { id: 'procedimientos', label: 'Procedimientos', icon: <Scissors className="w-5 h-5" />, soloContenido: true },
      { id: 'blog', label: 'Blog médico', icon: <Newspaper className="w-5 h-5" />, soloContenido: true },
      { id: 'testimonios', label: 'Testimonios', icon: <MessageSquareQuote className="w-5 h-5" />, soloContenido: true },
      { id: 'legales', label: 'Páginas legales', icon: <Scale className="w-5 h-5" />, soloContenido: true },
    ],
  },
  {
    titulo: 'Posicionamiento',
    items: [
      { id: 'seo', label: 'SEO y redirecciones', icon: <Search className="w-5 h-5" />, soloContenido: true },
      { id: 'configuracion', label: 'Datos del consultorio', icon: <Settings className="w-5 h-5" />, soloContenido: true },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activa, darkMode, onToggleTheme }) => {
  const { usuario, puedeEditarContenido, cerrarSesion } = useAuth();
  const iniciales = (usuario?.nombreCompleto ?? 'U').replace(/^Dr\.?\s*/i, '').split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  return (
    <aside className="w-64 bg-white dark:bg-navy-900/90 border-r border-slate-200 dark:border-white/10 flex flex-col justify-between h-screen sticky top-0 shrink-0 transition-colors shadow-sm z-20">
      <div className="overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg shadow-medical-500/20 shrink-0 text-xs">
            CMS
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight truncate">Panel web</h1>
            <span className="text-[10px] text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-wider flex items-center gap-1 truncate">
              <ShieldCheck className="w-3 h-3 shrink-0 text-medical-500" /> Dr. Marcos E.
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-5">
          {GRUPOS.map((grupo) => {
            const items = grupo.items.filter((i) => !i.soloContenido || puedeEditarContenido);
            if (items.length === 0) return null;
            return (
              <div key={grupo.titulo} className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{grupo.titulo}</div>
                {items.map((item) => {
                  const activo = activa === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navegar(item.id)}
                      aria-current={activo ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        activo
                          ? 'bg-gradient-to-r from-medical-500 to-blue-600 text-white font-bold shadow-md shadow-medical-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={activo ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          <a
            href={WEB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-medical-600 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <ExternalLink className="w-5 h-5" /> Ver la web
          </a>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/40 space-y-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-medical-600" />}
          <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-medical-500/10 text-medical-600 dark:text-medical-400 flex items-center justify-center font-bold text-xs shrink-0">{iniciales}</div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{usuario?.nombreCompleto}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{usuario?.rol}</div>
            </div>
          </div>
          <button
            type="button"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={() => cerrarSesion()}
            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
