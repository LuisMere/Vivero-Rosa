import { supabase } from '../lib/supabase'

export const defaultContent = {
  brand: 'Vivero Rosa',
  logoImage: '',
  eyebrow: 'Un pedacito de naturaleza en tu hogar',
  heroTitle: 'Plantas que transforman espacios',
  heroText: 'Cultivamos vida, diseñamos calma y llevamos la naturaleza a cada rincón.',
  phone: '+52 55 1234 5678', email: 'hola@viverorosa.mx', location: 'Ciudad de México · Entregas en toda la ciudad',
  heroImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1600&q=85',
  services: [
    { icon: 'sprout', title: 'Plantas de interior', text: 'Selección de plantas sanas y hermosas para llenar tu hogar de vida.' },
    { icon: 'palette', title: 'Diseño de espacios', text: 'Creamos composiciones que reflejan tu estilo y transforman tus ambientes.' },
    { icon: 'truck', title: 'Envíos cuidadosos', text: 'Llevamos tus plantas hasta tu puerta con todo el cuidado que merecen.' }
  ],
  gallery: [
    { category: 'interior', title: 'Verde que abraza', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=1000&q=85' },
    { category: 'interior', title: 'Rincones con vida', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85' },
    { category: 'exterior', title: 'Jardines que respiran', image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1000&q=85' },
    { category: 'diseño', title: 'Diseño natural', image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=1000&q=85' },
    { category: 'interior', title: 'Tu pausa favorita', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85' },
    { category: 'exterior', title: 'Patios vivos', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85' }
  ],
  aboutImage: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=85',
  aboutTitle: 'Creemos que un espacio con plantas es un espacio más feliz.',
  aboutText: 'En Vivero Rosa cultivamos mucho más que plantas. Cultivamos momentos, pausas y pequeños rituales que hacen que tu casa se sienta como hogar.',
  rosaPhoto: '',
  testimonials: [
    { quote: 'Mi departamento cambió por completo. Cada planta llegó preciosa y el equipo entendió perfecto lo que buscaba.', author: 'Mariana G.', role: 'Cliente Vivero Rosa' },
    { quote: 'El diseño que hicieron para nuestra terraza se volvió el lugar favorito de toda la familia.', author: 'Alejandro R.', role: 'Cliente Vivero Rosa' }
  ]
}

const CONTENT_ID = 'main'
const BUCKET = 'site-images'
const MAX_IMAGE_BYTES = 6 * 1024 * 1024

export function mergeContent(row) {
  return { ...defaultContent, ...row }
}

export async function fetchContent() {
  if (!supabase) return defaultContent

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('id', CONTENT_ID)
    .maybeSingle()

  if (error || !data?.data) return defaultContent
  return mergeContent(data.data)
}

export async function saveContent(content) {
  if (!supabase) {
    throw new Error('Falta configurar Supabase. Copia .env.example a .env.local y pega la URL y la anon key.')
  }

  const { error } = await supabase.from('site_content').upsert({
    id: CONTENT_ID,
    data: content,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function uploadSiteImage(file, folder = 'general') {
  if (!supabase) {
    throw new Error('Falta configurar Supabase para subir fotos.')
  }

  if (!file?.type?.startsWith('image/')) {
    throw new Error('Elige una imagen (jpg, png, webp o gif).')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen pesa más de 6 MB. Elige una más ligera.')
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext || 'jpg'}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
