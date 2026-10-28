import { Link } from 'react-router-dom'

export default function NoEncontrado() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <p className="text-5xl font-bold text-orange-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">La dirección que buscó no existe en CxP360.</p>
      <Link to="/" className="mt-6 inline-block text-sm font-medium text-orange-700 hover:underline">Volver al panel de inicio</Link>
    </div>
  )
}
