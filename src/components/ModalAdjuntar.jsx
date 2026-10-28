import { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { api } from '../api/cliente'
import { useAvisos } from '../hooks/useAvisos'
import { SelectorArchivo } from './SelectorArchivo'
import { AlertaError, Boton, Modal } from './ui'

/**
 * Agrega un comprobante a una factura o a un pago ya registrado.
 * ruta: '/api/facturas/5/comprobantes' o '/api/pagos/8/comprobantes'
 */
export function ModalAdjuntar({ titulo, descripcion, ruta, onCerrar, onAgregado }) {
  const avisos = useAvisos()
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    if (!archivo) return setError('Seleccione la foto o el PDF del comprobante.')
    setGuardando(true)
    setError(null)
    try {
      await api.post(ruta, archivo)
      avisos.exito('Comprobante adjuntado.')
      onAgregado?.()
      onCerrar()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton icono={Paperclip} cargando={guardando} onClick={guardar}>Adjuntar</Boton>
        </>
      }
    >
      <div className="space-y-4">
        {descripcion && <p className="text-sm text-slate-600">{descripcion}</p>}
        <AlertaError mensaje={error} />
        <SelectorArchivo valor={archivo} onCambio={setArchivo} requerido />
      </div>
    </Modal>
  )
}
