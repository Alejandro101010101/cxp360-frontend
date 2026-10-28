import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { consulta } from '../api/cliente'
import { useApi } from '../hooks/useApi'
import { fecha, moneda } from '../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../utils/estilos'
import {
  AlertaError, Boton, Campo, Cargando, EncabezadoPagina, Entrada, EstadoFactura, Seleccion, Tarjeta, Vacio,
} from '../components/ui'

/** Ingresos por compra: consulta de facturas con filtros (RF-17). */
export default function Facturas() {
  const navegar = useNavigate()
  const [filtros, setFiltros] = useState({ proveedorId: '', estado: '', desde: '', hasta: '' })
  const { datos: proveedores } = useApi('/api/proveedores')
  const { datos, cargando, error } = useApi(`/api/facturas${consulta(filtros)}`)

  const cambiar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }))
  const totalSaldo = (datos ?? []).filter((f) => f.estado !== 'Anulada').reduce((s, f) => s + f.saldo, 0)

  return (
    <>
      <EncabezadoPagina
        titulo="Ingresos por compra"
        descripcion="Facturas de compra registradas, su saldo y su estado."
        acciones={<Boton icono={Plus} onClick={() => navegar('/facturas/nueva')}>Nueva factura</Boton>}
      />

      <Tarjeta sinRelleno>
        <div className="grid gap-4 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Proveedor">
            <Seleccion value={filtros.proveedorId} onChange={cambiar('proveedorId')}>
              <option value="">Todos</option>
              {(proveedores ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </Seleccion>
          </Campo>
          <Campo etiqueta="Estado">
            <Seleccion value={filtros.estado} onChange={cambiar('estado')}>
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Parcial">Parcial</option>
              <option value="Vencida">Vencida</option>
              <option value="Pagada">Pagada</option>
              <option value="Anulada">Anulada</option>
            </Seleccion>
          </Campo>
          <Campo etiqueta="Emitidas desde">
            <Entrada type="date" value={filtros.desde} onChange={cambiar('desde')} />
          </Campo>
          <Campo etiqueta="Hasta">
            <Entrada type="date" value={filtros.hasta} onChange={cambiar('hasta')} />
          </Campo>
        </div>

        {error && <AlertaError mensaje={error} className="m-4" />}
        {cargando && !datos ? (
          <Cargando />
        ) : datos?.length === 0 ? (
          <Vacio mensaje="No hay facturas con esos filtros." />
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
                {datos?.map((f) => (
                  <tr key={f.id} className={`${fila} cursor-pointer`} onClick={() => navegar(`/facturas/${f.id}`)}>
                    <td className={td}>
                      <Link to={`/facturas/${f.id}`} className="font-medium text-slate-900 hover:text-orange-700">
                        {f.serie}-{f.numero}
                      </Link>
                    </td>
                    <td className={td}>{f.proveedorNombre}</td>
                    <td className={td}>{fecha(f.fechaEmision)}</td>
                    <td className={td}>{fecha(f.fechaVencimiento)}</td>
                    <td className={tdDerecha}>{moneda(f.total)}</td>
                    <td className={`${tdDerecha} font-semibold text-slate-900`}>{f.estado === 'Anulada' ? '—' : moneda(f.saldo)}</td>
                    <td className={td}>
                      <EstadoFactura estado={f.estado} vencida={f.vencida} dias={f.diasVencida} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className={`${td} font-semibold`} colSpan={5}>{datos?.length} factura(s)</td>
                  <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(totalSaldo)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Tarjeta>
    </>
  )
}
