import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Plus, Save, Trash2, XCircle } from 'lucide-react'
import { api } from '../api/cliente'
import { useApi } from '../hooks/useApi'
import { useAvisos } from '../hooks/useAvisos'
import { fecha, hoyISO, moneda, redondear, sumarDias } from '../utils/formato'
import { tabla, td, th, thDerecha } from '../utils/estilos'
import { SelectorArchivo } from '../components/SelectorArchivo'
import {
  AlertaError, Boton, Campo, Cargando, EncabezadoPagina, Entrada, Seleccion, Tarjeta,
} from '../components/ui'

let siguienteLinea = 1
const lineaVacia = () => ({ clave: siguienteLinea++, descripcion: '', cantidad: '', precioUnitario: '' })

/**
 * Registro de una factura de compra con su detalle (RF-14).
 * Muestra en vivo el total, la base, el IVA (RN-14) y el vencimiento (RN-13);
 * la API vuelve a calcularlos y valida todo antes de guardar.
 */
export default function NuevaFactura() {
  const navegar = useNavigate()
  const avisos = useAvisos()
  const { datos: proveedores, cargando } = useApi('/api/proveedores?soloActivos=true')
  const { datos: config } = useApi('/api/configuracion')

  const [proveedorId, setProveedorId] = useState('')
  const [serie, setSerie] = useState('')
  const [numero, setNumero] = useState('')
  const [fechaEmision, setFechaEmision] = useState(hoyISO())
  const [lineas, setLineas] = useState(() => [lineaVacia()])
  const [totalDocumento, setTotalDocumento] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const proveedor = (proveedores ?? []).find((p) => String(p.id) === proveedorId)
  const porcentajeIva = config?.porcentajeIva ?? 12

  // Cálculos en pantalla (la API hace el cálculo oficial)
  const subtotales = lineas.map((l) => redondear(redondear(l.cantidad) * redondear(l.precioUnitario)))
  const total = redondear(subtotales.reduce((s, x) => s + x, 0))
  const base = redondear(total / (1 + porcentajeIva / 100))
  const iva = redondear(total - base)
  const vencimiento = proveedor ? sumarDias(fechaEmision, proveedor.diasCredito) : null

  // RN-35: el total de las líneas debe coincidir con el total impreso en la factura
  const totalDoc = totalDocumento === '' ? null : redondear(totalDocumento)
  const cuadra = totalDoc !== null && totalDoc === total && total > 0

  const cambiarLinea = (clave, campo, valor) =>
    setLineas((ls) => ls.map((l) => (l.clave === clave ? { ...l, [campo]: valor } : l)))
  const quitarLinea = (clave) => setLineas((ls) => (ls.length > 1 ? ls.filter((l) => l.clave !== clave) : ls))

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)

    // Validaciones en pantalla (primera capa, RF-32)
    if (!proveedor) return setError('Seleccione el proveedor.')
    if (!serie.trim() || !numero.trim()) return setError('La serie y el número de factura son obligatorios.')
    if (fechaEmision > hoyISO()) return setError('La fecha de emisión no puede ser posterior a hoy.')
    const incompleta = lineas.findIndex((l) => !l.descripcion.trim() || !(Number(l.cantidad) > 0) || !(Number(l.precioUnitario) > 0))
    if (incompleta >= 0) return setError(`La línea ${incompleta + 1} está incompleta: descripción, cantidad y precio mayor a cero.`)
    if (totalDoc === null) return setError('Escriba el total que aparece impreso en la factura.')
    if (!cuadra) return setError(`La suma de las líneas (${moneda(total)}) no coincide con el total de la factura (${moneda(totalDoc)}). Revise cantidades y precios.`)
    if (!comprobante) return setError('Adjunte la foto o el PDF de la factura.')

    setGuardando(true)
    try {
      const factura = await api.post('/api/facturas', {
        proveedorId: proveedor.id,
        serie: serie.trim(),
        numero: numero.trim(),
        fechaEmision,
        lineas: lineas.map((l) => ({
          descripcion: l.descripcion.trim(),
          cantidad: redondear(l.cantidad),
          precioUnitario: redondear(l.precioUnitario),
        })),
        totalDocumento: totalDoc,
        comprobante,
      })
      avisos.exito(`Factura ${factura.serie}-${factura.numero} registrada por ${moneda(factura.total)}.`)
      navegar(`/facturas/${factura.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  if (cargando && !proveedores) return <Cargando />

  return (
    <form onSubmit={guardar}>
      <EncabezadoPagina
        titulo="Nueva factura de compra"
        descripcion="Los precios se ingresan con IVA incluido, tal como aparecen en la factura del proveedor."
        acciones={
          <>
            <Boton variante="secundario" icono={ArrowLeft} onClick={() => navegar('/facturas')}>Volver</Boton>
            <Boton type="submit" icono={Save} cargando={guardando}>Guardar factura</Boton>
          </>
        }
      />

      <AlertaError mensaje={error} className="mb-4" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Datos de la factura" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Proveedor" requerido className="sm:col-span-2">
              <Seleccion value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
                <option value="">Seleccione un proveedor activo…</option>
                {(proveedores ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} · NIT {p.nit} · {p.diasCredito === 0 ? 'contado' : `${p.diasCredito} días`}
                  </option>
                ))}
              </Seleccion>
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo etiqueta="Serie" requerido>
                <Entrada value={serie} onChange={(e) => setSerie(e.target.value)} maxLength={10} />
              </Campo>
              <Campo etiqueta="Número" requerido>
                <Entrada value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={20} />
              </Campo>
            </div>
            <Campo
              etiqueta="Fecha de emisión"
              requerido
              ayuda={vencimiento ? `Vence el ${fecha(vencimiento)} (${proveedor.diasCredito} días de crédito)` : null}
            >
              <Entrada type="date" value={fechaEmision} max={hoyISO()} onChange={(e) => setFechaEmision(e.target.value)} />
            </Campo>
          </div>
        </Tarjeta>

        <Tarjeta titulo="Totales">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Base imponible</dt>
              <dd className="tabular">{moneda(base)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">IVA ({porcentajeIva} %)</dt>
              <dd className="tabular">{moneda(iva)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total de las líneas</dt>
              <dd className="font-bold text-slate-900 tabular">{moneda(total)}</dd>
            </div>
          </dl>

          {/* RN-35: verificación contra el documento */}
          <Campo etiqueta="Total según la factura (Q)" requerido className="mt-4" ayuda="Escríbalo tal como aparece impreso en el documento.">
            <Entrada type="number" step="0.01" min="0" className="text-right" value={totalDocumento} onChange={(e) => setTotalDocumento(e.target.value)} />
          </Campo>
          {totalDoc !== null && (
            <p className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${cuadra ? 'text-emerald-700' : 'text-red-700'}`}>
              {cuadra ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {cuadra ? 'Coincide con la suma de las líneas' : `Diferencia de ${moneda(Math.abs(total - totalDoc))}`}
            </p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Factura escaneada" descripcion="Evidencia del documento original (obligatoria)." className="lg:col-span-3">
          <SelectorArchivo
            valor={comprobante}
            onCambio={setComprobante}
            requerido
            etiqueta="Foto o PDF de la factura"
            ayuda="JPG, PNG o PDF · máximo 2 MB. Debe verse el número, la fecha y el total."
          />
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Detalle de productos"
        className="mt-6"
        sinRelleno
        acciones={
          <Boton variante="secundario" tamano="sm" icono={Plus} onClick={() => setLineas((ls) => [...ls, lineaVacia()])}>
            Agregar línea
          </Boton>
        }
      >
        <div className="overflow-x-auto">
          <table className={tabla}>
            <thead className="bg-slate-50">
              <tr>
                <th className={`${th} w-10`}>#</th>
                <th className={th}>Descripción</th>
                <th className={`${thDerecha} w-32`}>Cantidad</th>
                <th className={`${thDerecha} w-40`}>Precio unitario</th>
                <th className={`${thDerecha} w-36`}>Subtotal</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineas.map((l, i) => (
                <tr key={l.clave}>
                  <td className={`${td} text-slate-400`}>{i + 1}</td>
                  <td className="px-2 py-2">
                    <Entrada
                      value={l.descripcion}
                      onChange={(e) => cambiarLinea(l.clave, 'descripcion', e.target.value)}
                      placeholder="Ej. Cemento UGC 42.5 kg"
                      maxLength={200}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Entrada type="number" step="0.01" min="0" className="text-right" value={l.cantidad} onChange={(e) => cambiarLinea(l.clave, 'cantidad', e.target.value)} />
                  </td>
                  <td className="px-2 py-2">
                    <Entrada type="number" step="0.01" min="0" className="text-right" value={l.precioUnitario} onChange={(e) => cambiarLinea(l.clave, 'precioUnitario', e.target.value)} />
                  </td>
                  <td className={`${td} text-right font-medium tabular`}>{moneda(subtotales[i])}</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => quitarLinea(l.clave)}
                      disabled={lineas.length === 1}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      title="Quitar línea"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </form>
  )
}
