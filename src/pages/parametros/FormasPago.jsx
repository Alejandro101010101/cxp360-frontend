import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { api } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { useAvisos } from '../../hooks/useAvisos'
import { fila, tabla, td, th, thDerecha } from '../../utils/estilos'
import {
  AlertaError, Boton, Campo, Cargando, Casilla, EncabezadoPagina, Entrada, Insignia, Modal, Tarjeta,
} from '../../components/ui'

/** Catálogo de formas de pago (RF-07). */
export default function FormasPago() {
  const avisos = useAvisos()
  const { datos, cargando, error, recargar } = useApi('/api/formas-pago')
  const [editando, setEditando] = useState(null)

  return (
    <>
      <EncabezadoPagina
        titulo="Formas de pago"
        descripcion="Las que requieren referencia exigen banco y número de documento al registrar un pago (RN-23)."
        acciones={<Boton icono={Plus} onClick={() => setEditando({})}>Nueva forma de pago</Boton>}
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
                <th className={th}>Requiere banco y referencia</th>
                <th className={th}>Estado</th>
                <th className={thDerecha} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos?.map((f) => (
                <tr key={f.id} className={fila}>
                  <td className={`${td} font-medium text-slate-900`}>{f.nombre}</td>
                  <td className={td}>{f.requiereReferencia ? 'Sí' : 'No'}</td>
                  <td className={td}><Insignia color={f.activo ? 'verde' : 'gris'}>{f.activo ? 'Activa' : 'Inactiva'}</Insignia></td>
                  <td className={`${td} text-right`}>
                    <Boton variante="fantasma" tamano="sm" icono={Pencil} onClick={() => setEditando(f)}>Modificar</Boton>
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
            avisos.exito('Forma de pago guardada.')
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
  const [requiereReferencia, setRequiereReferencia] = useState(registro?.requiereReferencia ?? true)
  const [activo, setActivo] = useState(registro?.activo ?? true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      const cuerpo = { nombre, requiereReferencia, activo }
      if (registro) await api.put(`/api/formas-pago/${registro.id}`, cuerpo)
      else await api.post('/api/formas-pago', cuerpo)
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto
      titulo={registro ? 'Modificar forma de pago' : 'Nueva forma de pago'}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-forma" cargando={guardando}>Guardar</Boton>
        </>
      }
    >
      <form id="form-forma" onSubmit={guardar} className="space-y-4">
        <AlertaError mensaje={error} />
        <Campo etiqueta="Nombre" requerido>
          <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={50} required autoFocus />
        </Campo>
        <div className="flex flex-col gap-3">
          <Casilla etiqueta="Requiere banco y número de referencia" checked={requiereReferencia} onChange={(e) => setRequiereReferencia(e.target.checked)} />
          <Casilla etiqueta="Activa" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        </div>
      </form>
    </Modal>
  )
}
