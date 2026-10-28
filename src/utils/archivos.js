// ======================================================================
// Lectura y validación de comprobantes antes de enviarlos a la API (RN-34)
// ======================================================================

export const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf']
export const TAMANO_MAXIMO = 2 * 1024 * 1024 // 2 MB
export const ACEPTAR = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'

/** 1536000 → "1.5 MB" */
export function tamanoLegible(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Convierte un archivo del navegador en el objeto que espera la API:
 *   { nombreArchivo, tipoContenido, contenido (Base64) }
 * Lanza un Error con mensaje claro si no es válido.
 */
export function leerArchivo(archivo) {
  return new Promise((resolver, rechazar) => {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      rechazar(new Error('El comprobante debe ser una imagen JPG o PNG, o un documento PDF.'))
      return
    }
    if (archivo.size > TAMANO_MAXIMO) {
      rechazar(new Error(`El archivo pesa ${tamanoLegible(archivo.size)}. El máximo es 2 MB.`))
      return
    }

    const lector = new FileReader()
    lector.onload = () => {
      // "data:image/png;base64,AAAA..." → se envía solo la parte después de la coma
      const base64 = String(lector.result).split(',')[1]
      resolver({ nombreArchivo: archivo.name, tipoContenido: archivo.type, contenido: base64 })
    }
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo.'))
    lector.readAsDataURL(archivo)
  })
}
