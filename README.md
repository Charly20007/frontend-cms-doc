# CMS – Dr. Juan Carlos Marcos Enriquez

Panel de administración (React + Vite + Tailwind) para gestionar la web y su SEO a través de la API .NET (`backend-doc`).

## Puesta en marcha

```bash
cp .env.example .env.local   # ajustar VITE_API_URL y VITE_WEB_URL si hace falta
npm install
npm run dev                  # http://localhost:5173
```

La API debe estar corriendo. Las credenciales de desarrollo están en la sección `AdminInicial`
de `backend-doc/Surgeon.WebAPI/appsettings.Development.local.json`.

## Módulos

| Sección | Qué permite | Roles |
|---|---|---|
| Resumen | Citas del día, pendientes y **Salud SEO** (páginas con título o descripción faltante o demasiado largos) | Todos |
| Agenda y citas | Ver solicitudes de la web y cambiar su estado | Todos |
| Procedimientos | Crear/editar la página de cada procedimiento: datos, contenido (introducción, síntomas, pasos, recuperación, preguntas frecuentes) y SEO | Administrador, Cirujano |
| Blog médico | Artículos (borrador, publicado o programado), categorías y SEO | Administrador, Cirujano |
| Testimonios | Publicar/ocultar, editar y relacionar con un procedimiento | Administrador, Cirujano |
| SEO y redirecciones | SEO de páginas fijas y redirecciones 301 | Administrador, Cirujano |
| Datos del consultorio | Datos del doctor, contacto, redes, Search Console, Analytics, horarios y contraseña | Administrador, Cirujano |

Al cambiar la URL (slug) de un procedimiento o artículo, la API crea automáticamente una redirección 301 desde la anterior.

## Estructura

```
src/
├── auth/          # Sesión (JWT en localStorage) y pantalla de login
├── components/
│   ├── seo/       # Editor SEO con vista previa de Google, campo de slug
│   └── ui/        # Formularios, avisos, listas editables
├── lib/           # Cliente API, tipos, enrutador por hash, utilidades SEO
└── modulos/       # Una carpeta por sección del menú
```
