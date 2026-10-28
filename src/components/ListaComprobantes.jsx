import { FileText, ImageIcon } from 'lucide-react'
import { abrirComprobante } from '../api/cliente'
import { useAvisos } from '../hooks/useAvisos'
import { tamanoLegible } from '../utils/archivos'
import { fechaHora } from '../utils/formato'

/** Lista de comprobantes adjuntos; al hacer clic se abre el archivo (RF-34). */
export function ListaComprobantes({ comprobantes, compacto = false }) {
  const avisos = useAvisos()

  const abrir = async (id) => {
    try {
      await abrirComprobante(id)
    } catch (err) {
      avisos.error(err.message)
    }
  }

  return (
    <ul className={compacto ? 'flex flex-wrap gap-1.5' : 'space-y-2'}>
      {comprobantes.map((c) => {
        const Icono = c.tipoContenido === 'application/pdf' ? FileText : ImageIcon
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => abrir(c.id)}
              title={`${c.nombreArchivo} · ${c.usuarioRegistro} · ${fechaHora(c.fechaRegistro)}`}
              className={
                compacto
                  ? 'inline-flex max-w-44 items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                  : 'flex w-full items-center gap-3 rounded-lg p-2 text-left ring-1 ring-slate-200 hover:bg-orange-50 hover:ring-orange-200'
              }
            >
              <Icono className={compacto ? 'size-3.5 shrink-0' : 'size-8 shrink-0 text-slate-500'} />
              {compacto ? (
                <span className="truncate">{c.nombreArchivo}</span>
              ) : (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900">{c.nombreArchivo}</span>
                  <span className="block text-xs text-slate-500">
                    {tamanoLegible(c.tamanoBytes)} · {c.usuarioRegistro} · {fechaHora(c.fechaRegistro)}
                  </span>
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
