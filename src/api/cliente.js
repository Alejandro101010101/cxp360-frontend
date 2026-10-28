// ======================================================================
// Cliente HTTP de CxP360
// Todas las pantallas llaman a la API a través de este archivo.
// Agrega el token JWT a cada petición y convierte los errores de la API
// (ProblemDetails) en mensajes claros para el usuario (RF-32).
// ======================================================================

export const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:5288'

const CLAVE_TOKEN = 'cxp360.token'

export function leerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // El navegador no permite almacenamiento: la sesión dura mientras la pestaña esté abierta
  }
}

/** Error devuelto por la API, con el código HTTP y el cuerpo original. */
export class ApiError extends Error {
  constructor(mensaje, status, datos) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.datos = datos
  }
}

const MENSAJES_POR_CODIGO = {
  400: 'Los datos enviados no son válidos.',
  401: 'Su sesión expiró. Inicie sesión nuevamente.',
  403: 'No tiene permiso para realizar esta acción.',
  404: 'El registro solicitado no existe.',
  409: 'El registro ya existe o fue modificado por otro usuario.',
  500: 'Ocurrió un error en el servidor. Intente de nuevo.',
}

function mensajeDeError(datos, status) {
  // Errores de validación: { errors: { Nombre: ["El nombre es obligatorio."] } }
  if (datos?.errors) {
    const mensajes = Object.values(datos.errors).flat()
    if (mensajes.length) return mensajes.join(' ')
  }
  return datos?.title ?? MENSAJES_POR_CODIGO[status] ?? `Error ${status}.`
}

async function solicitar(metodo, ruta, cuerpo) {
  const token = leerToken()
  let respuesta

  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifique que la API esté encendida.', 0, null)
  }

  // Token vencido o inválido: se avisa a la aplicación para cerrar la sesión
  if (respuesta.status === 401 && !ruta.startsWith('/api/auth/login')) {
    window.dispatchEvent(new Event('cxp360:sesion-expirada'))
  }

  if (respuesta.status === 204) return null

  const texto = await respuesta.text()
  let datos
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    throw new ApiError(mensajeDeError(datos, respuesta.status), respuesta.status, datos)
  }

  return datos
}

export const api = {
  get: (ruta) => solicitar('GET', ruta),
  post: (ruta, cuerpo) => solicitar('POST', ruta, cuerpo ?? {}),
  put: (ruta, cuerpo) => solicitar('PUT', ruta, cuerpo ?? {}),
}

/**
 * Abre un comprobante adjunto (imagen o PDF) en una pestaña nueva.
 * Se descarga con el token, porque la API exige sesión también para los archivos.
 */
export async function abrirComprobante(id) {
  // La pestaña se abre antes de esperar la descarga para que el navegador no la bloquee
  const ventana = window.open('', '_blank')
  try {
    const respuesta = await fetch(`${URL_API}/api/adjuntos/${id}`, {
      headers: { Authorization: `Bearer ${leerToken()}` },
    })
    if (!respuesta.ok) throw new ApiError('No se pudo abrir el comprobante.', respuesta.status, null)
    const url = URL.createObjectURL(await respuesta.blob())
    if (ventana) ventana.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (error) {
    ventana?.close()
    throw error
  }
}

/** Construye "?clave=valor&..." omitiendo los valores vacíos. */
export function consulta(parametros) {
  const p = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) p.set(clave, valor)
  })
  const texto = p.toString()
  return texto ? `?${texto}` : ''
}
