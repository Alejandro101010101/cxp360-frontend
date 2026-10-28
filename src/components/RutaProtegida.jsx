import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/**
 * RN-02: sin sesión no se entra al sistema.
 * RN-31: las rutas marcadas soloAdmin solo las ve el Administrador.
 */
export function RutaProtegida({ soloAdmin = false, children }) {
  const { usuario, esAdmin } = useAuth()
  const ubicacion = useLocation()

  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />

  if (soloAdmin && !esAdmin) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <ShieldAlert className="mx-auto size-10 text-red-500" />
        <h1 className="mt-4 text-lg font-semibold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-sm text-slate-500">Esta sección es exclusiva del rol Administrador.</p>
      </div>
    )
  }

  return children
}
