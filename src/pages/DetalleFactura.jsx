import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, Paperclip, Printer, Wallet } from 'lucide-react'
import { api } from '../api/cliente'
import { useApi } from '../hooks/useApi'
import { useAvisos } from '../hooks/useAvisos'
import { fecha, fechaHora, moneda, numero } from '../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../utils/estilos'
import { ModalAnular } from '../components/ModalAnular'
import { ModalPago } from '../components/ModalPago'
import { ModalAdjuntar } from '../components/ModalAdjuntar'
import { ListaComprobantes } from '../components/ListaComprobantes'
import { AccionesComprobante, CeldaComprobantes } from '../components/ComprobantesPago'
import {
  AlertaError, Boton, Cargando, EncabezadoPagina, EstadoFactura, Insignia, Tarjeta, Vacio,
} from '../components/ui'

/** Detalle de una factura con su historial de pagos (RF-18). */
export default function DetalleFactura() {
  const { id } = useParams()
  const navegar = useNavigate()
  const avisos = useAvisos()
  const { datos: f, cargando, error, recargar } = useApi(`/api/facturas/${id}`)
  const [pagando, setPagando] = useState(false)
  const [anulandoFactura, setAnulandoFactura] = useState(false)
  const [pagoAAnular, setPagoAAnular] = useState(null)
  const [adjuntando, setAdjuntando] = useState(null) // { titulo, descripcion, ruta }

  if (cargando && !f) return <Cargando />
  if (error && !f) return <AlertaError mensaje={error} />

  const abierta = f.estado === 'Pendiente' || f.estado === 'Parcial'
  const porcentajePagado = f.total > 0 ? Math.min(100, (f.totalPagado / f.total) * 100) : 0

  const anularFactura = async (motivo) => {
    await api.put(`/api/facturas/${f.id}/anular`, { motivo })
    avisos.exito(`Factura ${f.serie}-${f.numero} anulada.`)
    recargar()
  }

  const anularPago = async (motivo) => {
    const pago = await api.put(`/api/pagos/${pagoAAnular.id}/anular`, { motivo })
    avisos.exito(`Pago anulado. El saldo volvió a ${moneda(pago.saldoFactura)}.`)
    recargar()
  }

  const adjuntarAPago = (p) =>
    setAdjuntando({
      titulo: `Comprobante del pago de ${moneda(p.monto)}`,
      descripcion: p.formaRequiereReferencia
        ? `Voucher o constancia de ${p.formaPago.toLowerCase()} No. ${p.numeroReferencia}.`
        : 'Foto o escaneo del recibo firmado por el proveedor.',
      ruta: `/api/pagos/${p.id}/comprobantes`,
    })

  return (
    <>
      <EncabezadoPagina
        titulo={`Factura ${f.serie}-${f.numero}`}
        descripcion={`${f.proveedorNombre} · NIT ${f.proveedorNit}`}
        acciones={
          <>
            <Boton variante="secundario" icono={ArrowLeft} onClick={() => navegar('/facturas')}>Volver</Boton>
            <Boton variante="secundario" icono={Printer} onClick={() => window.print()}>Imprimir</Boton>
            {f.estado !== 'Anulada' && (
              <Boton variante="secundario" icono={Ban} onClick={() => setAnulandoFactura(true)} className="text-red-700">
                Anular
              </Boton>
            )}
            {abierta && <Boton icono={Wallet} onClick={() => setPagando(true)}>Registrar pago</Boton>}
          </>
        }
      />

      {/* Título solo para la versión impresa */}
      <h1 className="mb-4 hidden text-xl font-bold print:block">
        Factura {f.serie}-{f.numero} · {f.proveedorNombre}
      </h1>

      {f.estado === 'Anulada' && (
        <div className="mb-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-700 ring-1 ring-slate-300">
          <p className="font-semibold">Factura anulada</p>
          <p className="mt-1">
            Motivo: {f.motivoAnulacion} · Por {f.usuarioAnulacion} el {fechaHora(f.fechaAnulacion)}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Información" className="lg:col-span-2">
          <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <Dato etiqueta="Estado"><EstadoFactura estado={f.estado} vencida={f.vencida} dias={f.diasVencida} /></Dato>
            <Dato etiqueta="Fecha de emisión">{fecha(f.fechaEmision)}</Dato>
            <Dato etiqueta="Fecha de vencimiento">{fecha(f.fechaVencimiento)}</Dato>
            <Dato etiqueta="Proveedor">{f.proveedorNombre}</Dato>
            <Dato etiqueta="Registrada por">{f.usuarioRegistro}</Dato>
            <Dato etiqueta="Fecha de registro">{fechaHora(f.fechaRegistro)}</Dato>
          </dl>
        </Tarjeta>

        <Tarjeta titulo="Saldo">
          <dl className="space-y-2 text-sm">
            <Linea etiqueta="Base imponible" valor={moneda(f.base)} />
            <Linea etiqueta="IVA" valor={moneda(f.iva)} />
            <Linea etiqueta="Total" valor={moneda(f.total)} fuerte />
            <Linea etiqueta="Pagado" valor={moneda(f.totalPagado)} />
          </dl>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${porcentajePagado}%` }} />
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-3">
            <span className="text-sm font-semibold text-slate-900">Saldo pendiente</span>
            <span className="text-xl font-bold text-slate-900 tabular">{f.estado === 'Anulada' ? '—' : moneda(f.saldo)}</span>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Factura escaneada"
        descripcion="Documento original del proveedor (RN-32). Haga clic para abrirlo."
        className="mt-6 print:hidden"
        acciones={
          f.estado !== 'Anulada' && (
            <Boton
              variante="secundario"
              tamano="sm"
              icono={Paperclip}
              onClick={() =>
                setAdjuntando({
                  titulo: `Agregar documento a ${f.serie}-${f.numero}`,
                  descripcion: 'Por ejemplo, la segunda página de la factura o una nota de crédito.',
                  ruta: `/api/facturas/${f.id}/comprobantes`,
                })
              }
            >
              Agregar
            </Boton>
          )
        }
      >
        {f.comprobantes.length === 0 ? (
          <p className="text-sm text-slate-500">Sin documentos adjuntos.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <ListaComprobantes comprobantes={f.comprobantes} />
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo="Detalle de productos" className="mt-6" sinRelleno>
        <div className="overflow-x-auto">
          <table className={tabla}>
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Descripción</th>
                <th className={thDerecha}>Cantidad</th>
                <th className={thDerecha}>Precio unitario</th>
                <th className={thDerecha}>Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {f.lineas.map((l) => (
                <tr key={l.id}>
                  <td className={td}>{l.descripcion}</td>
                  <td className={tdDerecha}>{numero(l.cantidad)}</td>
                  <td className={tdDerecha}>{moneda(l.precioUnitario)}</td>
                  <td className={`${tdDerecha} font-medium text-slate-900`}>{moneda(l.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Historial de pagos" className="mt-6" sinRelleno>
        {f.pagos.length === 0 ? (
          <Vacio mensaje="Esta factura no tiene pagos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className={tabla}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Fecha</th>
                  <th className={th}>Forma de pago</th>
                  <th className={th}>Registrado por</th>
                  <th className={th}>Estado</th>
                  <th className={`${th} print:hidden`}>Comprobante</th>
                  <th className={thDerecha}>Monto</th>
                  <th className={`${thDerecha} print:hidden`} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {f.pagos.map((p) => (
                  <tr key={p.id} className={`${fila} ${p.anulado ? 'text-slate-400' : ''}`}>
                    <td className={td}>{fecha(p.fechaPago)}</td>
                    <td className={td}>
                      {p.formaPago}
                      {p.numeroReferencia && <p className="text-xs text-slate-500">No. {p.numeroReferencia} · {p.banco}</p>}
                    </td>
                    <td className={td}>{p.usuarioRegistro}</td>
                    <td className={td}>
                      {p.anulado ? (
                        <span title={p.motivoAnulacion}><Insignia color="gris">Anulado</Insignia></span>
                      ) : (
                        <Insignia color="verde">Aplicado</Insignia>
                      )}
                      {p.anulado && <p className="mt-1 text-xs">{p.motivoAnulacion}</p>}
                    </td>
                    <td className={`${td} print:hidden`}><CeldaComprobantes pago={p} /></td>
                    <td className={`${tdDerecha} ${p.anulado ? 'line-through' : 'font-medium text-slate-900'}`}>{moneda(p.monto)}</td>
                    <td className={`${td} print:hidden`}>
                      <div className="flex items-center justify-end gap-1">
                        <AccionesComprobante pago={p} onAdjuntar={adjuntarAPago} />
                        {!p.anulado && (
                          <Boton variante="fantasma" tamano="sm" icono={Ban} onClick={() => setPagoAAnular(p)}>Anular</Boton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      {pagando && <ModalPago factura={f} onCerrar={() => setPagando(false)} onRegistrado={recargar} />}

      {adjuntando && <ModalAdjuntar {...adjuntando} onCerrar={() => setAdjuntando(null)} onAgregado={recargar} />}

      <ModalAnular
        abierto={anulandoFactura}
        titulo={`Anular factura ${f.serie}-${f.numero}`}
        descripcion="La factura dejará de contar en saldos y reportes. Solo se puede anular si no tiene pagos activos."
        onCerrar={() => setAnulandoFactura(false)}
        onConfirmar={anularFactura}
      />

      <ModalAnular
        abierto={Boolean(pagoAAnular)}
        titulo="Anular pago"
        descripcion={pagoAAnular ? `Se anulará el pago de ${moneda(pagoAAnular.monto)} del ${fecha(pagoAAnular.fechaPago)} y el saldo de la factura se restaurará.` : ''}
        onCerrar={() => setPagoAAnular(null)}
        onConfirmar={anularPago}
      />
    </>
  )
}

function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="mt-1 text-slate-900">{children}</dd>
    </div>
  )
}

function Linea({ etiqueta, valor, fuerte = false }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{etiqueta}</dt>
      <dd className={`tabular ${fuerte ? 'font-semibold text-slate-900' : ''}`}>{valor}</dd>
    </div>
  )
}
