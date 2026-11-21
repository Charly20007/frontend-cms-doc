import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import { mensajeError } from '../lib/api';
import { Boton, Campo } from '../components/ui/Formulario';

export const LoginPage: React.FC = () => {
  const { iniciarSesion, motivoCierre } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      await iniciarSesion(correo, password);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesión.'));
      setPassword('');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-medical-50 dark:from-navy-950 dark:to-navy-900">
      <form onSubmit={enviar} className="w-full max-w-sm bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-medical-500 to-blue-700 flex items-center justify-center shadow-lg shadow-medical-500/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">Panel de administración</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dr. Juan Carlos Marcos Enriquez</p>
        </div>

        {(error || motivoCierre) && (
          <div role="alert" className={`p-3 rounded-xl text-xs font-medium border ${error ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'}`}>
            {error ?? motivoCierre}
          </div>
        )}

        <div className="relative">
          <Campo etiqueta="Correo" type="email" autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} obligatorio className="[&_input]:pl-9" />
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-[2.15rem]" />
        </div>
        <div className="relative">
          <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} obligatorio className="[&_input]:pl-9" />
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-[2.15rem]" />
        </div>

        <Boton type="submit" cargando={cargando} className="w-full">Ingresar</Boton>
      </form>
    </div>
  );
};
