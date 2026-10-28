import { useRef, useState } from 'react'
import { FileText, ImageIcon, Paperclip, X } from 'lucide-react'
import { ACEPTAR, leerArchivo, tamanoLegible } from '../utils/archivos'

/**
 * Selector de comprobante (foto o PDF). Valida tipo y tamaño en pantalla
 * y entrega al padre el objeto listo para la API: onCambio({ nombreArchivo, tipoContenido, contenido }).
 */
export function SelectorArchivo({ valor, onCambio, requerido = false, etiqueta = 'Comprobante', ayuda }) {
  const entrada = useRef(null)
  const [error, setError] = useState(null)
  const [tamano, setTamano] = useState(0)

  const elegir = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    try {
      const leido = await leerArchivo(archivo)
      setError(null)
      setTamano(archivo.size)
      onCambio(leido)
    } catch (err) {
      setError(err.message)
      onCambio(null)
    }
  }

  const Icono = valor?.tipoContenido === 'application/pdf' ? FileText : ImageIcon

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {etiqueta}
        {requerido && <span className="ml-0.5 text-red-600">*</span>}
      </span>

      {valor ? (
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-200">
          {valor.tipoContenido.startsWith('image/') ? (
            <img
              src={`data:${valor.tipoContenido};base64,${valor.contenido}`}
              alt="Vista previa del comprobante"
              className="size-12 shrink-0 rounded-md object-cover ring-1 ring-emerald-200"
            />
          ) : (
            <Icono className="size-10 shrink-0 text-emerald-700" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-emerald-900">{valor.nombreArchivo}</p>
            <p className="text-xs text-emerald-700">{tamanoLegible(tamano)} · listo para adjuntar</p>
          </div>
          <button
            type="button"
            onClick={() => onCambio(null)}
            className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-100"
            aria-label="Quitar archivo"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-sm transition-colors ${
            error ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300 text-slate-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700'
          }`}
        >
          <Paperclip className="size-4" />
          Seleccionar foto o PDF
        </button>
      )}

      <input ref={entrada} type="file" accept={ACEPTAR} onChange={elegir} className="hidden" />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">{ayuda ?? 'JPG, PNG o PDF · máximo 2 MB'}</p>
      )}
    </div>
  )
}
