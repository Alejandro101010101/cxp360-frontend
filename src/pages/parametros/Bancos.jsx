import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { api } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { useAvisos } from '../../hooks/useAvisos'
import { fila, tabla, td, th, thDerecha } from '../../utils/estilos'
import {
  AlertaError, Boton, Campo, Cargando, Casilla, EncabezadoPagina, Entrada, Insignia, Modal, Tarjeta,
} from '../../components/ui'

/** Catálogo de bancos (RF-08). */
export default function Bancos() {
  const avisos = useAvisos()
  const { datos, cargando, error, recargar } = useApi('/api/bancos')
  const [editando, setEditando] = useState(null)

  return (
    <>
      <EncabezadoPagina
        titulo="Bancos"
        descripcion="Bancos disponibles para pagos con cheque, transferencia o depósito."
        acciones={<Boton icono={Plus} onClick={() => setEditando({})}>Nuevo banco</Boton>}
      />

      <Tarjeta sinRelleno>
        {error && <AlertaError mensaje={error} className="m-4" />}
        {cargando && !datos ? (
          <Cargando />
        ) : (
          <table className={tabla}>
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Nombre</th>
                <th className={th}>Estado</th>
                <th className={thDerecha} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos?.map((b) => (
                <tr key={b.id} className={fila}>
                  <td className={`${td} font-medium text-slate-900`}>{b.nombre}</td>
                  <td className={td}><Insignia color={b.activo ? 'verde' : 'gris'}>{b.activo ? 'Activo' : 'Inactivo'}</Insignia></td>
                  <td className={`${td} text-right`}>
                    <Boton variante="fantasma" tamano="sm" icono={Pencil} onClick={() => setEditando(b)}>Modificar</Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>

      {editando && (
        <Formulario
          registro={editando.id ? editando : null}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            avisos.exito('Banco guardado.')
            setEditando(null)
            recargar()
          }}
        />
      )}
    </>
  )
}

function Formulario({ registro, onCerrar, onGuardado }) {
  const [nombre, setNombre] = useState(registro?.nombre ?? '')
  const [activo, setActivo] = useState(registro?.activo ?? true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      if (registro) await api.put(`/api/bancos/${registro.id}`, { nombre, activo })
      else await api.post('/api/bancos', { nombre, activo })
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto
      titulo={registro ? 'Modificar banco' : 'Nuevo banco'}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-banco" cargando={guardando}>Guardar</Boton>
        </>
      }
    >
      <form id="form-banco" onSubmit={guardar} className="space-y-4">
        <AlertaError mensaje={error} />
        <Campo etiqueta="Nombre" requerido>
          <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} required autoFocus />
        </Campo>
        <Casilla etiqueta="Activo" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
      </form>
    </Modal>
  )
}
