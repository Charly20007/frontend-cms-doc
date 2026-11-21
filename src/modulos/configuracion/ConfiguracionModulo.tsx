import React, { useEffect, useState } from 'react';
import { Clock, Globe, KeyRound, MapPin, PanelBottom, Phone, Plus, Save, Share2, Trash2, UserRound } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { invalidarCaches } from '../../lib/datos';
import { WEB_URL } from '../../lib/router';
import { formatearTelefono } from '../../lib/texto';
import type { Configuracion, Horario } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, Interruptor, MensajeError, Selector } from '../../components/ui/Formulario';
import { SEO_LIMITES } from '../../lib/seo';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';
import { VistaCabecera, VistaGoogle, VistaPie, VistaPortada, VistaWhatsapp } from './VistasPrevias';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type Pestana = 'doctor' | 'contacto' | 'ubicacion' | 'horarios' | 'pie' | 'redes' | 'google' | 'cuenta';

const PESTANAS: { id: Pestana; texto: string; icono: React.ReactNode }[] = [
  { id: 'doctor', texto: 'Doctor', icono: <UserRound className="w-4 h-4" /> },
  { id: 'contacto', texto: 'Teléfonos', icono: <Phone className="w-4 h-4" /> },
  { id: 'ubicacion', texto: 'Ubicación', icono: <MapPin className="w-4 h-4" /> },
  { id: 'horarios', texto: 'Horarios', icono: <Clock className="w-4 h-4" /> },
  { id: 'pie', texto: 'Pie de página', icono: <PanelBottom className="w-4 h-4" /> },
  { id: 'redes', texto: 'Redes', icono: <Share2 className="w-4 h-4" /> },
  { id: 'google', texto: 'Google', icono: <Globe className="w-4 h-4" /> },
  { id: 'cuenta', texto: 'Mi contraseña', icono: <KeyRound className="w-4 h-4" /> },
];

/** Pestaña con los campos a la izquierda y la vista previa de la web a la derecha. */
const Disposicion: React.FC<{ intro: string; vista?: React.ReactNode; children: React.ReactNode }> = ({ intro, vista, children }) => (
  <div className={`grid grid-cols-1 gap-6 items-start ${vista ? '2xl:grid-cols-[minmax(0,1fr)_26rem]' : ''}`}>
    <section className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{intro}</p>
      {children}
    </section>
    {/* En pantallas angostas la vista previa va primero, para ver de qué parte de la web se trata */}
    {vista && <aside className="order-first 2xl:order-last space-y-5 2xl:sticky 2xl:top-40">{vista}</aside>}
  </div>
);

const VistaTelefono: React.FC<{ valor?: string | null }> = ({ valor }) =>
  valor ? <>Se verá así: <strong className="text-slate-700 dark:text-slate-200">{formatearTelefono(valor)}</strong></> : <>Ej.: +51 1 999 8887</>;

