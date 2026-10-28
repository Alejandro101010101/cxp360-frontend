import { useState } from 'react'
import { KeyRound, Pencil, Plus } from 'lucide-react'
import { api } from '../../api/cliente'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { useAvisos } from '../../hooks/useAvisos'
import { fechaHora } from '../../utils/formato'
import { fila, tabla, td, th, thDerecha } from '../../utils/estilos'
import {
  AlertaError, Boton, Campo, Cargando, Casilla, EncabezadoPagina, Entrada, Insignia, Modal, Seleccion, Tarjeta,
} from '../../components/ui'

/** Administración de usuarios y roles (RF-33, RN-30, RN-31). */
export default function Usuarios() {
  const avisos = useAvisos()
  const { usuario: actual } = useAuth()
  const { datos, cargando, error, recargar } = useApi('/api/usuarios')
  const [editando, setEditando] = useState(null)
  const [cambiandoClave, setCambiandoClave] = useState(null)

  return (
    <>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="El Administrador gestiona todo el sistema; el Operador registra proveedores, facturas y pagos."
        acciones={<Boton icono={Plus} onClick={() => setEditando({})}>Nuevo usuario</Boton>}
      />

      <Tarjeta sinRelleno>
        {error && <AlertaError mensaje={error} className="m-4" />}
        {cargando && !datos ? (
          <Cargando />
        ) : (
          <div className="overflow-x-auto">
            <table className={tabla}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Nombre</th>
                  <th className={th}>Usuario</th>
                  <th className={th}>Rol</th>
                  <th className={th}>Estado</th>
                  <th className={th}>Creado</th>
                  <th className={thDerecha} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datos?.map((u) => (
                  <tr key={u.id} className={fila}>
                    <td className={`${td} font-medium text-slate-900`}>
                      {u.nombreCompleto}
                      {u.id === actual.id && <span className="ml-2 text-xs font-normal text-slate-400">(usted)</span>}
                    </td>
                    <td className={td}>{u.nombreUsuario}</td>
                    <td className={td}><Insignia color={u.rol === 'Administrador' ? 'naranja' : 'azul'}>{u.rol}</Insignia></td>
                    <td className={td}><Insignia color={u.activo ? 'verde' : 'gris'}>{u.activo ? 'Activo' : 'Inactivo'}</Insignia></td>
                    <td className={td}>{fechaHora(u.fechaCreacion)}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1">
                        <Boton variante="fantasma" tamano="sm" icono={Pencil} onClick={() => setEditando(u)}>Modificar</Boton>
                        <Boton variante="fantasma" tamano="sm" icono={KeyRound} onClick={() => setCambiandoClave(u)}>Contraseña</Boton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      {editando && (
        <FormularioUsuario
          registro={editando.id ? editando : null}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            avisos.exito('Usuario guardado.')
            setEditando(null)
            recargar()
          }}
        />
      )}

      {cambiandoClave && (
        <FormularioClave
          usuario={cambiandoClave}
          onCerrar={() => setCambiandoClave(null)}
          onGuardado={() => {
            avisos.exito(`Contraseña restablecida para ${cambiandoClave.nombreUsuario}.`)
            setCambiandoClave(null)
          }}
        />
      )}
    </>
  )
}

function FormularioUsuario({ registro, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    nombreCompleto: registro?.nombreCompleto ?? '',
    nombreUsuario: registro?.nombreUsuario ?? '',
    password: '',
    rol: registro?.rol ?? 'Operador',
    activo: registro?.activo ?? true,
  })
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)
    if (!registro && form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    setGuardando(true)
    try {
      if (registro) {
        await api.put(`/api/usuarios/${registro.id}`, { nombreCompleto: form.nombreCompleto, rol: form.rol, activo: form.activo })
      } else {
        await api.post('/api/usuarios', {
          nombreCompleto: form.nombreCompleto,
          nombreUsuario: form.nombreUsuario,
          password: form.password,
          rol: form.rol,
        })
      }
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto
      titulo={registro ? 'Modificar usuario' : 'Nuevo usuario'}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-usuario" cargando={guardando}>Guardar</Boton>
        </>
      }
    >
      <form id="form-usuario" onSubmit={guardar} className="space-y-4">
        <AlertaError mensaje={error} />
        <Campo etiqueta="Nombre completo" requerido>
          <Entrada value={form.nombreCompleto} onChange={cambiar('nombreCompleto')} maxLength={100} required autoFocus />
        </Campo>
        <Campo etiqueta="Nombre de usuario" requerido ayuda={registro ? 'El nombre de usuario no se puede cambiar.' : null}>
          <Entrada value={form.nombreUsuario} onChange={cambiar('nombreUsuario')} maxLength={50} required disabled={Boolean(registro)} />
        </Campo>
        {!registro && (
          <Campo etiqueta="Contraseña" requerido ayuda="Mínimo 8 caracteres. Se guarda cifrada.">
            <Entrada type="password" value={form.password} onChange={cambiar('password')} maxLength={100} required autoComplete="new-password" />
          </Campo>
        )}
        <Campo etiqueta="Rol" requerido>
          <Seleccion value={form.rol} onChange={cambiar('rol')}>
            <option value="Operador">Operador</option>
            <option value="Administrador">Administrador</option>
          </Seleccion>
        </Campo>
        {registro && <Casilla etiqueta="Activo" checked={form.activo} onChange={cambiar('activo')} />}
      </form>
    </Modal>
  )
}

function FormularioClave({ usuario, onCerrar, onGuardado }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    setGuardando(true)
    try {
      await api.put(`/api/usuarios/${usuario.id}/password`, { passwordNueva: password })
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto
      titulo={`Restablecer contraseña · ${usuario.nombreUsuario}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-clave" icono={KeyRound} cargando={guardando}>Restablecer</Boton>
        </>
      }
    >
      <form id="form-clave" onSubmit={guardar} className="space-y-4">
        <AlertaError mensaje={error} />
        <Campo etiqueta="Contraseña nueva" requerido ayuda="Mínimo 8 caracteres. Comuníquela al usuario de forma segura.">
          <Entrada type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={100} required autoFocus autoComplete="new-password" />
        </Campo>
      </form>
    </Modal>
  )
}
