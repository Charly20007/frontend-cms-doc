// Tipos que reflejan los DTOs de la API .NET (backend-doc/Surgeon.Application/DTOs)

export type Rol = 'Administrador' | 'Cirujano' | 'Secretaria';

export interface UsuarioActual {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: Rol | string;
}

export interface LoginRespuesta {
  token: string;
  expiraEn: string;
  usuario: UsuarioActual;
}

export interface Seo {
  metaTitulo?: string | null;
  metaDescripcion?: string | null;
  imagenOgUrl?: string | null;
  indexable: boolean;
}

export interface ContenidoItem {
  titulo?: string | null;
  texto: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  nombreCorto?: string | null;
  slug: string;
  resumen: string;
  descripcionDetallada?: string | null;
  tiempoEstimadoMinutos: number;
  precioReferencial?: number | null;
  icono?: string | null;
  idEspecialidad: number;
  especialidadNombre: string;
  destacadoEnWeb: boolean;
  orden: number;
  indexable: boolean;
  fechaModificacion: string;
}

export interface ServicioDetalle extends Servicio {
  condicionTratada?: string | null;
  tituloIndicaciones?: string | null;
  seo: Seo;
  introduccion: ContenidoItem[];
  indicaciones: ContenidoItem[];
  pasos: ContenidoItem[];
  recuperacion: ContenidoItem[];
  preguntas: ContenidoItem[];
}

export interface ServicioGuardar {
  nombre: string;
  nombreCorto?: string | null;
  slug?: string | null;
  resumen: string;
  descripcionDetallada?: string | null;
  tiempoEstimadoMinutos: number;
  precioReferencial?: number | null;
  icono?: string | null;
  idEspecialidad: number;
  destacadoEnWeb: boolean;
  orden: number;
  condicionTratada?: string | null;
  tituloIndicaciones?: string | null;
  seo: Seo;
  introduccion: ContenidoItem[];
  indicaciones: ContenidoItem[];
  pasos: ContenidoItem[];
  recuperacion: ContenidoItem[];
  preguntas: ContenidoItem[];
}

export interface CategoriaBlog {
  id: number;
  nombre: string;
  slug: string;
}

export interface Articulo {
  id: number;
  titulo: string;
  slug: string;
  resumen: string;
  contenidoHtml: string;
  imagenPortadaUrl?: string | null;
  categoria: CategoriaBlog;
  servicioRelacionado?: { id: number; nombre: string; slug: string } | null;
  fechaPublicacion: string;
  fechaModificacion: string;
  autor: string;
  tiempoLectura: number;
  vistas: number;
  publicadoEnWeb: boolean;
  seo: Seo;
}

export interface ArticuloGuardar {
  titulo: string;
  slug?: string | null;
  resumen: string;
  contenidoHtml: string;
  imagenPortadaUrl?: string | null;
  idCategoria: number;
  idServicioMedico?: number | null;
  autor?: string | null;
  tiempoLecturaMinutos?: number | null;
  fechaPublicacion?: string | null;
  publicadoEnWeb: boolean;
  seo: Seo;
}

export interface Testimonio {
  id: number;
  nombrePaciente: string;
  procedimiento: string;
  idServicioMedico?: number | null;
  procedimientoSlug?: string | null;
  calificacionEstrellas: number;
  comentario: string;
  fechaTestimonio: string;
  aprobadoParaWeb: boolean;
  /** Lo envió un paciente desde la web */
  enviadoDesdeWeb?: boolean;
  /** Enviado desde la web y aún sin revisar */
  pendienteRevision?: boolean;
  autorizaPublicacion?: boolean;
  /** Teléfono o correo del paciente para verificarlo. Nunca se publica. */
  contactoPaciente?: string | null;
}

export type TestimonioGuardar = Pick<Testimonio, 'nombrePaciente' | 'procedimiento' | 'idServicioMedico' | 'calificacionEstrellas' | 'comentario' | 'aprobadoParaWeb'> & { fechaTestimonio?: string | null };

export interface PaginaSeo {
  id: number;
  clave: string;
  ruta: string;
  nombrePagina: string;
  seo: Seo;
  fechaModificacion: string;
}

export interface Redireccion {
  id: number;
  rutaOrigen: string;
  rutaDestino: string;
  esPermanente: boolean;
  activa: boolean;
  nota?: string | null;
}

export type RedireccionGuardar = Omit<Redireccion, 'id'>;

export interface Horario {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface Configuracion {
  nombreDoctor: string;
  nombreCorto?: string | null;
  especialidad?: string | null;
  cmp?: string | null;
  rne?: string | null;
  fotoDoctorUrl?: string | null;
  segurosAliados?: string | null;
  telefonoPrincipal?: string | null;
  telefonoSecundario?: string | null;
  whatsApp?: string | null;
  correo?: string | null;
  direccion?: string | null;
  distrito?: string | null;
  ciudad?: string | null;
  region?: string | null;
  pais: string;
  googleMapsUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tikTokUrl?: string | null;
  youTubeUrl?: string | null;
  linkedInUrl?: string | null;
  siteUrl: string;
  metaTituloPorDefecto?: string | null;
  metaDescripcionPorDefecto?: string | null;
  imagenOgPorDefectoUrl?: string | null;
  googleSiteVerification?: string | null;
  googleAnalyticsId?: string | null;
  descripcionPie?: string | null;
  mostrarEmergencias: boolean;
  textoEmergencias?: string | null;
  reservasOnlineActivas: boolean;
  duracionTurnoMinutos: number;
  anticipacionMinimaHoras: number;
  diasMaximosReserva: number;
  horarios: Horario[];
}

export interface PaginaLegalResumen {
  clave: string;
  ruta: string;
  titulo: string;
  publicada: boolean;
  fechaModificacion: string;
}

export interface PaginaLegal extends PaginaLegalResumen {
  contenidoHtml: string;
  seo: Seo;
}

export interface Cita {
  id: number;
  pacienteNombreCompleto: string;
  pacienteTelefono?: string | null;
  pacienteCorreo?: string | null;
  servicioMedicoNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estadoCitaNombre: string;
  estadoColorHex: string;
  motivoConsulta?: string | null;
}

export interface ItemCatalogo {
  id: number;
  nombre: string;
  extra?: string | null;
}

export interface Catalogos {
  especialidades: ItemCatalogo[];
  categoriasBlog: ItemCatalogo[];
  estadosCita: ItemCatalogo[];
  servicios: ItemCatalogo[];
}

export interface Bloqueo {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
}
