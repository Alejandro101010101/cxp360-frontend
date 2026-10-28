import { createContext } from 'react'

/** Sesión del usuario: { usuario, esAdmin, iniciarSesion, cerrarSesion } */
export const AuthContext = createContext(null)

/** Notificaciones: { exito(mensaje), error(mensaje) } */
export const AvisosContext = createContext(null)
