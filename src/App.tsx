import React, { Suspense, useEffect, useState } from 'react';
import { Sidebar, type Seccion } from './components/Sidebar';
import { LoadingFallback } from './components/LoadingFallback';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { AvisosProvider } from './components/ui/Avisos';
import { navegar, useRuta } from './lib/router';
import { Dashboard } from './modulos/dashboard/Dashboard';

// Carga diferida de los módulos para reducir el tamaño inicial del CMS
const CitasModulo = React.lazy(() => import('./modulos/citas/CitasModulo').then((m) => ({ default: m.CitasModulo })));
const ProcedimientosLista = React.lazy(() => import('./modulos/procedimientos/ProcedimientosLista').then((m) => ({ default: m.ProcedimientosLista })));
const ProcedimientoEditor = React.lazy(() => import('./modulos/procedimientos/ProcedimientoEditor').then((m) => ({ default: m.ProcedimientoEditor })));
const BlogLista = React.lazy(() => import('./modulos/blog/BlogLista').then((m) => ({ default: m.BlogLista })));
const ArticuloEditor = React.lazy(() => import('./modulos/blog/ArticuloEditor').then((m) => ({ default: m.ArticuloEditor })));
const TestimoniosModulo = React.lazy(() => import('./modulos/testimonios/TestimoniosModulo').then((m) => ({ default: m.TestimoniosModulo })));
const SeoModulo = React.lazy(() => import('./modulos/seo/SeoModulo').then((m) => ({ default: m.SeoModulo })));
const ConfiguracionModulo = React.lazy(() => import('./modulos/configuracion/ConfiguracionModulo').then((m) => ({ default: m.ConfiguracionModulo })));

const SECCIONES: Seccion[] = ['dashboard', 'citas', 'procedimientos', 'blog', 'testimonios', 'seo', 'configuracion'];
const SOLO_CONTENIDO: Seccion[] = ['procedimientos', 'blog', 'testimonios', 'seo', 'configuracion'];

function useTema() {
  const [oscuro, setOscuro] = useState<boolean>(() => {
    try {
      const guardado = localStorage.getItem('cms.tema');
      return guardado ? guardado === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro);
    try { localStorage.setItem('cms.tema', oscuro ? 'oscuro' : 'claro'); } catch { /* sin almacenamiento */ }
  }, [oscuro]);
  return [oscuro, () => setOscuro((v) => !v)] as const;
}

const Contenido: React.FC = () => {
  const { usuario, puedeEditarContenido } = useAuth();
  const [oscuro, alternarTema] = useTema();
  const [seccionRuta, idRuta] = useRuta();

  const seccion: Seccion = SECCIONES.includes(seccionRuta as Seccion) ? (seccionRuta as Seccion) : 'dashboard';
  const permitida = puedeEditarContenido || !SOLO_CONTENIDO.includes(seccion);
  const id = idRuta && idRuta !== 'nuevo' ? Number(idRuta) : null;

  useEffect(() => {
    if (!permitida) navegar('dashboard');
  }, [permitida]);

  if (!usuario) return <LoginPage />;

  const modulo = (() => {
    if (!permitida) return null;
    switch (seccion) {
      case 'citas': return <CitasModulo />;
      case 'procedimientos': return idRuta ? <ProcedimientoEditor key={idRuta} id={id} /> : <ProcedimientosLista />;
      case 'blog': return idRuta ? <ArticuloEditor key={idRuta} id={id} /> : <BlogLista />;
      case 'testimonios': return <TestimoniosModulo />;
      case 'seo': return <SeoModulo />;
      case 'configuracion': return <ConfiguracionModulo />;
      default: return <Dashboard />;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex selection:bg-medical-500 selection:text-white">
      <Sidebar activa={seccion} darkMode={oscuro} onToggleTheme={alternarTema} />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<LoadingFallback />}>{modulo}</Suspense>
        </div>
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AvisosProvider>
        <Contenido />
      </AvisosProvider>
    </AuthProvider>
  );
}

export default App;
