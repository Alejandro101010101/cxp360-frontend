import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, guardarToken, leerToken } from '../api/cliente'
import { AuthContext } from './contextos'

const CLAVE_USUARIO = 'cxp360.usuario'

/** Lee el usuario guardado, descartándolo si el token ya venció. */
function leerSesionGuardada() {
  try {
    const texto = localStorage.getItem(CLAVE_USUARIO)
    if (!texto || !leerToken()) return null
    const sesion = JSON.parse(texto)
    if (!sesion.expira || new Date(sesion.expira) <= new Date()) return null
    return sesion
  } catch {
    return null
  }
}

/**
 * Maneja la sesión (RF-01, RF-02): inicia sesión, guarda el token JWT
 * y la cierra cuando el usuario lo pide o cuando el token vence.
 */
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionGuardada)

  const cerrarSesion = useCallback(() => {
    guardarToken(null)
    try {
      localStorage.removeItem(CLAVE_USUARIO)
    } catch {
      // sin almacenamiento disponible
    }
    setSesion(null)
  }, [])

  const iniciarSesion = useCallback(async (nombreUsuario, password) => {
    const respuesta = await api.post('/api/auth/login', { nombreUsuario, password })
    const nueva = { ...respuesta.usuario, expira: respuesta.expira }
    guardarToken(respuesta.token)
    try {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nueva))
    } catch {
      // sin almacenamiento disponible
    }
    setSesion(nueva)
    return nueva
  }, [])

  // La API avisa con un 401 cuando el token vence: se cierra la sesión
  useEffect(() => {
    window.addEventListener('cxp360:sesion-expirada', cerrarSesion)
    return () => window.removeEventListener('cxp360:sesion-expirada', cerrarSesion)
  }, [cerrarSesion])

  const valor = useMemo(
    () => ({
      usuario: sesion,
      esAdmin: sesion?.rol === 'Administrador',
      iniciarSesion,
      cerrarSesion,
    }),
    [sesion, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
