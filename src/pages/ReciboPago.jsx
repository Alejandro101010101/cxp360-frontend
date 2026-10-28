import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { fecha, fechaHora, moneda } from '../utils/formato'
import { montoEnLetras } from '../utils/montoEnLetras'
import { AlertaError, Boton, Cargando, EncabezadoPagina } from '../components/ui'

/**
 * Recibo imprimible de un pago en efectivo (RF-36).
 * Se imprime, lo firma quien recibe el dinero y luego se adjunta escaneado al pago.
 */
export default function ReciboPago() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { datos: pago, cargando, error } = useApi(`/api/pagos/${id}`)
  const { datos: empresa } = useApi('/api/configuracion')

  if (cargando && !pago) return <Cargando />
  if (error && !pago) return <AlertaError mensaje={error} />
  if (!pago || !empresa) return <Cargando />

  return (
    <>
      <div className="print:hidden">
        <EncabezadoPagina
          titulo={`Recibo de pago No. ${pago.id}`}
          descripcion="Imprímalo, hágalo firmar por quien recibe el efectivo y adjunte la foto o el escaneo al pago."
          acciones={
            <>
              <Boton variante="secundario" icono={ArrowLeft} onClick={() => navegar(-1)}>Volver</Boton>
              <Boton icono={Printer} onClick={() => window.print()}>Imprimir</Boton>
            </>
          }
        />
        {pago.anulado && <AlertaError mensaje="Este pago está ANULADO; el recibo no tiene validez." className="mb-4" />}
      </div>

      <article className="mx-auto max-w-3xl rounded-xl bg-white p-8 ring-1 ring-slate-200 print:max-w-none print:p-0 print:ring-0">
        <header className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <p className="text-lg font-bold text-slate-900">{empresa.nombre}</p>
            <p className="text-xs text-slate-600">NIT {empresa.nit}</p>
            <p className="text-xs text-slate-600">{empresa.direccion} · Tel. {empresa.telefono}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tracking-wide text-slate-900">RECIBO DE PAGO</p>
            <p className="text-sm text-slate-700">No. <span className="font-semibold">{String(pago.id).padStart(6, '0')}</span></p>
            <p className="text-sm text-slate-700">Fecha: {fecha(pago.fechaPago)}</p>
          </div>
        </header>

        {pago.anulado && (
          <p className="mt-4 rounded border-2 border-red-600 py-1 text-center text-lg font-bold tracking-widest text-red-600">ANULADO</p>
        )}

        <dl className="mt-6 space-y-3 text-sm">
          <Fila etiqueta="Recibí de">{empresa.nombre}</Fila>
          <Fila etiqueta="Proveedor">{pago.proveedorNombre}</Fila>
          <Fila etiqueta="La cantidad de">
            <span className="font-semibold">{montoEnLetras(pago.monto)}</span>
          </Fila>
          <Fila etiqueta="Por concepto de">
            Pago de la factura {pago.facturaSerie}-{pago.facturaNumero}, en {pago.formaPago.toLowerCase()}.
          </Fila>
        </dl>

        <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
          <span className="text-sm font-medium text-slate-600">Total recibido</span>
          <span className="text-2xl font-bold text-slate-900 tabular">{moneda(pago.monto)}</span>
        </div>

        <section className="mt-20 grid grid-cols-2 gap-12 text-center text-sm">
          <div>
            <div className="border-t border-slate-900 pt-2 font-medium">Entregado por</div>
            <p className="text-xs text-slate-600">{pago.usuarioRegistro} · {empresa.nombre}</p>
          </div>
          <div>
            <div className="border-t border-slate-900 pt-2 font-medium">Recibido por (firma)</div>
            <div className="mt-4 space-y-3 text-left text-xs text-slate-600">
              <p>Nombre: ______________________________</p>
              <p>DPI: _________________________________</p>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          Registrado en CxP360 por {pago.usuarioRegistro} el {fechaHora(pago.fechaRegistro)}. Este recibo debe
          adjuntarse firmado al pago No. {pago.id}.
        </footer>
      </article>
    </>
  )
}

function Fila({ etiqueta, children }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 border-b border-dotted border-slate-300 pb-2">
      <dt className="text-slate-500">{etiqueta}:</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  )
}
