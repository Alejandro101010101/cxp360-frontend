import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { fecha, moneda } from '../../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../../utils/estilos'
import { EncabezadoReporte } from '../../components/EncabezadoReporte'
import { AlertaError, Cargando, EncabezadoPagina, Tarjeta, Vacio } from '../../components/ui'
import { BarraReporte } from './BarraReporte'

/** Rangos de antigüedad según los días desde el vencimiento (RN-29). */
const RANGOS = [
  { clave: 'porVencer', titulo: 'Por vencer', color: 'bg-emerald-500' },
  { clave: 'de1a30', titulo: '1 – 30 días', color: 'bg-amber-400' },
  { clave: 'de31a60', titulo: '31 – 60 días', color: 'bg-orange-500' },
  { clave: 'de61a90', titulo: '61 – 90 días', color: 'bg-red-500' },
  { clave: 'masDe90', titulo: 'Más de 90 días', color: 'bg-red-800' },
]

/** Reporte de antigüedad de saldos (RF-27). */
export default function Antiguedad() {
  const { datos: r, cargando, error } = useApi('/api/reportes/antiguedad-saldos')

  return (
    <>
      <EncabezadoPagina
        titulo="Antigüedad de saldos"
        descripcion="Saldo pendiente de cada proveedor clasificado por los días transcurridos desde el vencimiento."
      />

      <BarraReporte puedeImprimir={Boolean(r)}>
        {r && <p className="pb-2 text-sm text-slate-600">Fecha de corte: <span className="font-medium text-slate-900">{fecha(r.fechaCorte)}</span></p>}
      </BarraReporte>

      {error ? (
        <AlertaError mensaje={error} />
      ) : cargando || !r ? (
        <Cargando />
      ) : (
        <>
          <EncabezadoReporte encabezado={r.encabezado} subtitulo={`Fecha de corte: ${fecha(r.fechaCorte)}`} />

          {/* Distribución del total por rango */}
          <Tarjeta titulo="Distribución del saldo" className="mb-6">
            {r.totales.total === 0 ? (
              <Vacio mensaje="No hay saldos pendientes." />
            ) : (
              <>
                <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
                  {RANGOS.map((g) =>
                    r.totales[g.clave] > 0 ? (
                      <div key={g.clave} className={g.color} style={{ width: `${(r.totales[g.clave] / r.totales.total) * 100}%` }} title={g.titulo} />
                    ) : null,
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {RANGOS.map((g) => (
                    <div key={g.clave} className="flex items-start gap-2">
                      <span className={`mt-1 size-3 shrink-0 rounded-sm ${g.color}`} />
                      <div>
                        <p className="text-xs text-slate-500">{g.titulo}</p>
                        <p className="text-sm font-semibold text-slate-900 tabular">{moneda(r.totales[g.clave])}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Tarjeta>

          <Tarjeta sinRelleno>
            {r.proveedores.length === 0 ? (
              <Vacio mensaje="No hay saldos pendientes." />
            ) : (
              <div className="overflow-x-auto">
                <table className={tabla}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={th}>Proveedor</th>
                      {RANGOS.map((g) => (
                        <th key={g.clave} className={thDerecha}>{g.titulo}</th>
                      ))}
                      <th className={thDerecha}>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {r.proveedores.map((p) => (
                      <tr key={p.proveedorId} className={fila}>
                        <td className={td}>
                          <Link to={`/reportes/estado-cuenta?proveedorId=${p.proveedorId}`} className="font-medium text-slate-900 hover:text-orange-700">
                            {p.proveedor}
                          </Link>
                          <p className="text-xs text-slate-500">NIT {p.proveedorNit}</p>
                        </td>
                        {RANGOS.map((g) => (
                          <td key={g.clave} className={`${tdDerecha} ${p[g.clave] ? 'text-slate-900' : 'text-slate-300'}`}>
                            {p[g.clave] ? moneda(p[g.clave]) : '—'}
                          </td>
                        ))}
                        <td className={`${tdDerecha} font-semibold text-slate-900`}>{moneda(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className={`${td} font-bold`}>TOTAL</td>
                      {RANGOS.map((g) => (
                        <td key={g.clave} className={`${tdDerecha} font-semibold`}>{moneda(r.totales[g.clave])}</td>
                      ))}
                      <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(r.totales.total)}</td>
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
