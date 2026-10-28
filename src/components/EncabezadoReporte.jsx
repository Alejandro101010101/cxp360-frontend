import { fechaHora } from '../utils/formato'

/**
 * Encabezado que SOLO aparece al imprimir o guardar como PDF (RF-29):
 * datos de la empresa, título del reporte, filtros y fecha de generación.
 */
export function EncabezadoReporte({ encabezado, subtitulo }) {
  if (!encabezado) return null
  return (
    <div className="mb-4 hidden border-b-2 border-slate-900 pb-3 print:block">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">{encabezado.empresa}</p>
          <p className="text-xs text-slate-600">NIT {encabezado.nit} · {encabezado.direccion}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">
            CxP<span className="text-orange-600">360</span>
          </p>
          <p className="text-xs text-slate-500">Generado: {fechaHora(encabezado.generado)}</p>
        </div>
      </div>
      <h1 className="mt-3 text-base font-bold uppercase tracking-wide text-slate-900">{encabezado.titulo}</h1>
      {subtitulo && <p className="text-xs text-slate-600">{subtitulo}</p>}
    </div>
  )
}
