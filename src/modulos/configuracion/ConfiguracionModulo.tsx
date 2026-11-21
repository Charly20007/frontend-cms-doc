import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Save, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { invalidarCaches } from '../../lib/datos';
import type { Configuracion, Horario } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, EncabezadoPagina, MensajeError, Panel, Selector } from '../../components/ui/Formulario';
import { SEO_LIMITES } from '../../lib/seo';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ConfiguracionModulo: React.FC = () => {
  const avisos = useAvisos();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);

  const cargar = () => {
    setError(null);
    api.get<Configuracion>('/api/admin/configuracion')
      .then(({ data }) => { setConfig(data); setHorarios(data.horarios); })
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar la configuración.')));
  };
  useEffect(cargar, []);

  if (error) return <MensajeError mensaje={error} reintentar={cargar} />;
  if (!config) return <LoadingFallback texto="Cargando datos del consultorio..." />;

  const campo = (clave: keyof Configuracion) => ({
    value: (config[clave] as string | null | undefined) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setConfig({ ...config, [clave]: e.target.value }),
  });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    // Los campos vacíos se envían como null para que la API no los valide como URL/teléfono
    const cuerpo = Object.fromEntries(Object.entries(config).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v]));
    try {
      const { data } = await api.put<Configuracion>('/api/admin/configuracion', { ...cuerpo, pais: config.pais || 'PE', siteUrl: config.siteUrl });
      setConfig(data);
      invalidarCaches();
      avisos.exito('Datos del consultorio guardados.');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const guardarHorarios = async () => {
    setGuardandoHorarios(true);
    try {
      const { data } = await api.put<Horario[]>('/api/admin/configuracion/horarios', horarios);
      setHorarios(data);
      avisos.exito('Horarios guardados.');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudieron guardar los horarios.'));
    } finally {
      setGuardandoHorarios(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={guardar} className="space-y-6">
        <EncabezadoPagina
          titulo="Datos del consultorio"
          descripcion="Se muestran en toda la web (cabecera, pie de página, contacto) y en los datos que lee Google."
          acciones={<Boton type="submit" cargando={guardando} icono={<Save className="w-4 h-4" />}>Guardar cambios</Boton>}
        />

        <Panel titulo="Doctor">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo etiqueta="Nombre completo" obligatorio maxLength={120} {...campo('nombreDoctor')} />
            <Campo etiqueta="Nombre corto" maxLength={60} {...campo('nombreCorto')} placeholder="Dr. Juan Marcos" />
            <Campo etiqueta="Especialidad" maxLength={150} {...campo('especialidad')} className="md:col-span-2" />
            <Campo etiqueta="CMP" maxLength={20} {...campo('cmp')} />
            <Campo etiqueta="RNE" maxLength={20} {...campo('rne')} />
            <Campo etiqueta="Foto del doctor (URL)" maxLength={500} {...campo('fotoDoctorUrl')} />
            <Campo etiqueta="Seguros aliados" maxLength={200} {...campo('segurosAliados')} placeholder="Pacífico, Rímac, Mapfre..." />
          </div>
        </Panel>

        <Panel titulo="Contacto y ubicación" descripcion="Use los mismos datos que en Google Business Profile: la coherencia ayuda al SEO local.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Campo etiqueta="Teléfono principal" maxLength={30} {...campo('telefonoPrincipal')} placeholder="+51 1 999 8887" />
            <Campo etiqueta="Teléfono secundario" maxLength={30} {...campo('telefonoSecundario')} />
            <Campo etiqueta="WhatsApp" maxLength={30} {...campo('whatsApp')} placeholder="+51 987 654 321" />
            <Campo etiqueta="Correo" type="email" maxLength={100} {...campo('correo')} />
            <Campo etiqueta="Dirección" maxLength={200} {...campo('direccion')} className="md:col-span-2" />
            <Campo etiqueta="Distrito" maxLength={80} {...campo('distrito')} />
            <Campo etiqueta="Ciudad" maxLength={80} {...campo('ciudad')} />
            <Campo etiqueta="Región" maxLength={80} {...campo('region')} />
            <Campo etiqueta="Enlace de Google Maps" maxLength={1000} {...campo('googleMapsUrl')} className="md:col-span-3" placeholder="https://maps.app.goo.gl/..." />
          </div>
        </Panel>

        <Panel titulo="Redes sociales" descripcion="Opcional. Google las asocia al perfil del doctor.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo etiqueta="Facebook" maxLength={300} {...campo('facebookUrl')} placeholder="https://facebook.com/..." />
            <Campo etiqueta="Instagram" maxLength={300} {...campo('instagramUrl')} placeholder="https://instagram.com/..." />
            <Campo etiqueta="TikTok" maxLength={300} {...campo('tikTokUrl')} />
            <Campo etiqueta="YouTube" maxLength={300} {...campo('youTubeUrl')} />
            <Campo etiqueta="LinkedIn" maxLength={300} {...campo('linkedInUrl')} />
          </div>
        </Panel>

        <Panel titulo="SEO general y herramientas de Google">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo etiqueta="Dirección del sitio" obligatorio maxLength={200} {...campo('siteUrl')} placeholder="https://cirujanogeneral.pe" ayuda="Dominio definitivo, con https://." />
            <Campo etiqueta="Imagen por defecto para redes (URL)" maxLength={500} {...campo('imagenOgPorDefectoUrl')} />
            <Campo etiqueta="Título por defecto" maxLength={SEO_LIMITES.titulo.maximo} {...campo('metaTituloPorDefecto')} contador={{ actual: config.metaTituloPorDefecto?.length ?? 0, ...SEO_LIMITES.titulo }} className="md:col-span-2" />
            <AreaTexto etiqueta="Descripción por defecto" maxLength={SEO_LIMITES.descripcion.maximo} {...campo('metaDescripcionPorDefecto')} contador={{ actual: config.metaDescripcionPorDefecto?.length ?? 0, ...SEO_LIMITES.descripcion }} className="md:col-span-2" />
            <Campo etiqueta="Verificación de Google Search Console" maxLength={100} {...campo('googleSiteVerification')} ayuda="Pegue solo el código del meta «google-site-verification» (content=...)." />
            <Campo etiqueta="ID de Google Analytics 4" maxLength={30} {...campo('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" />
          </div>
        </Panel>
      </form>

      <Panel
        titulo="Horarios de atención"
        descripcion="Puede agregar varios tramos por día (ej. mañana y tarde)."
        acciones={<Boton cargando={guardandoHorarios} icono={<Save className="w-4 h-4" />} onClick={guardarHorarios}>Guardar horarios</Boton>}
      >
        <ul className="space-y-2">
          {horarios.map((h, i) => (
            <li key={i} className="flex flex-wrap items-end gap-3">
              <Selector etiqueta="Día" value={h.diaSemana} onChange={(e) => setHorarios(horarios.map((x, j) => (j === i ? { ...x, diaSemana: Number(e.target.value) } : x)))} opciones={DIAS.slice(1).map((d, k) => ({ valor: k + 1, texto: d }))} className="w-40" />
              <Campo etiqueta="Desde" type="time" value={h.horaInicio} onChange={(e) => setHorarios(horarios.map((x, j) => (j === i ? { ...x, horaInicio: e.target.value } : x)))} className="w-32" />
              <Campo etiqueta="Hasta" type="time" value={h.horaFin} onChange={(e) => setHorarios(horarios.map((x, j) => (j === i ? { ...x, horaFin: e.target.value } : x)))} className="w-32" />
              <button type="button" aria-label="Quitar tramo" onClick={() => setHorarios(horarios.filter((_, j) => j !== i))} className="p-2.5 mb-0.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setHorarios([...horarios, { diaSemana: 1, horaInicio: '09:00', horaFin: '13:00' }])} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 hover:underline cursor-pointer">
          <Plus className="w-4 h-4" /> Agregar tramo
        </button>
      </Panel>

      <CambiarPassword />
    </div>
  );
};

const CambiarPassword: React.FC = () => {
  const avisos = useAvisos();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nueva !== repetir) return avisos.error('Las contraseñas nuevas no coinciden.');
    setGuardando(true);
    try {
      await api.put('/api/auth/password', { passwordActual: actual, passwordNueva: nueva });
      avisos.exito('Contraseña actualizada.');
      setActual(''); setNueva(''); setRepetir('');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo cambiar la contraseña.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Panel titulo="Mi contraseña" descripcion="Mínimo 10 caracteres.">
      <form onSubmit={enviar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <Campo etiqueta="Contraseña actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} obligatorio />
        <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" minLength={10} value={nueva} onChange={(e) => setNueva(e.target.value)} obligatorio />
        <Campo etiqueta="Repetir nueva" type="password" autoComplete="new-password" minLength={10} value={repetir} onChange={(e) => setRepetir(e.target.value)} obligatorio />
        <Boton type="submit" cargando={guardando} icono={<KeyRound className="w-4 h-4" />}>Cambiar</Boton>
      </form>
    </Panel>
  );
};
