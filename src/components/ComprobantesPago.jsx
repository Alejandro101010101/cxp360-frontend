import { Link } from 'react-router-dom'
import { Paperclip, Receipt } from 'lucide-react'
import { ListaComprobantes } from './ListaComprobantes'
import { Boton, Insignia } from './ui'

const claseEnlace =
  'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'

/** Celda con los comprobantes de un pago, o aviso de recibo pendiente (efectivo, RF-36). */
export function CeldaComprobantes({ pago }) {
  if (pago.comprobantes.length > 0) return <ListaComprobantes comprobantes={pago.comprobantes} compacto />
  if (pago.anulado) return <span className="text-xs">—</span>
  return pago.formaRequiereReferencia ? (
    <Insignia color="rojo">Sin comprobante</Insignia>
  ) : (
    <Insignia color="ambar">Recibo pendiente</Insignia>
  )
}

/** Acciones de comprobante: imprimir recibo (efectivo) y adjuntar archivo. */
export function AccionesComprobante({ pago, onAdjuntar }) {
  if (pago.anulado) return null
  return (
    <>
      {!pago.formaRequiereReferencia && (
        <Link to={`/pagos/${pago.id}/recibo`} className={claseEnlace} title="Imprimir recibo para firma">
          <Receipt className="size-4" /> Recibo
        </Link>
      )}
      <Boton variante="fantasma" tamano="sm" icono={Paperclip} onClick={() => onAdjuntar(pago)}>
        Adjuntar
      </Boton>
    </>
  )
}
