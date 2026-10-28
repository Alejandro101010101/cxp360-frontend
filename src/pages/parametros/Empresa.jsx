import { useState } from 'react'
import { Save } from 'lucide-react'
import { api } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { useAvisos } from '../../hooks/useAvisos'
import { AlertaError, Boton, Campo, Cargando, EncabezadoPagina, Entrada, Tarjeta } from '../../components/ui'

/** Parámetros generales: datos de la empresa, IVA, crédito por defecto y límite de efectivo (RF-05, RF-06, RF-37). */
export default function Empresa() {
  const { datos, cargando, error } = useApi('/api/configuracion')

  if (cargando && !datos) return <Cargando />
  if (error && !datos) return <AlertaError mensaje={error} />

  return <FormularioEmpresa inicial={datos} />
}

function FormularioEmpresa({ inicial }) {
  const avisos = useAvisos()
  const [form, setForm] = useState({
    ...inicial,
    porcentajeIva: String(inicial.porcentajeIva),
    diasCreditoDefault: String(inicial.diasCreditoDefault),
    limitePagoEfectivo: String(inicial.limitePagoEfectivo ?? ''),
  })
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await api.put('/api/configuracion', {
        ...form,
        porcentajeIva: Number(form.porcentajeIva),
        diasCreditoDefault: Number(form.diasCreditoDefault),
        limitePagoEfectivo: form.limitePagoEfectivo === '' ? null : Number(form.limitePagoEfectivo),
      })
      avisos.exito('Parámetros actualizados.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar}>
      <EncabezadoPagina
        titulo="Empresa e IVA"
        descripcion="Datos de la empresa y configuración general que usan los demás módulos."
        acciones={<Boton type="submit" icono={Save} cargando={guardando}>Guardar cambios</Boton>}
      />
      <AlertaError mensaje={error} className="mb-4" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Datos de la empresa" descripcion="Aparecen en el encabezado de los reportes impresos." className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre" requerido className="sm:col-span-2">
              <Entrada value={form.nombre} onChange={cambiar('nombre')} maxLength={150} required />
            </Campo>
            <Campo etiqueta="NIT" requerido>
              <Entrada value={form.nit} onChange={cambiar('nit')} maxLength={20} required />
            </Campo>
            <Campo etiqueta="Teléfono" requerido>
              <Entrada value={form.telefono} onChange={cambiar('telefono')} maxLength={20} required />
            </Campo>
            <Campo etiqueta="Dirección" requerido className="sm:col-span-2">
              <Entrada value={form.direccion} onChange={cambiar('direccion')} maxLength={250} required />
            </Campo>
          </div>
        </Tarjeta>

        <Tarjeta titulo="Configuración general">
          <div className="space-y-4">
            <Campo etiqueta="Porcentaje de IVA" requerido ayuda="Las facturas se registran con IVA incluido (RN-14).">
              <Entrada type="number" step="0.01" min="0" max="100" value={form.porcentajeIva} onChange={cambiar('porcentajeIva')} required />
            </Campo>
            <Campo etiqueta="Días de crédito por defecto" requerido ayuda="Se aplican a proveedores sin días de crédito propios (RN-07).">
              <Entrada type="number" min="0" max="120" value={form.diasCreditoDefault} onChange={cambiar('diasCreditoDefault')} required />
            </Campo>
            <Campo etiqueta="Límite para pagos en efectivo (Q)" ayuda="Montos mayores deben pagarse con cheque, transferencia o depósito (RN-36). Déjelo vacío para no limitar.">
              <Entrada type="number" step="0.01" min="0.01" value={form.limitePagoEfectivo} onChange={cambiar('limitePagoEfectivo')} placeholder="Sin límite" />
            </Campo>
          </div>
        </Tarjeta>
      </div>
    </form>
  )
}
