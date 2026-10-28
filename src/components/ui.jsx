// ======================================================================
// Componentes de interfaz reutilizables de CxP360
// ======================================================================
import { useEffect } from 'react'
import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react'

const VARIANTES = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:outline-orange-600 shadow-sm',
  secundario: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  peligro: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-sm',
  fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
  oscuro: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900 shadow-sm',
}

const TAMANOS = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
  lg: 'px-4 py-2.5 text-sm gap-2',
}

export function Boton({
  variante = 'primario',
  tamano = 'md',
  icono: Icono,
  cargando = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando ? <Loader2 className="size-4 animate-spin" /> : Icono && <Icono className="size-4" />}
      {children}
    </button>
  )
}

const claseControl =
  'block w-full rounded-lg border-0 bg-white focus:outline-none px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-500'

export function Entrada({ className = '', ...props }) {
  return <input className={`${claseControl} ${className}`} {...props} />
}

export function Seleccion({ className = '', children, ...props }) {
  return (
    <select className={`${claseControl} pr-8 ${className}`} {...props}>
      {children}
    </select>
  )
}

export function AreaTexto({ className = '', ...props }) {
  return <textarea className={`${claseControl} ${className}`} rows={3} {...props} />
}

/** Etiqueta + control + ayuda opcional. */
export function Campo({ etiqueta, ayuda, requerido, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {etiqueta}
        {requerido && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1 block text-xs text-slate-500">{ayuda}</span>}
    </label>
  )
}

export function Casilla({ etiqueta, className = '', ...props }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 ${className}`}>
      <input type="checkbox" className="size-4 rounded border-slate-300 accent-orange-600" {...props} />
      {etiqueta}
    </label>
  )
}

export function Tarjeta({ titulo, descripcion, acciones, className = '', sinRelleno = false, children }) {
  return (
    <section className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-200 print:shadow-none print:ring-0 ${className}`}>
      {(titulo || acciones) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            {titulo && <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>}
            {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
          </div>
          {acciones && <div className="flex flex-wrap items-center gap-2 print:hidden">{acciones}</div>}
        </header>
      )}
      <div className={sinRelleno ? '' : 'p-5'}>{children}</div>
    </section>
  )
}

export function EncabezadoPagina({ titulo, descripcion, acciones }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  )
}

const COLORES_INSIGNIA = {
  gris: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  verde: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  ambar: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  rojo: 'bg-red-50 text-red-700 ring-red-600/20',
  azul: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  naranja: 'bg-orange-50 text-orange-700 ring-orange-600/20',
}

export function Insignia({ color = 'gris', children }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES_INSIGNIA[color]}`}>
      {children}
    </span>
  )
}

/** Estado de una factura (RN-18) con "Vencida" calculada (RN-19). */
export function EstadoFactura({ estado, vencida, dias }) {
  if (vencida) return <Insignia color="rojo">Vencida{dias ? ` · ${dias} d` : ''}</Insignia>
  const color = { Pendiente: 'ambar', Parcial: 'azul', Pagada: 'verde', Anulada: 'gris' }[estado] ?? 'gris'
  return <Insignia color={color}>{estado}</Insignia>
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
      <Loader2 className="size-5 animate-spin text-orange-600" />
      {texto}
    </div>
  )
}

export function Vacio({ mensaje = 'No hay registros para mostrar.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-slate-500">
      <Inbox className="size-8 text-slate-300" />
      {mensaje}
    </div>
  )
}

export function AlertaError({ mensaje, className = '' }) {
  if (!mensaje) return null
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200 ${className}`}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>{mensaje}</p>
    </div>
  )
}

/** Ventana emergente. Se cierra con Escape o con el botón X. */
export function Modal({ abierto, titulo, onCerrar, children, pie, ancho = 'max-w-lg' }) {
  useEffect(() => {
    if (!abierto) return undefined
    const alPresionar = (e) => e.key === 'Escape' && onCerrar?.()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-[8vh] print:hidden">
      <div role="dialog" aria-modal="true" aria-label={titulo} className={`w-full ${ancho} rounded-xl bg-white shadow-2xl`}>
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {pie && <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 rounded-b-xl">{pie}</footer>}
      </div>
    </div>
  )
}

/** Tarjeta de indicador para el panel de inicio y los resúmenes de reportes. */
export function Indicador({ titulo, valor, detalle, icono: Icono, color = 'slate' }) {
  const colores = {
    slate: 'bg-slate-100 text-slate-700',
    naranja: 'bg-orange-100 text-orange-700',
    rojo: 'bg-red-100 text-red-700',
    ambar: 'bg-amber-100 text-amber-700',
    verde: 'bg-emerald-100 text-emerald-700',
    azul: 'bg-sky-100 text-sky-700',
  }
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 print:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{titulo}</p>
        {Icono && (
          <span className={`rounded-lg p-2 print:hidden ${colores[color]}`}>
            <Icono className="size-5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </div>
  )
}
