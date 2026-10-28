import { Printer } from 'lucide-react'
import { Boton } from '../../components/ui'

/** Panel de filtros de un reporte con el botón de imprimir / guardar PDF (RF-29). */
export function BarraReporte({ children, puedeImprimir = true }) {
  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 print:hidden">
      <div className="flex flex-wrap items-end gap-4">
        {children}
        <div className="ml-auto">
          <Boton variante="oscuro" icono={Printer} onClick={() => window.print()} disabled={!puedeImprimir}>
            Imprimir / PDF
          </Boton>
        </div>
      </div>
    </div>
  )
}
