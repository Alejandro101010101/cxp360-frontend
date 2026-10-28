import { useState } from 'react'
import { Link } from 'react-router-dom'
import { consulta } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { fecha, moneda } from '../../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../../utils/estilos'
import { EncabezadoReporte } from '../../components/EncabezadoReporte'
import {
  AlertaError, Campo, Cargando, Casilla, EncabezadoPagina, EstadoFactura, Indicador, Seleccion, Tarjeta, Vacio,
} from '../../components/ui'
import { BarraReporte } from './BarraReporte'

/** Reporte de facturas pendientes y vencidas (RF-26). */
export default function Pendientes() {
  const [proveedorId, setProveedorId] = useState('')
  const [soloVencidas, setSoloVencidas] = useState(false)
  const { datos: proveedores } = useApi('/api/proveedores')
  const { datos: r, cargando, error } = useApi(`/api/reportes/pendientes${consulta({ proveedorId, soloVencidas })}`)

  const proveedor = (proveedores ?? []).find((p) => String(p.id) === proveedorId)

  return (
    <>
      <EncabezadoPagina titulo="Facturas pendientes y vencidas" descripcion="Facturas con saldo por pagar, ordenadas por fecha de vencimiento." />

      <BarraReporte puedeImprimir={Boolean(r)}>
        <Campo etiqueta="Proveedor" className="min-w-72">
          <Seleccion value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
            <option value="">Todos</option>
            {(proveedores ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Seleccion>
        </Campo>
        <Casilla etiqueta="Solo vencidas" checked={soloVencidas} onChange={(e) => setSoloVencidas(e.target.checked)} className="pb-2" />
      </BarraReporte>

      {error ? (
        <AlertaError mensaje={error} />
      ) : cargando || !r ? (
        <Cargando />
      ) : (
        <>
          <EncabezadoReporte encabezado={r.encabezado} subtitulo={proveedor ? `Proveedor: ${proveedor.nombre}` : 'Todos los proveedores'} />

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
            <Indicador titulo="Facturas con saldo" valor={r.cantidad} />
            <Indicador titulo="Saldo total" valor={moneda(r.totalSaldo)} />
            <Indicador titulo="Facturas vencidas" valor={r.cantidadVencidas} />
            <Indicador titulo="Monto vencido" valor={moneda(r.totalVencido)} />
          </div>

          <Tarjeta sinRelleno>
            {r.facturas.length === 0 ? (
              <Vacio mensaje="No hay facturas pendientes." />
            ) : (
              <div className="overflow-x-auto">
                <table className={tabla}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={th}>Factura</th>
                      <th className={th}>Proveedor</th>
                      <th className={th}>Emisión</th>
                      <th className={th}>Vencimiento</th>
                      <th className={thDerecha}>Total</th>
                      <th className={thDerecha}>Saldo</th>
                      <th className={th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {r.facturas.map((f) => (
                      <tr key={f.id} className={fila}>
                        <td className={td}>
                          <Link to={`/facturas/${f.id}`} className="font-medium text-slate-900 hover:text-orange-700">{f.documento}</Link>
                        </td>
                        <td className={td}>
                          {f.proveedor}
                          <p className="text-xs text-slate-500">NIT {f.proveedorNit}</p>
                        </td>
                        <td className={td}>{fecha(f.fechaEmision)}</td>
                        <td className={td}>{fecha(f.fechaVencimiento)}</td>
                        <td className={tdDerecha}>{moneda(f.total)}</td>
                        <td className={`${tdDerecha} font-semibold text-slate-900`}>{moneda(f.saldo)}</td>
                        <td className={td}><EstadoFactura estado={f.estado} vencida={f.vencida} dias={f.diasVencida} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className={`${td} font-semibold`} colSpan={5}>Total</td>
                      <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(r.totalSaldo)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Tarjeta>
        </>
      )}
    </>
  )
}
