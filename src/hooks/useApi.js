import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/cliente'

/**
 * Carga datos de la API y los vuelve a cargar cuando cambia la ruta.
 *   const { datos, cargando, error, recargar } = useApi('/api/proveedores')
 * Si la ruta es null, no se hace la petición.
 */
export function useApi(ruta) {
  const [estado, setEstado] = useState({ datos: null, cargando: Boolean(ruta), error: null, ruta: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!ruta) return undefined
    let activo = true

    api
      .get(ruta)
      .then((datos) => {
        if (activo) setEstado({ datos, cargando: false, error: null, ruta })
      })
      .catch((error) => {
        if (activo) setEstado((previo) => ({ ...previo, cargando: false, error: error.message, ruta }))
      })

    return () => {
      activo = false
    }
  }, [ruta, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  // "cargando" también es verdadero mientras llegan los datos de una ruta nueva
  const cargando = Boolean(ruta) && (estado.cargando || estado.ruta !== ruta)

  return { datos: estado.datos, cargando, error: estado.error, recargar }
}
