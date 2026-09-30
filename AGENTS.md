# AGENTS.md — Vivero Rosa

Reglas **no negociables** que todo agente de IA debe seguir al trabajar en este proyecto.

---

## 1. Identidad del proyecto

| Campo | Valor |
|---|---|
| Nombre | **Vivero Rosa** |
| Dominio | Vivero / jardinería / paisajismo en **República Dominicana** |
| Idioma de la UI | **Español** — todo texto visible al usuario final debe estar en español. Comentarios en código pueden estar en inglés o español, pero los existentes no se tocan. |
| Público meta | Clientes dominicanos que buscan plantas, diseño de jardines e inspecciones de espacios. |

---

## 2. Stack tecnológico — No cambiar

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | **React** (JSX, no TSX) | 19 |
| Build | **Vite** + `@vitejs/plugin-react` | Vite 8 |
| Router | **react-router-dom** | 7 |
| Backend / Auth / Storage | **Supabase** (`@supabase/supabase-js`) | 2 |
| Iconos | **lucide-react** | — |
| Estilos | **Vanilla CSS** (un solo archivo `index.css`) | — |
| Tipografías | **Playfair Display** (display) + **DM Sans** (body) via Google Fonts | — |

### Prohibiciones explícitas

- ❌ **No instalar** Tailwind CSS, Chakra UI, Material UI, Styled Components, ni ningún framework CSS.
- ❌ **No instalar** TypeScript como dependencia de build; el proyecto usa `.jsx` y `.js`.
- ❌ **No migrar** de Vite a Next.js, Webpack, ni ningún otro bundler.
- ❌ **No reemplazar** Supabase con Firebase, Prisma, o cualquier otro backend.
- ❌ **No instalar** state managers externos (Redux, Zustand, Jotai). Se usa `useState` + Context API.
- ❌ **No agregar** dependencias nuevas sin aprobación explícita del usuario.

---

## 3. Estructura de archivos — Respetar

```
vivero-rosa/
├── index.html                  # Entry HTML (single-line, lang="es")
├── vite.config.js              # Config mínima de Vite
├── package.json                # Solo dependencias esenciales
├── .env.local                  # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── .gitignore                  # .env*, node_modules/, dist/, .next/, etc.
├── supabase/
│   └── setup.sql               # Schema + RLS policies + storage bucket
├── public/                     # Assets estáticos (iconos, placeholders)
├── components/
│   └── ui/                     # Componentes shadcn (legacy, no usar activamente)
├── src/
│   ├── main.jsx                # Entry point (StrictMode + createRoot)
│   ├── App.jsx                 # TODA la lógica de componentes + rutas
│   ├── index.css               # TODOS los estilos (~2000+ líneas)
│   ├── context/
│   │   └── AuthContext.jsx     # Provider de autenticación con Supabase
│   ├── data/
│   │   └── content.js          # defaultContent + fetchContent/saveContent/uploadSiteImage
│   └── lib/
│       └── supabase.js         # createClient + isSupabaseConfigured
```

### Reglas de estructura

1. **App.jsx es monolítico a propósito.** Todos los componentes de página (`Navbar`, `Hero`, `Services`, `Gallery`, `About`, `Testimonials`, `Steps`, `Contact`, `Footer`, `InspectionForm`, `Admin`, `Login`) viven ahí. **No separar en archivos** salvo que el usuario lo solicite explícitamente.
2. **index.css es el único archivo de estilos.** No crear archivos CSS adicionales, CSS modules, ni estilos inline significativos.
3. **content.js** contiene el `defaultContent` como fallback y las funciones de CRUD hacia Supabase. No mover esa lógica a otro lugar.
4. **No crear** carpetas `pages/`, `hooks/`, `components/` (fuera de la existente), ni reestructurar sin permiso.

---

## 4. Sistema de diseño — Design Tokens

Todos los estilos **deben** usar las CSS custom properties definidas en `:root`. Nunca usar colores hardcodeados fuera de `index.css`.

### Paleta (Botanical Editorial)

