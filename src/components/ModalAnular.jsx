import { useState } from 'react'
import { Ban } from 'lucide-react'
import { AlertaError, AreaTexto, Boton, Campo, Modal } from './ui'

/**
 * Pide el motivo para anular una factura o un pago (RN-17, RN-26).
 * onConfirmar(motivo) debe devolver una promesa.
 */
export function ModalAnular({ abierto, titulo, descripcion, onCerrar, onConfirmar }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cerrar = () => {
    setMotivo('')
    setError(null)
    onCerrar()
  }

  const confirmar = async (e) => {
    e.preventDefault()
    if (!motivo.trim()) {
      setError('El motivo de la anulación es obligatorio.')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      await onConfirmar(motivo.trim())
      setMotivo('')
      onCerrar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onCerrar={cerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={cerrar}>Cancelar</Boton>
          <Boton variante="peligro" icono={Ban} cargando={guardando} type="submit" form="form-anular">
            Anular
          </Boton>
        </>
      }
    >
      <form id="form-anular" onSubmit={confirmar} className="space-y-4">
        {descripcion && <p className="text-sm text-slate-600">{descripcion}</p>}
        <AlertaError mensaje={error} />
        <Campo etiqueta="Motivo de la anulación" requerido>
          <AreaTexto value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={250} autoFocus />
        </Campo>
      </form>
    </Modal>
  )
}
