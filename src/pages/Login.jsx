import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/Logo'
import { AlertaError, Boton, Campo, Entrada } from '../components/ui'

/** RF-01: inicio de sesión con usuario y contraseña. */
export default function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await iniciarSesion(nombreUsuario.trim(), password)
      navegar(ubicacion.state?.desde ?? '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <div
          className="pointer-events-none absolute -right-40 -bottom-40 size-[34rem] rounded-full border-[48px] border-orange-500/15"
          aria-hidden="true"
        />
        <Logo />
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Una visión de <span className="text-orange-500">360°</span>
            <br />
            de sus cuentas por pagar.
          </h1>
          <ul className="mt-8 space-y-3 text-slate-300">
            {[
              'Proveedores, facturas y pagos en un solo lugar',
              'Saldos y vencimientos actualizados al instante',
              'Estados de cuenta y reportes listos para imprimir',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-orange-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-slate-500">Ferretería Los Esclavos · Cuilapa, Santa Rosa</p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <Logo claro className="mb-10 lg:hidden" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500">Ingrese sus credenciales para continuar.</p>

          <form onSubmit={enviar} className="mt-8 space-y-5">
            <AlertaError mensaje={error} />
            <Campo etiqueta="Usuario">
              <Entrada value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} autoComplete="username" autoFocus required />
            </Campo>
            <Campo etiqueta="Contraseña">
              <Entrada type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </Campo>
            <Boton type="submit" tamano="lg" icono={LogIn} cargando={cargando} className="w-full">
              Ingresar
            </Boton>
          </form>
        </div>
      </div>
    </div>
  )
}
