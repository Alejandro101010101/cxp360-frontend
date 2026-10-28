import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, Plus } from 'lucide-react'
import { api, consulta } from '../api/cliente'
import { useApi } from '../hooks/useApi'
import { useAvisos } from '../hooks/useAvisos'
import { fecha, moneda } from '../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../utils/estilos'
import { ModalAnular } from '../components/ModalAnular'
import { ModalPago } from '../components/ModalPago'
import { ModalAdjuntar } from '../components/ModalAdjuntar'
import { AccionesComprobante, CeldaComprobantes } from '../components/ComprobantesPago'
import {
  AlertaError, Boton, Campo, Cargando, Casilla, EncabezadoPagina, Entrada, Insignia, Seleccion, Tarjeta, Vacio,
} from '../components/ui'

/** Movimientos de pagos: consulta, registro y anulación (RF-20 a RF-24). */
export default function Pagos() {
  const avisos = useAvisos()
  const [filtros, setFiltros] = useState({ proveedorId: '', desde: '', hasta: '', incluirAnulados: false })
  const [registrando, setRegistrando] = useState(false)
  const [pagoAAnular, setPagoAAnular] = useState(null)
  const [pagoAAdjuntar, setPagoAAdjuntar] = useState(null)
  const { datos: proveedores } = useApi('/api/proveedores')
  const { datos, cargando, error, recargar } = useApi(`/api/pagos${consulta(filtros)}`)

  const cambiar = (campo) => (e) =>
    setFiltros((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const total = (datos ?? []).filter((p) => !p.anulado).reduce((s, p) => s + p.monto, 0)

  const anular = async (motivo) => {
    const pago = await api.put(`/api/pagos/${pagoAAnular.id}/anular`, { motivo })
    avisos.exito(`Pago anulado. La factura ${pago.facturaSerie}-${pago.facturaNumero} vuelve a tener saldo de ${moneda(pago.saldoFactura)}.`)
    recargar()
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Pagos"
        descripcion="Pagos totales y parciales aplicados a las facturas de los proveedores."
        acciones={<Boton icono={Plus} onClick={() => setRegistrando(true)}>Registrar pago</Boton>}
      />

      <Tarjeta sinRelleno>
        <div className="grid items-end gap-4 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Proveedor">
            <Seleccion value={filtros.proveedorId} onChange={cambiar('proveedorId')}>
              <option value="">Todos</option>
              {(proveedores ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </Seleccion>
          </Campo>
          <Campo etiqueta="Desde">
            <Entrada type="date" value={filtros.desde} onChange={cambiar('desde')} />
          </Campo>
          <Campo etiqueta="Hasta">
            <Entrada type="date" value={filtros.hasta} onChange={cambiar('hasta')} />
          </Campo>
          <Casilla etiqueta="Incluir anulados" checked={filtros.incluirAnulados} onChange={cambiar('incluirAnulados')} className="pb-2" />
        </div>

        {error && <AlertaError mensaje={error} className="m-4" />}
        {cargando && !datos ? (
          <Cargando />
        ) : datos?.length === 0 ? (
          <Vacio mensaje="No hay pagos con esos filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className={tabla}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Fecha</th>
                  <th className={th}>Factura</th>
                  <th className={th}>Forma de pago</th>
                  <th className={th}>Registrado por</th>
                  <th className={th}>Estado</th>
                  <th className={th}>Comprobante</th>
                  <th className={thDerecha}>Monto</th>
                  <th className={thDerecha} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datos?.map((p) => (
                  <tr key={p.id} className={`${fila} ${p.anulado ? 'text-slate-400' : ''}`}>
                    <td className={td}>{fecha(p.fechaPago)}</td>
                    <td className={td}>
                      <Link to={`/facturas/${p.facturaId}`} className="font-medium text-slate-900 hover:text-orange-700">
                        {p.facturaSerie}-{p.facturaNumero}
                      </Link>
                      <p className="text-xs text-slate-500">{p.proveedorNombre}</p>
                    </td>
                    <td className={td}>
                      {p.formaPago}
                      {p.numeroReferencia && <p className="text-xs text-slate-500">No. {p.numeroReferencia} · {p.banco}</p>}
                    </td>
                    <td className={td}>{p.usuarioRegistro}</td>
                    <td className={td}>
                      {p.anulado ? <Insignia color="gris">Anulado</Insignia> : <Insignia color="verde">Aplicado</Insignia>}
                    </td>
                    <td className={td}><CeldaComprobantes pago={p} /></td>
                    <td className={`${tdDerecha} ${p.anulado ? 'line-through' : 'font-medium text-slate-900'}`}>{moneda(p.monto)}</td>
                    <td className={td}>
                      <div className="flex items-center justify-end gap-1">
                        <AccionesComprobante pago={p} onAdjuntar={setPagoAAdjuntar} />
                        {!p.anulado && (
                          <Boton variante="fantasma" tamano="sm" icono={Ban} onClick={() => setPagoAAnular(p)}>Anular</Boton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className={`${td} font-semibold`} colSpan={6}>Total pagado (sin anulados)</td>
                  <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Tarjeta>

      {registrando && <ModalPago onCerrar={() => setRegistrando(false)} onRegistrado={recargar} />}

      {pagoAAdjuntar && (
        <ModalAdjuntar
          titulo={`Comprobante del pago de ${moneda(pagoAAdjuntar.monto)}`}
          descripcion={
            pagoAAdjuntar.formaRequiereReferencia
              ? `Voucher o constancia de ${pagoAAdjuntar.formaPago.toLowerCase()} No. ${pagoAAdjuntar.numeroReferencia}.`
              : 'Foto o escaneo del recibo firmado por el proveedor.'
          }
          ruta={`/api/pagos/${pagoAAdjuntar.id}/comprobantes`}
          onCerrar={() => setPagoAAdjuntar(null)}
          onAgregado={recargar}
        />
      )}

      <ModalAnular
        abierto={Boolean(pagoAAnular)}
        titulo="Anular pago"
        descripcion={pagoAAnular ? `Se anulará el pago de ${moneda(pagoAAnular.monto)} a la factura ${pagoAAnular.facturaSerie}-${pagoAAnular.facturaNumero} y se restaurará su saldo.` : ''}
        onCerrar={() => setPagoAAnular(null)}
        onConfirmar={anular}
      />
    </>
  )
}
