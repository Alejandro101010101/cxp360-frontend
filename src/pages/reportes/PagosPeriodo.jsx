import { useState } from 'react'
import { Link } from 'react-router-dom'
import { consulta } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { fecha, fechaHora, hoyISO, moneda, primerDiaMesISO } from '../../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../../utils/estilos'
import { EncabezadoReporte } from '../../components/EncabezadoReporte'
import {
  AlertaError, Campo, Cargando, EncabezadoPagina, Entrada, Indicador, Seleccion, Tarjeta, Vacio,
} from '../../components/ui'
import { BarraReporte } from './BarraReporte'

/** Reporte de pagos realizados por período (RF-28). */
export default function PagosPeriodo() {
  const [filtros, setFiltros] = useState({ desde: primerDiaMesISO(), hasta: hoyISO(), proveedorId: '', formaPagoId: '' })
  const { datos: proveedores } = useApi('/api/proveedores')
  const { datos: formas } = useApi('/api/formas-pago')
  const { datos: r, cargando, error } = useApi(`/api/reportes/pagos${consulta(filtros)}`)

  const cambiar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }))
  const proveedor = (proveedores ?? []).find((p) => String(p.id) === filtros.proveedorId)

  return (
    <>
      <EncabezadoPagina titulo="Pagos por período" descripcion="Pagos aplicados a facturas en un rango de fechas, con totales por forma de pago." />

      <BarraReporte puedeImprimir={Boolean(r)}>
        <Campo etiqueta="Desde">
          <Entrada type="date" value={filtros.desde} onChange={cambiar('desde')} />
        </Campo>
        <Campo etiqueta="Hasta">
          <Entrada type="date" value={filtros.hasta} onChange={cambiar('hasta')} />
        </Campo>
        <Campo etiqueta="Proveedor" className="min-w-60">
          <Seleccion value={filtros.proveedorId} onChange={cambiar('proveedorId')}>
            <option value="">Todos</option>
            {(proveedores ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Forma de pago">
          <Seleccion value={filtros.formaPagoId} onChange={cambiar('formaPagoId')}>
            <option value="">Todas</option>
            {(formas ?? []).map((f) => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </Seleccion>
        </Campo>
      </BarraReporte>

      {error ? (
        <AlertaError mensaje={error} />
      ) : cargando || !r ? (
        <Cargando />
      ) : (
        <>
          <EncabezadoReporte
            encabezado={r.encabezado}
            subtitulo={`Del ${fecha(r.desde)} al ${fecha(r.hasta)}${proveedor ? ` · ${proveedor.nombre}` : ''}`}
          />

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
            <Indicador titulo="Total pagado" valor={moneda(r.total)} detalle={`${r.cantidad} pago(s)`} />
            {r.porFormaPago.map((g) => (
              <Indicador key={g.formaPago} titulo={g.formaPago} valor={moneda(g.total)} detalle={`${g.cantidad} pago(s)`} />
            ))}
          </div>

          <Tarjeta sinRelleno>
            {r.pagos.length === 0 ? (
              <Vacio mensaje="No hay pagos en el período." />
            ) : (
              <div className="overflow-x-auto">
                <table className={tabla}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={th}>Fecha</th>
                      <th className={th}>Proveedor</th>
                      <th className={th}>Factura</th>
                      <th className={th}>Forma de pago</th>
                      <th className={th}>Registrado por</th>
                      <th className={thDerecha}>Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {r.pagos.map((p) => (
                      <tr key={p.id} className={fila}>
                        <td className={td}>{fecha(p.fechaPago)}</td>
                        <td className={td}>{p.proveedorNombre}</td>
                        <td className={td}>
                          <Link to={`/facturas/${p.facturaId}`} className="font-medium text-slate-900 hover:text-orange-700">
                            {p.facturaSerie}-{p.facturaNumero}
                          </Link>
                        </td>
                        <td className={td}>
                          {p.formaPago}
                          {p.numeroReferencia && <span className="text-slate-500"> · No. {p.numeroReferencia} ({p.banco})</span>}
                        </td>
                        <td className={`${td} whitespace-nowrap text-slate-500`}>
                          {p.usuarioRegistro}
                          <p className="text-xs">{fechaHora(p.fechaRegistro)}</p>
                        </td>
                        <td className={`${tdDerecha} font-medium text-slate-900`}>{moneda(p.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className={`${td} font-semibold`} colSpan={5}>Total</td>
                      <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(r.total)}</td>
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
