import { useEffect, useState, useRef, useCallback } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Check, Image, Leaf, Menu, Palette, Sprout, Truck, Upload, X } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { defaultContent, fetchContent, saveContent, uploadSiteImage } from './data/content'
import { supabase } from './lib/supabase'

/* ─── Custom Hooks ─────────────────────────────── */

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    const children = el.querySelectorAll('.reveal, .reveal-line')
    children.forEach((child) => observer.observe(child))
    if (el.classList.contains('reveal') || el.classList.contains('reveal-line')) {
      observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])
  return ref
}

function useNavHide() {
  const [hidden, setHidden] = useState(false)
  const lastScroll = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > 100 && y > lastScroll.current) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      lastScroll.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* ─── Shared ───────────────────────────────────── */

const icons = { sprout: Sprout, palette: Palette, truck: Truck }

const serviceImages = [
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
]

function Logo({ content }) {
  return content.logoImage
    ? <img className="logo-img" src={content.logoImage} alt={content.brand} />
    : <span className="logo-mark"><Leaf size={16} /></span>
}

/* ─── Navbar — Floating Liquid Glass Pill ──────── */

function Navbar({ content }) {
  const [open, setOpen] = useState(false)
  const hidden = useNavHide()
  return (
    <header className={`nav-editorial${hidden ? ' hidden' : ''}`}>
      <a className="logo" href="#inicio">
        <Logo content={content} />
        <span>{content.brand}</span>
      </a>
      <nav className={`nav-links-editorial${open ? ' open' : ''}`}>
        {['Nosotros', 'Servicios', 'Proyectos'].map(item => (
          <a key={item} href={'#' + item.toLowerCase()} onClick={() => setOpen(false)}>{item}</a>
        ))}
        <Link to="/solicitar" onClick={() => setOpen(false)}>Contacto</Link>
      </nav>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Abrir menú">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  )
}

/* ─── Hero — Immersive Full-screen ─────────────── */

function Hero({ content }) {
  const ref = useScrollReveal()
  const bgRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        const y = window.scrollY
        bgRef.current.style.transform = `translateY(${y * 0.08}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="inicio" className="hero-editorial" ref={ref}>
      <div className="hero-bg">
        <img ref={bgRef} src={content.heroImage} alt="Vivero Rosa — plantas" />
      </div>

      <h1 className="hero-title reveal">
        {content.heroTitle.split(' ').slice(0, -1).join(' ')}{' '}
        <em>{content.heroTitle.split(' ').slice(-1)[0]}</em>
      </h1>
      <div className="hero-bottom reveal">
        <p className="hero-subtitle">{content.heroText}</p>
        <a className="btn-glass" href="#contacto">
          Hablemos <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  )
}

/* ─── Services — Typographic Manifesto ─────────── */

function Services({ content }) {
  const ref = useScrollReveal()
  return (
    <section id="servicios" className="services-editorial" ref={ref}>
      <h2 className="services-statement reveal">
        Cultivamos <em>espacios.</em>
      </h2>
      <div>
        {content.services.map((service, i) => (
          <div className="service-block reveal" key={service.title}>
            <div className="service-content">
              <div className="service-number">0{i + 1}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-text">{service.text}</p>
            </div>
            <div className="service-image">
              <img src={serviceImages[i] || serviceImages[0]} alt={service.title} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Gallery — Asymmetric Mosaic ──────────────── */

function Gallery({ content }) {
  const [filter, setFilter] = useState('todos')
  const ref = useScrollReveal()
  const items = filter === 'todos'
    ? content.gallery
    : content.gallery.filter(x => x.category === filter)

  return (
    <section id="proyectos" className="gallery-editorial" ref={ref}>
      <div className="gallery-header reveal">
        <h2 className="gallery-title">
          Espacios que<br /><em>inspiran.</em>
        </h2>
        <div className="filters-glass">
          {[['todos', 'Todos'], ['interior', 'Interior'], ['exterior', 'Exterior'], ['diseño', 'Diseño']].map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="gallery-mosaic reveal">
        {items.map(item => (
          <figure key={item.title}>
            <img src={item.image} alt={item.title} />
            <div className="gallery-caption">
              <span>{item.title}</span>
              <ArrowUpRight size={16} />
            </div>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ─── About — Magazine Spread ──────────────────── */

function About({ content }) {
  const ref = useScrollReveal()
  return (
    <section id="nosotros" className="about-editorial" ref={ref}>
      <div className="about-grid">
        <div className="about-text-col reveal">
          <div className="about-eyebrow">Nuestra esencia</div>
          <h2 className="about-heading">
            {content.aboutTitle}
          </h2>
          <p className="about-body">{content.aboutText}</p>
          <div className="about-rosa">
            <div className="about-rosa-photo">
              {content.rosaPhoto ? (
                <img src={content.rosaPhoto} alt="Rosa — Fundadora de Vivero Rosa" />
              ) : (
                <div className="about-rosa-photo-empty">
                  <Image size={20} />
                  <span>Rosa</span>
                </div>
              )}
            </div>
            <div className="about-rosa-info">
              <span className="about-rosa-name">Rosa</span>
              <span className="about-rosa-role">Fundadora & jardinera</span>
            </div>
          </div>
        </div>
        <div className="about-img-col reveal" style={{ transitionDelay: '0.15s' }}>
          <div className="about-main-img">
            <img src={content.aboutImage} alt="Vivero Rosa — naturaleza" />
          </div>
          <div className="about-stamp">
            Desde<br /><strong>2018</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials — Editorial Statement ───────── */

function Testimonials({ content }) {
  const ref = useScrollReveal()
  return (
    <section className="testimonials-editorial" ref={ref}>
      <div className="about-eyebrow reveal">Palabras bonitas</div>
      {content.testimonials.map((t, i) => (
        <div key={t.author}>
          <div className="quote-editorial reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
            <blockquote>
              <p>"{t.quote}"</p>
              <footer>
                <strong>{t.author}</strong>
                <span>{t.role}</span>
              </footer>
            </blockquote>
          </div>
          {i < content.testimonials.length - 1 && <div className="quote-separator reveal" />}
        </div>
      ))}
    </section>
  )
}

/* ─── Steps — "Transforma tu espacio" ──────────── */

function Steps() {
  const ref = useScrollReveal()
  const steps = [
    { num: '01', title: 'Cuéntanos', text: 'Visita gratis' },
    { num: '02', title: 'Te proponemos', text: 'Plan a tu medida' },
    { num: '03', title: 'Lo hacemos', text: 'Tu espacio cobra vida' },
  ]
  return (
    <section className="steps-editorial" ref={ref}>
      <h2 className="steps-heading reveal">
        Transforma tu espacio<br /><em>en 3 pasos</em>
      </h2>
      <ol className="steps-track">
        {steps.map((s, i) => (
          <li className="step-card reveal" key={s.num} style={{ transitionDelay: `${i * 0.1}s` }}>
            <span className="step-num">{s.num}</span>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-text">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="steps-cta reveal">
        <Link to="/solicitar" className="btn-steps-cta">
          Solicitar inspección gratis <ArrowUpRight size={20} />
        </Link>
      </div>
    </section>
  )
}

/* ─── Contact — Centered Typographic Close ─────── */

function Contact({ content }) {
  const ref = useScrollReveal()
  return (
    <section id="contacto" className="contact-editorial" ref={ref}>
      <h2 className="contact-heading reveal">
        Tu espacio<br /><em>te está esperando.</em>
      </h2>
      <p className="contact-subtext reveal">
        Cuéntanos qué tienes en mente. Nos encantará hacerlo crecer contigo.
      </p>
      <div className="contact-actions reveal">
        <Link
          className="btn-glass-light"
          to="/solicitar"
        >
          Solicitar inspección gratuita <ArrowUpRight size={16} />
        </Link>
        <a className="contact-email-link" href={'mailto:' + content.email}>
          {content.email} <ArrowUpRight size={13} />
        </a>
      </div>
    </section>
  )
}

/* ─── Footer — Subtle Integrated Line ──────────── */

function Footer({ content }) {
  return (
    <footer className="footer-editorial">
      <a className="logo" href="#inicio">
        <Logo content={content} />
        <span>{content.brand}</span>
      </a>
      <div className="footer-meta-editorial">
        <span>{content.location}</span>
        <a href="#inicio">Volver arriba ↑</a>
        <span>© 2024 Vivero Rosa</span>
      </div>
    </footer>
  )
}

/* ─── Public Page Wrapper ──────────────────────── */

function PublicPage() {
  const [content, setContent] = useState(defaultContent)
  useEffect(() => { fetchContent().then(setContent) }, [])
  return (
    <>
      <Navbar content={content} />
      <main>
        <Hero content={content} />
        <Services content={content} />
        <Gallery content={content} />
        <About content={content} />
        <Testimonials content={content} />
        <Steps />
      </main>
      <Footer content={content} />
    </>
  )
}

function Protected({ children }) {
  const { session, loading, configured } = useAuth()
  if (loading) return <div className="admin-shell login-shell"><p className="admin-status">Cargando…</p></div>
  if (!configured || !session) return <Navigate to="/admin/login" replace />
  return children
}

function Login() {
  const { session, loading, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) navigate('/admin', { replace: true })
  }, [loading, session, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!supabase) {
      setError('Falta configurar Supabase. Copia .env.example a .env.local y pega URL y anon key.')
      return
    }
    setBusy(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (authError) {
      const code = authError.message || ''
      if (/invalid login credentials/i.test(code)) {
        setError('Correo o contraseña incorrectos. Usa el usuario que creaste en Authentication → Users, no el login viejo del código.')
      } else if (/email not confirmed/i.test(code)) {
        setError('El correo no está confirmado. En Authentication → Users abre el usuario y confírmalo (Auto Confirm).')
      } else {
        setError(code)
      }
    }
    else navigate('/admin')
  }

  return (
    <div className="admin-shell login-shell">
      <div className="login-card">
        <Link className="logo" to="/"><span className="logo-mark"><Leaf size={19} /></span><span>Vivero Rosa</span></Link>
        <p className="eyebrow"><span /> Panel privado</p>
        <h1>Hola, Rosa.</h1>
        <p>Ingresa para editar el contenido de tu sitio.</p>
        {!configured && (
          <div className="form-error">Este panel necesita un proyecto de Supabase. Sigue los pasos de supabase/setup.sql y .env.example.</div>
        )}
        <form onSubmit={submit}>
          <label>Correo<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required /></label>
          <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="button button-dark full" disabled={busy || !configured}>
            {busy ? 'Entrando…' : <>Entrar <ArrowUpRight size={17} /></>}
          </button>
        </form>
        <Link className="back-link" to="/">← Volver al sitio</Link>
      </div>
    </div>
  )
}

function ImageField({ label, value, onChange, folder, preview = true, originalUrl }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [imgError, setImgError] = useState(false)

  // Reset imgError when value changes (new image uploaded or restored)
  useEffect(() => { setImgError(false) }, [value])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadSiteImage(file, folder))
    } catch (err) {
      setError(err.message || 'No se pudo subir la imagen.')
    } finally {
      setBusy(false)
    }
  }

  const showImage = value && !imgError

  return (
    <div className="image-field">
      <span className="field-label">{label}</span>
      <div className="image-field-actions">
        <label className="upload-btn">
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
          <Upload size={15} />
          {busy ? 'Subiendo…' : 'Subir foto'}
        </label>
        {originalUrl && value !== originalUrl && (
          <button type="button" className="restore-photo" onClick={() => onChange(originalUrl)}>
            Foto original
          </button>
        )}
      </div>
      {error && <div className="form-error">{error}</div>}
      {preview && (
        <div className="image-field-preview">
          {showImage && (
            <img src={value} alt={label} onError={() => setImgError(true)} />
          )}
          {!showImage && (
            <div className="image-field-empty">
              <Image size={22} />
              <span>Sin imagen</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, textarea }) {
  const Tag = textarea ? 'textarea' : 'input'
  return <label className="field">{label}<Tag value={value} onChange={e => onChange(e.target.value)} rows={textarea ? 3 : undefined} /></label>
}

function GalleryEditorItem({ item, index, onTitleChange, onImageChange }) {
  const [thumbError, setThumbError] = useState(false)

  // Reset error when image URL changes
  useEffect(() => { setThumbError(false) }, [item.image])

  const showThumb = item.image && !thumbError

  return (
    <div className="gallery-editor-item">
      <div className="gallery-editor-thumb">
        {showThumb && (
          <img src={item.image} alt={item.title} onError={() => setThumbError(true)} />
        )}
        {!showThumb && (
          <div className="image-field-empty">
            <Image size={18} />
          </div>
        )}
      </div>
      <div className="gallery-editor-fields">
        <Field label={'Título proyecto ' + (index + 1)} value={item.title} onChange={v => onTitleChange(index, v)} />
        <ImageField label="Foto del proyecto" value={item.image} onChange={v => onImageChange(index, v)} folder={'gallery-' + index} preview={false} originalUrl={defaultContent.gallery[index]?.image} />
      </div>
    </div>
  )
}

function Admin() {
  const [content, setContent] = useState(defaultContent)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchContent().then(setContent) }, [])

  const update = (key, value) => setContent({ ...content, [key]: value })
  const save = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await saveContent(content)
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setSaveError(err.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }
  const logout = async () => {
    await supabase?.auth.signOut()
    navigate('/admin/login')
  }
  const updateGalleryImage = (i, url) => {
    const g = [...content.gallery]
    g[i] = { ...g[i], image: url }
    update('gallery', g)
  }
  const updateGalleryTitle = (i, title) => {
    const g = [...content.gallery]
    g[i] = { ...g[i], title }
    update('gallery', g)
  }
  const reset = async () => {
    setContent(defaultContent)
    try {
      await saveContent(defaultContent)
    } catch (err) {
      setSaveError(err.message || 'No se pudo restablecer.')
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link className="logo" to="/"><span className="logo-mark"><Leaf size={19} /></span><span>Vivero Rosa</span></Link>
        <div>
          <a href="/" target="_blank" className="preview-link">Ver sitio <ArrowUpRight size={15} /></a>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </header>
      <main className="admin-main">
        <div className="admin-title">
          <div>
            <p className="eyebrow"><span /> Contenido</p>
            <h1>Tu vivero,<br /><em>tu voz.</em></h1>
          </div>
          <button className="button button-dark" onClick={save} disabled={saving}>
            {saved ? <><Check size={17} /> Guardado</> : saving ? 'Guardando…' : <>Guardar cambios <ArrowUpRight size={17} /></>}
          </button>
        </div>
        {saveError && <div className="form-error admin-banner">{saveError}</div>}
        <p className="admin-hint">Sube la foto y luego pulsa Guardar cambios. El sitio público se actualiza para todos.</p>
        <div className="editor-grid">
          <section className="editor-card">
            <h2>Marca</h2>
            <Field label="Nombre del negocio" value={content.brand} onChange={v => update('brand', v)} />
            <ImageField label="Logo" value={content.logoImage} onChange={v => update('logoImage', v)} folder="logo" originalUrl={defaultContent.logoImage} />
          </section>
          <section className="editor-card">
            <h2>Portada</h2>
            <Field label="Título principal" value={content.heroTitle} onChange={v => update('heroTitle', v)} />
            <Field label="Descripción" value={content.heroText} onChange={v => update('heroText', v)} textarea />
            <ImageField label="Imagen de portada" value={content.heroImage} onChange={v => update('heroImage', v)} folder="hero" originalUrl={defaultContent.heroImage} />
          </section>
          <section className="editor-card">
            <h2>Contacto</h2>
            <Field label="Teléfono / WhatsApp" value={content.phone} onChange={v => update('phone', v)} />
            <Field label="Correo electrónico" value={content.email} onChange={v => update('email', v)} />
            <Field label="Ubicación" value={content.location} onChange={v => update('location', v)} />
          </section>
          <section className="editor-card wide">
            <h2>Nosotros</h2>
            <Field label="Título" value={content.aboutTitle} onChange={v => update('aboutTitle', v)} />
            <Field label="Historia" value={content.aboutText} onChange={v => update('aboutText', v)} textarea />
            <ImageField label="Imagen de la sección" value={content.aboutImage} onChange={v => update('aboutImage', v)} folder="about" originalUrl={defaultContent.aboutImage} />
            <ImageField label="Foto de Rosa (formato vertical 3:4)" value={content.rosaPhoto || ''} onChange={v => update('rosaPhoto', v)} folder="rosa" originalUrl={defaultContent.rosaPhoto || ''} />
          </section>
          <section className="editor-card wide">
            <h2>Servicios</h2>
            {content.services.map((s, i) => (
              <div className="inline-edit" key={i}>
                <Field label={'Servicio ' + (i + 1)} value={s.title} onChange={v => { const a = [...content.services]; a[i] = { ...a[i], title: v }; update('services', a) }} />
                <Field label="Descripción" value={s.text} onChange={v => { const a = [...content.services]; a[i] = { ...a[i], text: v }; update('services', a) }} />
              </div>
            ))}
          </section>
          <section className="editor-card wide">
            <h2>Proyectos — Galería</h2>
            <div className="gallery-editor-grid">
              {content.gallery.map((item, i) => (
                <GalleryEditorItem key={i} item={item} index={i} onTitleChange={updateGalleryTitle} onImageChange={updateGalleryImage} />
              ))}
            </div>
          </section>
        </div>
        <button className="reset-button" onClick={reset}>Restablecer contenido original</button>
      </main>
    </div>
  )
}

/* ─── Inspection Form Page ──────────────────────── */

const PROVINCIAS_RD = [
  'Azua','Bahoruco','Barahona','Dajabón','Distrito Nacional','Duarte',
  'El Seibo','Elías Piña','Espaillat','Hato Mayor','Hermanas Mirabal',
  'Independencia','La Altagracia','La Romana','La Vega','María Trinidad Sánchez',
  'Monseñor Nouel','Monte Cristi','Monte Plata','Pedernales','Peravia',
  'Puerto Plata','Samaná','San Cristóbal','San José de Ocoa','San Juan',
  'San Pedro de Macorís','Sánchez Ramírez','Santiago','Santiago Rodríguez',
  'Santo Domingo','Valverde'
]

function InspectionForm() {
  const revealRef = useScrollReveal()
  const [content, setContent] = useState(defaultContent)
  useEffect(() => { fetchContent().then(setContent) }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const [spaceType, setSpaceType] = useState('')
  const [services, setServices] = useState([])
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [details, setDetails] = useState('')
  const [name, setName] = useState('')

  const toggleService = (s) => {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const lines = [
      `🌿 *SOLICITUD DE INSPECCIÓN GRATUITA*`,
      ``,
      `👤 *Nombre:* ${name}`,
      ``,
      `🏠 *Tipo de espacio:* ${spaceType}`,
      ``,
      `🎯 *Servicios de interés:*`,
      ...services.map(s => `  • ${s}`),
      ``,
      `📍 *Ubicación:* ${city}${province ? ', ' + province : ''}`,
      ``,
      `📝 *Detalles:*`,
      details || '(sin detalles adicionales)',
    ]
    const text = encodeURIComponent(lines.join('\n'))
    const phone = content.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  const spaceOptions = ['Villa', 'Residencia', 'Proyecto inmobiliario', 'Hotel / Resort', 'Restaurante / Negocio', 'Otro']
  const serviceOptions = ['Diseño y paisajismo', 'Instalación de césped', 'Plantas para mi espacio', 'Arreglos personalizados', 'Renovación de un jardín existente', 'Iluminación paisajística', 'Otro']

  const isValid = spaceType && services.length > 0 && city && name

  return (
    <div className="form-page" ref={revealRef}>
      <header className="form-page-header">
        <Link className="logo" to="/">
          <Logo content={content} />
          <span>{content.brand}</span>
        </Link>
        <Link to="/" className="form-back-link">← Volver al sitio</Link>
      </header>

      <main className="form-page-main">
        <div className="form-intro reveal">
          <h1 className="form-page-title">
            Queremos conocer tu espacio<br /><em>y ayudarte a darle vida.</em>
          </h1>
          <p className="form-page-subtitle">
            Completa este breve formulario y nos pondremos en contacto contigo para coordinar una inspección gratuita.
          </p>
        </div>

        <form className="inspection-form" onSubmit={handleSubmit}>
          {/* 01 — Space type */}
          <fieldset className="form-step reveal">
            <legend className="form-step-legend">
              <span className="form-step-num">01</span>
              ¿Qué tipo de espacio tienes?
            </legend>
            <div className="radio-grid">
              {spaceOptions.map(opt => (
                <label key={opt} className={`radio-pill${spaceType === opt ? ' selected' : ''}`}>
                  <input type="radio" name="spaceType" value={opt} checked={spaceType === opt} onChange={() => setSpaceType(opt)} />
                  <span className="radio-dot" />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 02 — Services */}
          <fieldset className="form-step reveal">
            <legend className="form-step-legend">
              <span className="form-step-num">02</span>
              ¿Qué estás buscando?
            </legend>
            <p className="form-step-hint">Puedes seleccionar varias opciones.</p>
            <div className="checkbox-grid">
              {serviceOptions.map(opt => (
                <label key={opt} className={`checkbox-pill${services.includes(opt) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={services.includes(opt)} onChange={() => toggleService(opt)} />
                  <span className="checkbox-box">{services.includes(opt) && <Check size={12} />}</span>
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 03 — Location */}
          <fieldset className="form-step reveal">
            <legend className="form-step-legend">
              <span className="form-step-num">03</span>
              ¿Dónde está ubicado tu espacio?
            </legend>
            <div className="form-fields-row">
              <label className="form-field">
                <span>Ciudad / comunidad</span>
                <input type="text" placeholder="Escribe aquí" value={city} onChange={e => setCity(e.target.value)} />
              </label>
              <label className="form-field">
                <span>Provincia</span>
                <select value={province} onChange={e => setProvince(e.target.value)}>
                  <option value="">Selecciona una opción</option>
                  {PROVINCIAS_RD.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
            </div>
          </fieldset>

          {/* 04 — Details */}
          <fieldset className="form-step reveal">
            <legend className="form-step-legend">
              <span className="form-step-num">04</span>
              Cuéntanos un poco más
            </legend>
            <label className="form-field">
              <span>¿Qué te gustaría transformar o mejorar?</span>
              <textarea rows={4} placeholder="Escribe aquí" value={details} onChange={e => setDetails(e.target.value)} />
            </label>
          </fieldset>

          {/* 05 — Name */}
          <fieldset className="form-step reveal">
            <legend className="form-step-legend">
              <span className="form-step-num">05</span>
              ¿Cómo podemos contactarte?
            </legend>
            <label className="form-field">
              <span>Nombre</span>
              <input type="text" placeholder="Escribe tu nombre" value={name} onChange={e => setName(e.target.value)} />
            </label>
          </fieldset>

          {/* Submit */}
          <div className="form-submit reveal">
            <p className="form-submit-label">¿Listo para transformar tu espacio?</p>
            <button type="submit" className="btn-form-submit" disabled={!isValid}>
              Solicitar inspección gratuita <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/solicitar" element={<InspectionForm />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
