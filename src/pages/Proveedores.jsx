import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Power, ScrollText, Search } from 'lucide-react'
import { api, consulta } from '../api/cliente'
import { useApi } from '../hooks/useApi'
import { useAvisos } from '../hooks/useAvisos'
import { moneda } from '../utils/formato'
import { fila, tabla, td, tdDerecha, th, thDerecha } from '../utils/estilos'
import {
  AlertaError, Boton, Campo, Cargando, Casilla, EncabezadoPagina, Entrada, Insignia, Modal, Tarjeta, Vacio,
} from '../components/ui'

/** Módulo de proveedores (RF-09 a RF-13). */
export default function Proveedores() {
  const avisos = useAvisos()
  const [texto, setTexto] = useState('')
  const [buscar, setBuscar] = useState('')
  const [soloActivos, setSoloActivos] = useState(false)
  const [editando, setEditando] = useState(null)   // null = cerrado · {} = nuevo · proveedor = editar

  // Espera a que el usuario deje de escribir antes de buscar
  useEffect(() => {
    const t = setTimeout(() => setBuscar(texto.trim()), 300)
    return () => clearTimeout(t)
  }, [texto])

  const { datos, cargando, error, recargar } = useApi(`/api/proveedores${consulta({ buscar, soloActivos })}`)
  const { datos: config } = useApi('/api/configuracion')

  const cambiarEstado = async (p) => {
    try {
      await api.put(`/api/proveedores/${p.id}/estado`, { activo: !p.activo })
      avisos.exito(`Proveedor ${p.activo ? 'inactivado' : 'activado'}: ${p.nombre}`)
      recargar()
    } catch (err) {
      avisos.error(err.message)
    }
  }

  const totalSaldo = (datos ?? []).reduce((s, p) => s + p.saldo, 0)

  return (
    <>
      <EncabezadoPagina
        titulo="Proveedores"
        descripcion="Registro y consulta de los proveedores de la ferretería y su saldo actual."
        acciones={<Boton icono={Plus} onClick={() => setEditando({})}>Nuevo proveedor</Boton>}
      />

      <Tarjeta sinRelleno>
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Entrada
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por NIT o nombre…"
              className="pl-9"
            />
          </div>
          <Casilla etiqueta="Solo activos" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
        </div>

        {error && <AlertaError mensaje={error} className="m-4" />}
        {cargando && !datos ? (
          <Cargando />
        ) : datos?.length === 0 ? (
          <Vacio mensaje="No se encontraron proveedores." />
        ) : (
          <div className="overflow-x-auto">
            <table className={tabla}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Proveedor</th>
                  <th className={th}>Contacto</th>
                  <th className={thDerecha}>Crédito</th>
                  <th className={thDerecha}>Facturas abiertas</th>
                  <th className={thDerecha}>Saldo</th>
                  <th className={th}>Estado</th>
                  <th className={thDerecha}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datos?.map((p) => (
                  <tr key={p.id} className={fila}>
                    <td className={td}>
                      <p className="font-medium text-slate-900">{p.nombre}</p>
                      <p className="text-xs text-slate-500">NIT {p.nit}</p>
                    </td>
                    <td className={td}>
                      <p>{p.contacto ?? '—'}</p>
                      <p className="text-xs text-slate-500">{[p.telefono, p.correo].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className={tdDerecha}>{p.diasCredito === 0 ? 'Contado' : `${p.diasCredito} días`}</td>
                    <td className={tdDerecha}>{p.facturasPendientes}</td>
                    <td className={`${tdDerecha} font-semibold text-slate-900`}>{moneda(p.saldo)}</td>
                    <td className={td}>
                      <Insignia color={p.activo ? 'verde' : 'gris'}>{p.activo ? 'Activo' : 'Inactivo'}</Insignia>
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/reportes/estado-cuenta?proveedorId=${p.id}`}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-orange-700"
                          title="Estado de cuenta"
                        >
                          <ScrollText className="size-4" />
                        </Link>
                        <button type="button" onClick={() => setEditando(p)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-orange-700" title="Modificar">
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(p)}
                          className={`rounded-md p-1.5 hover:bg-slate-100 ${p.activo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600'}`}
                          title={p.activo ? 'Inactivar' : 'Activar'}
                        >
                          <Power className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className={`${td} font-semibold`} colSpan={4}>{datos?.length} proveedor(es)</td>
                  <td className={`${tdDerecha} font-bold text-slate-900`}>{moneda(totalSaldo)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Tarjeta>

      {editando && (
        <FormularioProveedor
          proveedor={editando.id ? editando : null}
          diasPorDefecto={config?.diasCreditoDefault}
          onCerrar={() => setEditando(null)}
          onGuardado={(p, nuevo) => {
            avisos.exito(nuevo ? `Proveedor registrado: ${p.nombre}` : `Proveedor actualizado: ${p.nombre}`)
            setEditando(null)
            recargar()
          }}
        />
      )}
    </>
  )
}

function FormularioProveedor({ proveedor, diasPorDefecto, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    nit: proveedor?.nit ?? '',
    nombre: proveedor?.nombre ?? '',
    contacto: proveedor?.contacto ?? '',
    telefono: proveedor?.telefono ?? '',
    correo: proveedor?.correo ?? '',
    direccion: proveedor?.direccion ?? '',
    diasCredito: proveedor ? String(proveedor.diasCredito) : '',
  })
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.nit.trim() || !form.nombre.trim()) return setError('El NIT y el nombre son obligatorios.')
    const dias = form.diasCredito === '' ? null : Number(form.diasCredito)
    if (dias !== null && (dias < 0 || dias > 120)) return setError('Los días de crédito deben estar entre 0 y 120.')

    setGuardando(true)
    const cuerpo = {
      ...form,
      contacto: form.contacto || null,
      telefono: form.telefono || null,
      correo: form.correo || null,
      direccion: form.direccion || null,
      diasCredito: dias,
    }
    try {
      const guardado = proveedor
        ? await api.put(`/api/proveedores/${proveedor.id}`, cuerpo)
        : await api.post('/api/proveedores', cuerpo)
      onGuardado(guardado, !proveedor)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      abierto
      titulo={proveedor ? 'Modificar proveedor' : 'Nuevo proveedor'}
      onCerrar={onCerrar}
      ancho="max-w-2xl"
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" form="form-proveedor" cargando={guardando}>Guardar</Boton>
        </>
      }
    >
      <form id="form-proveedor" onSubmit={guardar} className="space-y-4">
        <AlertaError mensaje={error} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="NIT" requerido>
            <Entrada value={form.nit} onChange={cambiar('nit')} maxLength={20} autoFocus />
          </Campo>
          <Campo etiqueta="Nombre o razón social" requerido className="sm:col-span-2">
            <Entrada value={form.nombre} onChange={cambiar('nombre')} maxLength={150} />
          </Campo>
          <Campo etiqueta="Contacto">
            <Entrada value={form.contacto} onChange={cambiar('contacto')} maxLength={100} />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada value={form.telefono} onChange={cambiar('telefono')} maxLength={20} />
          </Campo>
          <Campo etiqueta="Correo electrónico">
            <Entrada type="email" value={form.correo} onChange={cambiar('correo')} maxLength={100} />
          </Campo>
          <Campo etiqueta="Dirección" className="sm:col-span-2">
            <Entrada value={form.direccion} onChange={cambiar('direccion')} maxLength={250} />
          </Campo>
          <Campo
            etiqueta="Días de crédito"
            ayuda={!proveedor && diasPorDefecto !== undefined ? `Si lo deja vacío: ${diasPorDefecto} días` : '0 = contado'}
          >
            <Entrada type="number" min="0" max="120" value={form.diasCredito} onChange={cambiar('diasCredito')} />
          </Campo>
        </div>
      </form>
    </Modal>
  )
}