export const ConfiguracionModulo: React.FC = () => {
  const avisos = useAvisos();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sucio, setSucio] = useState(false);
  const [pestana, setPestana] = useState<Pestana>('doctor');

  const cargar = () => {
    setError(null);
    api.get<Configuracion>('/api/admin/configuracion')
      .then(({ data }) => { setConfig(data); setHorarios(data.horarios); setSucio(false); })
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar la configuración.')));
  };
  useEffect(cargar, []);

  useEffect(() => {
    if (!sucio) return;
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', alSalir);
    return () => window.removeEventListener('beforeunload', alSalir);
  }, [sucio]);

  if (error) return <MensajeError mensaje={error} reintentar={cargar} />;
  if (!config) return <LoadingFallback texto="Cargando datos del consultorio..." />;

  const cambiar = (c: Partial<Configuracion>) => { setConfig({ ...config, ...c }); setSucio(true); };
  const cambiarHorarios = (h: Horario[]) => { setHorarios(h); setSucio(true); };
  const campo = (clave: keyof Configuracion) => ({
    value: (config[clave] as string | null | undefined) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => cambiar({ [clave]: e.target.value } as Partial<Configuracion>),
  });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const malo = horarios.find((h) => h.horaFin <= h.horaInicio);
    if (malo) {
      setPestana('horarios');
      avisos.error(`El horario del ${DIAS[malo.diaSemana].toLowerCase()} termina antes de empezar.`);
      return;
    }
    setGuardando(true);
    // Los campos vacíos se envían como null para que la API no los valide como URL/teléfono
    const cuerpo = Object.fromEntries(Object.entries(config).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v]));
    try {
      const [{ data }, { data: nuevosHorarios }] = await Promise.all([
        api.put<Configuracion>('/api/admin/configuracion', { ...cuerpo, pais: config.pais || 'PE', siteUrl: config.siteUrl }),
        api.put<Horario[]>('/api/admin/configuracion/horarios', horarios),
      ]);
      setConfig(data);
      setHorarios(nuevosHorarios);
      setSucio(false);
      invalidarCaches();
      avisos.exito('Guardado. La web ya muestra los cambios.');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const foto = config.fotoDoctorUrl ? (config.fotoDoctorUrl.startsWith('http') ? config.fotoDoctorUrl : `${WEB_URL}${config.fotoDoctorUrl}`) : null;

  return (
    <div>
      {/* Encabezado fijo con guardar */}
      <div className="sticky top-0 z-10 -mx-6 lg:-mx-10 px-6 lg:px-10 pt-2 pb-4 bg-slate-50/95 dark:bg-navy-950/95 backdrop-blur border-b border-slate-200/70 dark:border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Datos del consultorio</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Mientras escribes, verás cómo queda en la web.</p>
          </div>
          {pestana !== 'cuenta' && (
            <div className="flex items-center gap-3">
              {sucio && <span className="text-xs font-semibold text-amber-600">Cambios sin guardar</span>}
              <Boton type="submit" form="form-configuracion" cargando={guardando} icono={<Save className="w-4 h-4" />}>Guardar cambios</Boton>
            </div>
          )}
        </div>

        <div role="tablist" aria-label="Secciones" className="mt-4 flex flex-wrap gap-1">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={pestana === p.id}
              onClick={() => setPestana(p.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                pestana === p.id
                  ? 'bg-white dark:bg-navy-800 text-medical-700 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white border border-transparent'
              }`}
            >
              {p.icono}
              {p.texto}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <form id="form-configuracion" onSubmit={guardar} hidden={pestana === 'cuenta'}>
          {pestana === 'doctor' && (
            <Disposicion intro="Cómo se presenta el doctor en la web y en Google." vista={<><VistaCabecera c={config} /><VistaPortada c={config} /></>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Campo etiqueta="Nombre completo" obligatorio maxLength={120} {...campo('nombreDoctor')} />
                <Campo etiqueta="Nombre corto" maxLength={60} {...campo('nombreCorto')} placeholder="Dr. Juan Marcos" ayuda="El que va junto al logo, arriba." />
                <Campo etiqueta="Especialidad" maxLength={150} {...campo('especialidad')} className="md:col-span-2" />
                <Campo etiqueta="CMP" maxLength={20} {...campo('cmp')} />
                <Campo etiqueta="RNE" maxLength={20} {...campo('rne')} />
                <div className="md:col-span-2 flex gap-4 items-start">
                  <div className="w-24 aspect-[4/5] shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                    {foto && <img src={foto} alt="Foto actual" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />}
                  </div>
                  <Campo
                    etiqueta="Foto principal del doctor"
                    maxLength={500}
                    {...campo('fotoDoctorUrl')}
                    className="flex-1"
                    placeholder="/imagenes/dr-juan-carlos-marcos-cirujano.jpg"
                    ayuda="La foto grande de la portada y del perfil. Ideal: retrato vertical, de buena calidad."
                  />
                </div>
              </div>
            </Disposicion>
          )}

          {pestana === 'contacto' && (
            <Disposicion intro="Escriba los números con código de país (+51). La web los muestra en el formato que conoce la gente." vista={<><VistaCabecera c={config} /><VistaWhatsapp c={config} /><VistaPie c={config} horarios={horarios} resaltar="contacto" /></>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Campo etiqueta="Teléfono principal" maxLength={30} {...campo('telefonoPrincipal')} ayuda={<VistaTelefono valor={config.telefonoPrincipal} />} />
                <Campo etiqueta="Teléfono secundario" maxLength={30} {...campo('telefonoSecundario')} ayuda={<VistaTelefono valor={config.telefonoSecundario} />} />
                <Campo etiqueta="WhatsApp" maxLength={30} {...campo('whatsApp')} placeholder="+51 987 654 321" ayuda="Si lo deja vacío, se usa el teléfono secundario (si es celular)." />
                <Campo etiqueta="Correo" type="email" maxLength={100} {...campo('correo')} />
              </div>
            </Disposicion>
          )}

          {pestana === 'ubicacion' && (
            <Disposicion intro="Use los mismos datos que en Google Maps / Google Business Profile: la coherencia ayuda a aparecer en búsquedas locales." vista={<VistaPie c={config} horarios={horarios} resaltar="contacto" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Campo etiqueta="Dirección" maxLength={200} {...campo('direccion')} className="md:col-span-3" ayuda="El mapa de la portada y de Contacto se ubica con esta dirección." />
                <Campo etiqueta="Distrito" maxLength={80} {...campo('distrito')} />
                <Campo etiqueta="Ciudad" maxLength={80} {...campo('ciudad')} />
                <Campo etiqueta="Región" maxLength={80} {...campo('region')} />
                <Campo etiqueta="Enlace de Google Maps" maxLength={1000} {...campo('googleMapsUrl')} className="md:col-span-3" placeholder="https://maps.app.goo.gl/..." ayuda="Para el botón «Cómo llegar». En Google Maps: Compartir → Copiar enlace." />
              </div>
            </Disposicion>
          )}

          {pestana === 'horarios' && (
            <Disposicion intro="Agregue un tramo por cada turno (por ejemplo, mañana y tarde). Los días con el mismo horario se agrupan solos." vista={<VistaPie c={config} horarios={horarios} resaltar="horarios" />}>
              <ul className="space-y-3">
                {horarios.map((h, i) => (
                  <li key={i} className="flex flex-wrap items-end gap-3">
                    <Selector etiqueta="Día" value={h.diaSemana} onChange={(e) => cambiarHorarios(horarios.map((x, j) => (j === i ? { ...x, diaSemana: Number(e.target.value) } : x)))} opciones={DIAS.slice(1).map((d, k) => ({ valor: k + 1, texto: d }))} className="w-40" />
                    <Campo etiqueta="Desde" type="time" value={h.horaInicio} onChange={(e) => cambiarHorarios(horarios.map((x, j) => (j === i ? { ...x, horaInicio: e.target.value } : x)))} className="w-32" />
                    <Campo etiqueta="Hasta" type="time" value={h.horaFin} onChange={(e) => cambiarHorarios(horarios.map((x, j) => (j === i ? { ...x, horaFin: e.target.value } : x)))} className="w-32" />
                    <button type="button" aria-label="Quitar tramo" onClick={() => cambiarHorarios(horarios.filter((_, j) => j !== i))} className="p-2.5 mb-0.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => cambiarHorarios([...horarios, { diaSemana: 1, horaInicio: '09:00', horaFin: '13:00' }])} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-medical-600 hover:underline cursor-pointer">
                <Plus className="w-4 h-4" /> Agregar tramo
              </button>
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                <Campo etiqueta="Seguros aliados" maxLength={200} {...campo('segurosAliados')} placeholder="Pacífico, Rímac, Mapfre..." ayuda="Aparecen en la franja de confianza de la portada y en el perfil del doctor." />
              </div>
            </Disposicion>
          )}

          {pestana === 'pie' && (
            <Disposicion intro="El pie de página aparece al final de todas las páginas." vista={<VistaPie c={config} horarios={horarios} resaltar="presentacion" />}>
              <div className="space-y-6">
                <AreaTexto etiqueta="Frase de presentación" maxLength={300} rows={2} {...campo('descripcionPie')} contador={{ actual: config.descripcionPie?.length ?? 0, recomendado: 160, maximo: 300 }} ayuda="Va bajo el nombre del doctor." />
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5 space-y-4">
                  <Interruptor
                    etiqueta="Mostrar aviso de emergencias"
                    descripcion="Actívelo solo si el doctor realmente atiende emergencias en ese horario: es una promesa al paciente."
                    activo={config.mostrarEmergencias}
                    onCambio={(v) => cambiar({ mostrarEmergencias: v })}
                  />
                  {config.mostrarEmergencias && (
                    <Campo etiqueta="Texto del aviso" maxLength={100} {...campo('textoEmergencias')} placeholder="Emergencias quirúrgicas: atención las 24 horas" ayuda="Se muestra en rojo en el pie de página y en Contacto." />
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Los enlaces legales del pie (privacidad, términos, consentimiento) se editan en <a href="#/legales" className="font-semibold text-medical-600 hover:underline">Páginas legales</a>.
                </p>
              </div>
            </Disposicion>
          )}

          {pestana === 'redes' && (
            <Disposicion intro="Opcional. Las redes que deje vacías no se muestran." vista={<VistaPie c={config} horarios={horarios} resaltar="redes" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Campo etiqueta="Facebook" maxLength={300} {...campo('facebookUrl')} placeholder="https://facebook.com/..." />
                <Campo etiqueta="Instagram" maxLength={300} {...campo('instagramUrl')} placeholder="https://instagram.com/..." />
                <Campo etiqueta="TikTok" maxLength={300} {...campo('tikTokUrl')} />
                <Campo etiqueta="YouTube" maxLength={300} {...campo('youTubeUrl')} />
                <Campo etiqueta="LinkedIn" maxLength={300} {...campo('linkedInUrl')} />
              </div>
            </Disposicion>
          )}

          {pestana === 'google' && (
            <Disposicion intro="Valores por defecto para Google y conexión con sus herramientas. El SEO de cada página se edita en «SEO y redirecciones»." vista={<VistaGoogle c={config} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Campo etiqueta="Título por defecto" maxLength={SEO_LIMITES.titulo.maximo} {...campo('metaTituloPorDefecto')} contador={{ actual: config.metaTituloPorDefecto?.length ?? 0, ...SEO_LIMITES.titulo }} className="md:col-span-2" />
                <AreaTexto etiqueta="Descripción por defecto" maxLength={SEO_LIMITES.descripcion.maximo} {...campo('metaDescripcionPorDefecto')} contador={{ actual: config.metaDescripcionPorDefecto?.length ?? 0, ...SEO_LIMITES.descripcion }} className="md:col-span-2" />
                <Campo etiqueta="Dirección del sitio" obligatorio maxLength={200} {...campo('siteUrl')} placeholder="https://cirujanogeneral.pe" ayuda="Dominio definitivo, con https://." />
                <Campo etiqueta="Imagen al compartir (URL)" maxLength={500} {...campo('imagenOgPorDefectoUrl')} ayuda="Al compartir un enlace por WhatsApp o Facebook." />
                <Campo etiqueta="Código de Google Search Console" maxLength={100} {...campo('googleSiteVerification')} ayuda="Solo el código que va en content=… del meta «google-site-verification»." />
                <Campo etiqueta="ID de Google Analytics 4" maxLength={30} {...campo('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" ayuda="Activa las estadísticas de visitas." />
              </div>
            </Disposicion>
          )}
        </form>

        {pestana === 'cuenta' && <CambiarPassword />}
      </div>
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
    <Disposicion intro="Contraseña de su usuario del CMS. Mínimo 10 caracteres. No aparece en la web.">
      <form onSubmit={enviar} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end max-w-3xl">
        <Campo etiqueta="Contraseña actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} obligatorio />
        <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" minLength={10} value={nueva} onChange={(e) => setNueva(e.target.value)} obligatorio />
        <Campo etiqueta="Repetir nueva" type="password" autoComplete="new-password" minLength={10} value={repetir} onChange={(e) => setRepetir(e.target.value)} obligatorio />
        <div className="md:col-span-3">
          <Boton type="submit" cargando={guardando} icono={<KeyRound className="w-4 h-4" />}>Cambiar contraseña</Boton>
        </div>
      </form>
    </Disposicion>
  );
};