| Token | Valor | Uso |
|---|---|---|
| `--tierra` | `#2c1810` | Texto principal, headings |
| `--bosque` | `#1a3a2a` | Sección About, navbar logo, acentos oscuros |
| `--arena` | `#f4efe6` | Fondo principal de la página |
| `--musgo` | `#8b9a6b` | Acentos verdes suaves, números de servicio |
| `--arcilla` | `#c4836a` | Itálicas en headings, acentos cálidos |
| `--crema` | `#faf8f3` | Fondo alternativo (servicios, testimonios) |
| `--ink` | `#2c1810` | Color de texto base (= tierra) |
| `--muted` | `#7a6e63` | Texto secundario |
| `--line` | `#e2ddd4` | Bordes y separadores |

### Liquid Glass

| Token | Propósito |
|---|---|
| `--glass-bg` | Fondo del glassmorphism claro |
| `--glass-bg-dark` | Fondo del glassmorphism oscuro |
| `--glass-blur` | `blur(22px) saturate(180%)` |
| `--glass-border` | Borde translúcido claro |
| `--glass-border-dark` | Borde translúcido oscuro |
| `--glass-shadow` | Sombra suave |
| `--glass-specular` | Gradiente especular de brillo |

### Tipografía

| Token | Familia | Uso |
|---|---|---|
| `--font-display` | `'Playfair Display', serif` | Headings, títulos grandes, itálicas editoriales |
| `--font-body` | `'DM Sans', sans-serif` | Cuerpo, labels, botones, navegación |

### Animaciones

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Transiciones suaves (reveal, hover) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Efectos rebote (botones) |

---

## 5. Patrones de código — Obligatorios

### Custom Hooks

- **`useScrollReveal()`** — IntersectionObserver que agrega `.visible` a elementos con clase `.reveal` o `.reveal-line`. Todos los componentes de sección lo usan.
- **`useNavHide()`** — Oculta la navbar al hacer scroll hacia abajo.
- **`ScrollToTop`** — Componente que scrollea arriba al cambiar de ruta.

### Patrón de animación scroll-reveal

```jsx
// Siempre seguir este patrón para secciones animadas:
function MiSeccion() {
  const ref = useScrollReveal()
  return (
    <section ref={ref}>
      <h2 className="reveal">...</h2>       {/* Se anima al entrar en viewport */}
      <div className="reveal" style={{ transitionDelay: '0.1s' }}>...</div>
    </section>
  )
}
```

### Contenido dinámico

```
defaultContent (hardcoded) → fetchContent() carga desde Supabase → si falla, usa defaultContent
```

- El contenido se carga con `fetchContent()` en el `useEffect` de cada página.
- El admin lo edita y lo guarda con `saveContent()`.
- Las imágenes se suben al bucket `site-images` con `uploadSiteImage()`.
- **Siempre** usar `defaultContent` como fallback. Nunca asumir que Supabase estará disponible.

### Autenticación

- `AuthProvider` envuelve toda la app.
- `useAuth()` retorna `{ session, loading, configured }`.
- `configured` indica si las variables de entorno de Supabase están presentes.
- `Protected` component redirige a `/admin/login` si no hay sesión.
- Login usa `signInWithPassword` — no hay registro público.

---

## 6. Rutas — No modificar sin permiso

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `PublicPage` | Público |
| `/solicitar` | `InspectionForm` | Público |
| `/admin/login` | `Login` | Público |
| `/admin` | `Admin` (protegido) | Solo autenticado |
| `*` | Redirect a `/` | — |

---

## 7. Supabase — Configuración sagrada

### Variables de entorno

