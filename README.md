# Vivero Rosa

Proyecto desarrollado con **React 19** y **Vite**, diseñado como una plataforma editorial y premium para el sector de jardinería y paisajismo en la República Dominicana.

## Stack Tecnológico
- **Frontend:** React 19 (JSX)
- **Bundler:** Vite
- **Router:** React Router DOM 7
- **Backend / Auth / Storage:** Supabase
- **Estilos:** Vanilla CSS (index.css)
- **Tipografía:** Google Fonts (Playfair Display, DM Sans)

## Características Principales
- **Diseño Editorial:** Interfaz estilo revista de alta gama con enfoque en *Liquid Glass*.
- **Contenido Dinámico:** Gestión de contenido centralizada a través de Supabase, con fallback a valores por defecto.
- **Formulario de Inspección:** Flujo de contacto directo vía WhatsApp para clientes.
- **Panel Administrativo:** Interfaz privada protegida para gestión de marca y contenidos.

## Despliegue (Vercel)
Para poner la aplicación en producción utilizando Vercel, sigue estos pasos:

1. **Importar el repositorio:** Conecta este repositorio en tu cuenta de Vercel.
2. **Configurar Variables de Entorno:** En el panel de configuración de Vercel, ve a **Environment Variables** y añade las siguientes claves necesarias para conectar con el backend de Supabase:
   - `VITE_SUPABASE_URL`: (Tu URL del proyecto de Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (Tu clave pública anon de Supabase)
3. **Despliegue:** Vercel detectará automáticamente el framework Vite y realizará el build y despliegue cada vez que se realice un cambio en la rama principal.

## Estructura de Proyecto
- `src/App.jsx`: Lógica central y rutas.
- `src/index.css`: Sistema de diseño completo.
- `supabase/setup.sql`: Schema y políticas de seguridad (RLS) necesarias.
- `src/data/content.js`: Lógica de carga y guardado de datos.

---
*Vivero Rosa - Plantas que transforman espacios.*
