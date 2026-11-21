import type { Seo } from './tipos';

// Google suele mostrar ~60 caracteres de título y ~160 de descripción
export const SEO_LIMITES = {
  titulo: { recomendado: 60, maximo: 70 },
  descripcion: { recomendado: 160, maximo: 170 },
};

/** Problemas de SEO de una página, para listas y el dashboard. */
export function revisarSeo(seo: Seo): { nivel: 'ok' | 'aviso' | 'error'; problemas: string[] } {
  const problemas: string[] = [];
  const t = seo.metaTitulo?.trim().length ?? 0;
  const d = seo.metaDescripcion?.trim().length ?? 0;
  if (t === 0) problemas.push('Sin meta título');
  else if (t > SEO_LIMITES.titulo.recomendado) problemas.push('Título largo: Google lo cortará');
  else if (t < 25) problemas.push('Título muy corto');
  if (d === 0) problemas.push('Sin meta descripción');
  else if (d > SEO_LIMITES.descripcion.recomendado) problemas.push('Descripción larga: Google la cortará');
  else if (d < 70) problemas.push('Descripción muy corta');
  const nivel = problemas.length === 0 ? 'ok' : t === 0 || d === 0 ? 'error' : 'aviso';
  return { nivel, problemas };
}
