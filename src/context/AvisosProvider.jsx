import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { AvisosContext } from './contextos'

let siguienteId = 1

/** Notificaciones breves en la esquina de la pantalla. */
export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const quitar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), [])

  const agregar = useCallback(
    (tipo, mensaje) => {
      const id = siguienteId++
      setAvisos((lista) => [...lista, { id, tipo, mensaje }])
      setTimeout(() => quitar(id), tipo === 'error' ? 6000 : 3500)
    },
    [quitar],
  )

  const valor = useMemo(
    () => ({
      exito: (mensaje) => agregar('exito', mensaje),
      error: (mensaje) => agregar('error', mensaje),
    }),
    [agregar],
  )

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2 print:hidden">
        {avisos.map((a) => (
          <div
            key={a.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
              a.tipo === 'error' ? 'border-red-200' : 'border-emerald-200'
            }`}
          >
            {a.tipo === 'error' ? (
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            )}
            <p className="flex-1 text-sm text-slate-700">{a.mensaje}</p>
            <button
              type="button"
              onClick={() => quitar(a.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Cerrar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  )
}
