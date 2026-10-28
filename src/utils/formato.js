// ======================================================================
// Formatos para mostrar datos (quetzales y fechas de Guatemala)
// ======================================================================

const formatoQuetzales = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatoNumero = new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 })

/** 5235 → "Q5,235.00" (RN-01) */
export function moneda(valor) {
  return formatoQuetzales.format(Number(valor ?? 0))
}

export function numero(valor) {
  return formatoNumero.format(Number(valor ?? 0))
}

/**
 * "2026-10-20" → "20/10/2026".
 * Se trabaja con el texto para evitar que la zona horaria cambie el día.
 */
export function fecha(iso) {
  if (!iso) return ''
  const [anio, mes, dia] = String(iso).slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

/** "2026-10-25T23:19:08" → "25/10/2026 23:19" */
export function fechaHora(iso) {
  if (!iso) return ''
  return `${fecha(iso)} ${String(iso).slice(11, 16)}`
}

/** Fecha de hoy en Guatemala (UTC-6) en formato "AAAA-MM-DD". */
export function hoyISO() {
  return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** Primer día del mes actual en formato "AAAA-MM-DD". */
export function primerDiaMesISO() {
  return `${hoyISO().slice(0, 8)}01`
}

/** Suma días a una fecha "AAAA-MM-DD" (RN-13). */
export function sumarDias(iso, dias) {
  if (!iso) return ''
  const [a, m, d] = iso.split('-').map(Number)
  const resultado = new Date(Date.UTC(a, m - 1, d + Number(dias || 0)))
  return resultado.toISOString().slice(0, 10)
}

/** Redondeo a 2 decimales, igual que la API (MidpointRounding.AwayFromZero). */
export function redondear(valor) {
  const n = Number(valor) || 0
  return Math.sign(n) * Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100
}
