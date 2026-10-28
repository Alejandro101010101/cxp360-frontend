import { useMemo, useState } from 'react'
import { AlertTriangle, Info, Wallet } from 'lucide-react'
import { api } from '../api/cliente'
import { useApi } from '../hooks/useApi'
import { useAvisos } from '../hooks/useAvisos'
import { fecha, hoyISO, moneda, redondear } from '../utils/formato'
import { SelectorArchivo } from './SelectorArchivo'
import { AlertaError, Boton, Campo, Entrada, Modal, Seleccion } from './ui'

/**
 * Registro de un pago total o parcial (RF-20, RF-21).
 * - Si recibe "factura", el pago se aplica a esa factura.
 * - Si no, muestra la lista de facturas pendientes o parciales.
 * Maneja la confirmación de posible pago duplicado (RN-25).
 * El componente padre lo monta solo cuando debe mostrarse.
 */
export function ModalPago({ factura, onCerrar, onRegistrado }) {
  const avisos = useAvisos()
  const { datos: formas } = useApi('/api/formas-pago?soloActivas=true')
  const { datos: bancos } = useApi('/api/bancos?soloActivos=true')
  const { datos: facturas } = useApi(factura ? null : '/api/facturas')
  const { datos: config } = useApi('/api/configuracion')

  const [facturaId, setFacturaId] = useState(factura ? String(factura.id) : '')
  const [fechaPago, setFechaPago] = useState(hoyISO())
  const [monto, setMonto] = useState(factura ? String(factura.saldo) : '')
  const [formaPagoId, setFormaPagoId] = useState('')
  const [bancoId, setBancoId] = useState('')
  const [referencia, setReferencia] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [error, setError] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Facturas a las que se puede pagar (RN-21)
  const abiertas = useMemo(
    () => (facturas ?? []).filter((f) => f.estado === 'Pendiente' || f.estado === 'Parcial'),
    [facturas],
  )

  const seleccionada = factura ?? abiertas.find((f) => String(f.id) === facturaId)
  const forma = (formas ?? []).find((f) => String(f.id) === formaPagoId)
  const saldo = seleccionada ? Number(seleccionada.saldo) : 0
  const montoNumero = redondear(monto)
  const saldoDespues = redondear(saldo - montoNumero)
  const esEfectivo = forma && !forma.requiereReferencia
  const limiteEfectivo = config?.limitePagoEfectivo ?? null
  const superaLimite = esEfectivo && limiteEfectivo !== null && montoNumero > limiteEfectivo

  const elegirFactura = (id) => {
    setFacturaId(id)
    const f = abiertas.find((x) => String(x.id) === id)
    if (f) setMonto(String(f.saldo))
  }

  const enviar = async (confirmarDuplicado = false) => {
    setError(null)

    // Validaciones en pantalla (primera capa)
    if (!seleccionada) return setError('Seleccione la factura.')
    if (!(montoNumero > 0)) return setError('El monto debe ser mayor a cero.')
    if (montoNumero > saldo) return setError(`El pago no puede superar el saldo pendiente (${moneda(saldo)}).`)
    if (!forma) return setError('Seleccione la forma de pago.')
    if (forma.requiereReferencia && (!bancoId || !referencia.trim()))
      return setError(`Para pagos con ${forma.nombre} debe indicar el banco y el número de referencia.`)
    if (forma.requiereReferencia && !comprobante)
      return setError(`Adjunte la foto o el PDF del comprobante de ${forma.nombre.toLowerCase()} (RN-33).`)
    if (superaLimite)
      return setError(`Los pagos en efectivo no pueden superar ${moneda(limiteEfectivo)}. Use cheque, transferencia o depósito.`)

    setGuardando(true)
    try {
      const pago = await api.post('/api/pagos', {
        facturaId: Number(seleccionada.id),
        fechaPago,
        monto: montoNumero,
        formaPagoId: Number(formaPagoId),
        bancoId: forma.requiereReferencia ? Number(bancoId) : null,
        numeroReferencia: forma.requiereReferencia ? referencia.trim() : null,
        confirmarDuplicado,
        comprobante,
      })
      avisos.exito(
        `Pago de ${moneda(pago.monto)} registrado. Nuevo saldo: ${moneda(pago.saldoFactura)}.` +
          (!pago.formaRequiereReferencia && pago.comprobantes.length === 0
            ? ' Imprima el recibo, hágalo firmar y adjúntelo.'
            : ''),
      )
      onRegistrado?.(pago)
      onCerrar()
    } catch (err) {
      if (err.status === 409 && err.datos?.requiereConfirmacion) setConfirmacion(err.message)
      else setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const alEnviar = (e) => {
    e.preventDefault()
    enviar(false)
  }

  return (
    <Modal
      abierto
      titulo="Registrar pago"
      onCerrar={onCerrar}
      ancho="max-w-xl"
      pie={
        confirmacion ? null : (
          <>
            <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
            <Boton type="submit" form="form-pago" icono={Wallet} cargando={guardando}>
              Registrar pago
            </Boton>
          </>
        )
      }
    >
      {confirmacion ? (
        // RN-25: posible pago duplicado
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Posible pago duplicado</p>
              <p className="mt-1 text-sm text-amber-800">{confirmacion}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setConfirmacion(null)}>No, revisar</Boton>
            <Boton cargando={guardando} onClick={() => enviar(true)}>Sí, registrar de todos modos</Boton>
          </div>
        </div>
      ) : (
        <form id="form-pago" onSubmit={alEnviar} className="space-y-4">
          <AlertaError mensaje={error} />

          {factura ? (
            <div className="rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
              <p className="font-medium text-slate-900">
                Factura {factura.serie}-{factura.numero} · {factura.proveedorNombre}
              </p>
              <p className="text-slate-500">Saldo pendiente: <span className="font-semibold text-slate-900">{moneda(factura.saldo)}</span></p>
            </div>
          ) : (
            <Campo etiqueta="Factura" requerido>
              <Seleccion value={facturaId} onChange={(e) => elegirFactura(e.target.value)}>
                <option value="">Seleccione una factura pendiente…</option>
                {abiertas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.serie}-{f.numero} · {f.proveedorNombre} · saldo {moneda(f.saldo)}
                  </option>
                ))}
              </Seleccion>
            </Campo>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Fecha del pago" requerido ayuda={seleccionada ? `Emisión de la factura: ${fecha(seleccionada.fechaEmision)}` : null}>
              <Entrada type="date" value={fechaPago} max={hoyISO()} min={seleccionada?.fechaEmision} onChange={(e) => setFechaPago(e.target.value)} required />
            </Campo>
            <Campo etiqueta="Monto (Q)" requerido>
              <Entrada type="number" step="0.01" min="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required />
            </Campo>
          </div>

          {seleccionada && montoNumero > 0 && montoNumero <= saldo && (
            <p className="text-sm text-slate-600">
              {saldoDespues === 0 ? (
                <span className="font-medium text-emerald-700">Este pago cancela la factura por completo.</span>
              ) : (
                <>Abono parcial. Saldo después del pago: <span className="font-semibold text-slate-900">{moneda(saldoDespues)}</span></>
              )}
            </p>
          )}

          <Campo etiqueta="Forma de pago" requerido>
            <Seleccion value={formaPagoId} onChange={(e) => setFormaPagoId(e.target.value)} required>
              <option value="">Seleccione…</option>
              {(formas ?? []).map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </Seleccion>
          </Campo>

          {superaLimite && (
            <AlertaError mensaje={`El límite para pagos en efectivo es ${moneda(limiteEfectivo)} (RN-36).`} />
          )}

          {forma?.requiereReferencia && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Banco" requerido>
                <Seleccion value={bancoId} onChange={(e) => setBancoId(e.target.value)} required>
                  <option value="">Seleccione…</option>
                  {(bancos ?? []).map((b) => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </Seleccion>
              </Campo>
              <Campo etiqueta={forma.nombre === 'Cheque' ? 'Número de cheque' : 'Número de referencia'} requerido>
                <Entrada value={referencia} onChange={(e) => setReferencia(e.target.value)} maxLength={50} required />
              </Campo>
            </div>
          )}

          {forma?.requiereReferencia && (
            <SelectorArchivo
              valor={comprobante}
              onCambio={setComprobante}
              requerido
              etiqueta={forma.nombre === 'Cheque' ? 'Foto del cheque o voucher' : 'Comprobante bancario'}
            />
          )}

          {esEfectivo && (
            <div className="flex gap-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900 ring-1 ring-sky-200">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Para pagos en efectivo, después de registrar el pago imprima el <strong>recibo</strong>, hágalo firmar
                por el proveedor y adjúntelo desde el historial de pagos.
                {limiteEfectivo !== null && <> Límite por pago: {moneda(limiteEfectivo)}.</>}
              </p>
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}
