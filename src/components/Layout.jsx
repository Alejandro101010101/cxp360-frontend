import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3, Building2, CalendarClock, CreditCard, FileText, Hourglass, Landmark,
  LayoutDashboard, LogOut, Menu, ScrollText, Truck, UserCog, Wallet, X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from './Logo'

/** RF-03: menú de navegación con acceso a todos los módulos. */
const SECCIONES = [
  {
    titulo: null,
    enlaces: [{ a: '/', texto: 'Panel de inicio', icono: LayoutDashboard, exacto: true }],
  },
  {
    titulo: 'Catálogos',
    enlaces: [{ a: '/proveedores', texto: 'Proveedores', icono: Truck }],
  },
  {
    titulo: 'Movimientos',
    enlaces: [
      { a: '/facturas', texto: 'Ingresos por compra', icono: FileText },
      { a: '/pagos', texto: 'Pagos', icono: Wallet },
    ],
  },
  {
    titulo: 'Consultas y reportes',
    enlaces: [
      { a: '/reportes/estado-cuenta', texto: 'Estado de cuenta', icono: ScrollText },
      { a: '/reportes/pendientes', texto: 'Pendientes y vencidas', icono: CalendarClock },
      { a: '/reportes/antiguedad', texto: 'Antigüedad de saldos', icono: Hourglass },
      { a: '/reportes/pagos', texto: 'Pagos por período', icono: BarChart3 },
    ],
  },
  {
    titulo: 'Parámetros del sistema',
    soloAdmin: true,
    enlaces: [
      { a: '/parametros/empresa', texto: 'Empresa e IVA', icono: Building2 },
      { a: '/parametros/formas-pago', texto: 'Formas de pago', icono: CreditCard },
      { a: '/parametros/bancos', texto: 'Bancos', icono: Landmark },
      { a: '/parametros/usuarios', texto: 'Usuarios', icono: UserCog },
    ],
  },
]

function Menu_({ esAdmin, alNavegar }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {SECCIONES.filter((s) => !s.soloAdmin || esAdmin).map((seccion, i) => (
        <div key={i}>
          {seccion.titulo && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{seccion.titulo}</p>
          )}
          <ul className="space-y-1">
            {seccion.enlaces.map(({ a, texto, icono: Icono, exacto }) => (
              <li key={a}>
                <NavLink
                  to={a}
                  end={exacto}
                  onClick={alNavegar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icono className="size-[18px] shrink-0" />
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Layout() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const iniciales = usuario.nombreCompleto
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  const barraLateral = (
    <>
      <div className="flex h-16 items-center border-b border-slate-800 px-5">
        <Logo />
      </div>
      <Menu_ esAdmin={esAdmin} alNavegar={() => setMenuAbierto(false)} />
      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        Sistema de Cuentas por Pagar
        <br />
        UMG · Desarrollo Web 2026
      </div>
    </>
  )

  return (
    <div className="min-h-screen">
      {/* Barra lateral fija (pantallas grandes) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-900 lg:flex print:hidden">{barraLateral}</aside>

      {/* Barra lateral desplegable (celular y tablet) */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden print:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMenuAbierto(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-slate-900">
            <button
              type="button"
              onClick={() => setMenuAbierto(false)}
              className="absolute top-4 -right-11 rounded-md bg-slate-900 p-1.5 text-white"
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </button>
            {barraLateral}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 print:pl-0">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 print:hidden">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{usuario.nombreCompleto}</p>
              <p className="text-xs text-slate-500">{usuario.rol}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
              {iniciales}
            </span>
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              title="Cerrar sesión"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
