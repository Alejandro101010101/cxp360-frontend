import { useSearchParams } from 'react-router-dom'
import { consulta } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { fecha, hoyISO, moneda, primerDiaMesISO } from '../../utils/formato'
import { tabla, td, tdDerecha, th, thDerecha } from '../../utils/estilos'
import { EncabezadoReporte } from '../../components/EncabezadoReporte'
import {
  AlertaError, Campo, Cargando, EncabezadoPagina, Entrada, Indicador, Insignia, Seleccion, Tarjeta, Vacio,
} from '../../components/ui'
import { BarraReporte } from './BarraReporte'

/**
 * Estado de cuenta por proveedor (RF-25).
 * RN-27: saldo inicial + cargos (facturas) − abonos (pagos) = saldo final.
 */
export default function EstadoCuenta() {
  const [params, setParams] = useSearchParams()
  const proveedorId = params.get('proveedorId') ?? ''
  const desde = params.get('desde') ?? primerDiaMesISO()
  const hasta = params.get('hasta') ?? hoyISO()

  const { datos: proveedores } = useApi('/api/proveedores')
  const { datos: r, cargando, error } = useApi(
    proveedorId ? `/api/reportes/estado-cuenta${consulta({ proveedorId, desde, hasta })}` : null,
  )

  const cambiar = (campo) => (e) => {
    const nuevos = new URLSearchParams(params)
    nuevos.set(campo, e.target.value)
    if (!nuevos.get('desde')) nuevos.set('desde', desde)
    if (!nuevos.get('hasta')) nuevos.set('hasta', hasta)
    setParams(nuevos, { replace: true })
  }

  return (
    <>
      <EncabezadoPagina titulo="Estado de cuenta" descripcion="Movimientos de un proveedor en un período, con su saldo acumulado." />

      <BarraReporte puedeImprimir={Boolean(r)}>
        <Campo etiqueta="Proveedor" className="min-w-72 flex-1">
          <Seleccion value={proveedorId} onChange={cambiar('proveedorId')}>
            <option value="">Seleccione un proveedor…</option>
            {(proveedores ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Desde">
          <Entrada type="date" value={desde} onChange={cambiar('desde')} />
        </Campo>
        <Campo etiqueta="Hasta">
          <Entrada type="date" value={hasta} onChange={cambiar('hasta')} />
        </Campo>
      </BarraReporte>

      {!proveedorId ? (
        <Tarjeta><Vacio mensaje="Seleccione un proveedor para ver su estado de cuenta." /></Tarjeta>
      ) : error ? (
        <AlertaError mensaje={error} />
      ) : cargando || !r ? (
        <Cargando />
      ) : (
        <>
          <EncabezadoReporte encabezado={r.encabezado} subtitulo={`Del ${fecha(r.desde)} al ${fecha(r.hasta)}`} />

          <Tarjeta className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Proveedor</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{r.proveedorNombre}</p>
                <p className="text-sm text-slate-500">
                  NIT {r.proveedorNit} · Crédito: {r.diasCredito === 0 ? 'contado' : `${r.diasCredito} días`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Período</p>
                <p className="mt-1 text-sm text-slate-900">{fecha(r.desde)} al {fecha(r.hasta)}</p>
              </div>
            </div>
          </Tarjeta>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
            <Indicador titulo="Saldo inicial" valor={moneda(r.saldoInicial)} detalle={`Al ${fecha(r.desde)}`} />
            <Indicador titulo="(+) Cargos" valor={moneda(r.totalCargos)} detalle="Facturas del período" />
            <Indicador titulo="(−) Abonos" valor={moneda(r.totalAbonos)} detalle="Pagos del período" />
            <Indicador titulo="Saldo final" valor={moneda(r.saldoFinal)} detalle={`Al ${fecha(r.hasta)}`} />
          </div>

          <Tarjeta titulo="Movimientos" sinRelleno>
            <div className="overflow-x-auto">
              <table className={tabla}>
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>Fecha</th>
                    <th className={th}>Tipo</th>
                    <th className={th}>Documento</th>
                    <th className={th}>Descripción</th>
                    <th className={th}>Registrado por</th>
                    <th className={thDerecha}>Cargo</th>
                    <th className={thDerecha}>Abono</th>
                    <th className={thDerecha}>Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/60">
                    <td className={td}>{fecha(r.desde)}</td>
                    <td className={td} colSpan={6}><span className="font-medium">Saldo inicial</span></td>
                    <td className={`${tdDerecha} font-semibold text-slate-900`}>{moneda(r.saldoInicial)}</td>
                  </tr>
                  {r.movimientos.length === 0 && (
                    <tr>
                      <td colSpan={8} className={`${td} py-8 text-center text-slate-500`}>Sin movimientos en el período.</td>
                    </tr>
                  )}
                  {r.movimientos.map((m, i) => (
                    <tr key={i}>
                      <td className={td}>{fecha(m.fecha)}</td>
                      <td className={td}>
                        <Insignia color={m.tipo === 'Factura' ? 'naranja' : 'verde'}>{m.tipo}</Insignia>
                      </td>
                      <td className={`${td} font-medium`}>{m.documento}</td>
                      <td className={td}>{m.descripcion}</td>
                      <td className={`${td} whitespace-nowrap text-slate-500`}>{m.registradoPor}</td>
                      <td className={tdDerecha}>{m.cargo ? moneda(m.cargo) : ''}</td>
                      <td className={tdDerecha}>{m.abono ? moneda(m.abono) : ''}</td>
                      <td className={`${tdDerecha} font-medium text-slate-900`}>{moneda(m.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className={`${td} font-semibold`} colSpan={5}>Totales del período</td>
                    <td className={`${tdDerecha} font-semibold`}>{moneda(r.totalCargos)}</td>
                    <td className={`${tdDerecha} font-semibold`}>{moneda(r.totalAbonos)}</td>
                    <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(r.saldoFinal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Tarjeta>
        </>
      )}
    </>
  )
}