```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- Prefijo `VITE_` obligatorio para que Vite las exponga.
- **Nunca** commitear `.env.local` (está en `.gitignore`).
- **Nunca** hardcodear claves de Supabase en el código fuente.

### Base de datos

- Tabla: `site_content` (id TEXT PK, data JSONB, updated_at TIMESTAMPTZ).
- RLS: lectura pública, escritura solo `authenticated`.
- No crear tablas adicionales sin aprobación.

### Storage

- Bucket: `site-images` (público para lectura).
- Upload solo para usuarios autenticados.
- Límite: 6 MB por imagen (`MAX_IMAGE_BYTES`).
- Path: `{folder}/{timestamp}-{uuid}.{ext}`.

---

## 8. Estética y UX — Principios inviolables

1. **Editorial & Premium.** El diseño es estilo editorial/revista de alta gama. No "landing page genérica".
2. **Liquid Glass.** El glassmorphism (backdrop-filter + bordes translúcidos + specular highlight) es un pilar del diseño. Usarlo en navbars, filtros, captions, stamps.
3. **Tipografía grande.** Los headings usan `Playfair Display` con `font-size: clamp(...)`, `letter-spacing` negativo, e itálicas `<em>` para énfasis.
4. **Animaciones suaves.** Cada sección se revela con scroll (`useScrollReveal`). Las transiciones usan `--ease-out` y `--ease-spring`. No usar `ease`, `linear`, ni duraciones menores a 300ms.
5. **Paleta botánica.** Tonos tierra, verde bosque, arena, musgo, arcilla. Nunca usar azul eléctrico, rojo puro, o colores que no armonicen con la paleta natural.
6. **Espaciado generoso.** Secciones con `padding: 140px 8vw 120px`. No comprimir el layout.
7. **Imágenes Unsplash.** Las imágenes por defecto vienen de Unsplash con parámetros `auto=format&fit=crop`. Mantener esa convención para placeholder.
8. **Mobile-first responsivo.** Hay breakpoints en `@media (max-width: 900px)` y `(max-width: 600px)`. Todo nuevo componente debe ser responsivo.

---

## 9. Formulario de inspección

- El formulario `/solicitar` **envía por WhatsApp**, no por email ni API.
- El mensaje se formatea con emojis y markdown de WhatsApp (`*bold*`).
- El número de teléfono se toma de `content.phone`.
- Las provincias son las **32 provincias de República Dominicana** (`PROVINCIAS_RD`).
- Validación: se requiere `spaceType`, al menos un `service`, `city`, y `name`.

---

## 10. Admin Panel

- Ruta: `/admin` (protegido), login en `/admin/login`.
- El admin puede editar: marca, portada, contacto, nosotros, servicios, galería.
- Las imágenes se suben directamente al bucket de Supabase.
- El botón "Restablecer contenido original" resetea todo a `defaultContent`.
- **No agregar** funcionalidad de registro de usuarios. Rosa es la única admin.

---

## 11. Reglas de calidad

1. **No romper lo existente.** Antes de modificar `App.jsx` o `index.css`, entender la estructura completa.
2. **Probar que compila.** Correr `npm run build` o `npm run dev` para verificar que no hay errores.
3. **No borrar comentarios.** Los separadores `/* ─── Sección ─── */` en el código son intencionales y ayudan a navegar. Preservarlos.
4. **No duplicar estilos.** Reusar tokens y clases existentes. Revisar `index.css` antes de agregar CSS nuevo.
5. **Mantener el peso ligero.** El proyecto tiene solo 5 dependencias de producción. Eso es a propósito.
6. **Accessibility.** Mantener `aria-label` en botones de ícono, `alt` en todas las imágenes, y `lang="es"` en el HTML.
7. **Contenido en español.** Botones, labels, mensajes de error, placeholders — todo en español.

---

## 12. Git & Deploy

- **No commitear**: `.env.local`, `node_modules/`, `dist/`, `.next/`, `.cursor/`.
- El `.gitignore` ya cubre estos. No modificarlo salvo para agregar más exclusiones.
- El deploy se hace como SPA estática (Vite build). El output va a `dist/`.

---

## 13. Resumen rápido para agentes

> **Antes de escribir cualquier línea de código:**
>
> 1. Lee `App.jsx` para entender la estructura de componentes.
> 2. Lee `index.css` para entender el sistema de diseño.
> 3. Lee `content.js` para entender el modelo de datos.
> 4. Lee `supabase.js` y `AuthContext.jsx` para entender la autenticación.
> 5. No instales dependencias, no crees archivos nuevos, y no cambies la estructura sin preguntar.
