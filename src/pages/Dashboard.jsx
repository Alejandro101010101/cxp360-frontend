import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, CircleDollarSign, Truck, Wallet } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { fecha, moneda } from '../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../utils/estilos'
import { AlertaError, Cargando, EncabezadoPagina, Indicador, Insignia, Tarjeta, Vacio } from '../components/ui'

/** RF-04: panel de inicio con los indicadores clave. */
export default function Dashboard() {
  const { usuario } = useAuth()
  const { datos: d, cargando, error } = useApi('/api/dashboard')

  if (cargando && !d) return <Cargando />
  if (error && !d) return <AlertaError mensaje={error} />

  const maximo = Math.max(...d.mayoresSaldos.map((s) => s.saldo), 1)

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${usuario.nombreCompleto.split(' ')[0]}`}
        descripcion="Resumen de las obligaciones de Ferretería Los Esclavos con sus proveedores."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Total adeudado"
          valor={moneda(d.totalAdeudado)}
          detalle={`${d.facturasPendientes} factura(s) con saldo`}
          icono={CircleDollarSign}
          color="naranja"
        />
        <Indicador
          titulo="Facturas vencidas"
          valor={d.facturasVencidas}
          detalle={`${moneda(d.montoVencido)} vencido`}
          icono={AlertTriangle}
          color="rojo"
        />
        <Indicador
          titulo="Vencen en 7 días"
          valor={d.facturasPorVencer7Dias}
          detalle={`${moneda(d.montoPorVencer7Dias)} por pagar`}
          icono={CalendarClock}
          color="ambar"
        />
        <Indicador
          titulo="Pagado este mes"
          valor={moneda(d.pagadoMes)}
          detalle={`${d.pagosMes} pago(s) · ${d.proveedoresActivos} proveedores activos`}
          icono={Wallet}
          color="verde"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Tarjeta titulo="Facturas más vencidas" descripcion="Requieren atención inmediata" sinRelleno>
          {d.masVencidas.length === 0 ? (
            <Vacio mensaje="No hay facturas vencidas." />
          ) : (
            <TablaAlertas filas={d.masVencidas} vencidas />
          )}
        </Tarjeta>

        <Tarjeta titulo="Próximas a vencer" descripcion="Vencen en los próximos 7 días" sinRelleno>
          {d.proximasAVencer.length === 0 ? (
            <Vacio mensaje="Ninguna factura vence en los próximos 7 días." />
          ) : (
            <TablaAlertas filas={d.proximasAVencer} />
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Proveedores con mayor saldo" className="mt-6">
        {d.mayoresSaldos.length === 0 ? (
          <Vacio mensaje="No hay saldos pendientes con proveedores." />
        ) : (
          <ul className="space-y-4">
            {d.mayoresSaldos.map((s) => (
              <li key={s.proveedorId}>
                <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                  <Link to={`/reportes/estado-cuenta?proveedorId=${s.proveedorId}`} className="flex items-center gap-2 font-medium text-slate-700 hover:text-orange-700">
                    <Truck className="size-4 text-slate-400" />
                    {s.proveedor}
                  </Link>
                  <span className="font-semibold text-slate-900 tabular">{moneda(s.saldo)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-orange-500" style={{ width: `${(s.saldo / maximo) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </>
  )
}

function TablaAlertas({ filas, vencidas = false }) {
  return (
    <div className="overflow-x-auto">
      <table className={tabla}>
        <thead className="bg-slate-50">
          <tr>
            <th className={th}>Factura</th>
            <th className={th}>Vencimiento</th>
            <th className={thDerecha}>Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((f) => (
            <tr key={f.id} className={fila}>
              <td className={td}>
                <Link to={`/facturas/${f.id}`} className="font-medium text-slate-900 hover:text-orange-700">{f.documento}</Link>
                <p className="text-xs text-slate-500">{f.proveedor}</p>
              </td>
              <td className={td}>
                <p>{fecha(f.fechaVencimiento)}</p>
                {vencidas ? (
                  <Insignia color="rojo">{f.dias} día(s) de atraso</Insignia>
                ) : (
                  <Insignia color="ambar">{f.dias === 0 ? 'Vence hoy' : `En ${f.dias} día(s)`}</Insignia>
                )}
              </td>
              <td className={tdDerecha}>{moneda(f.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
