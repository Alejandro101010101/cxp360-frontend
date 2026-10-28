// ======================================================================
// Convierte un monto a letras, como se escribe en recibos y cheques:
//   1235.5 → "UN MIL DOSCIENTOS TREINTA Y CINCO QUETZALES CON 50/100"
// ======================================================================

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
const DIEZ_A_VEINTINUEVE = [
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
  'VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE',
  'VEINTIOCHO', 'VEINTINUEVE',
]
const DECENAS = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
]

/** 0 a 999 */
function centenas(n) {
  if (n === 0) return ''
  if (n === 100) return 'CIEN'
  const c = Math.floor(n / 100)
  const resto = n % 100
  let texto = CENTENAS[c]
  if (resto > 0) {
    let parte
    if (resto < 10) parte = UNIDADES[resto]
    else if (resto < 30) parte = DIEZ_A_VEINTINUEVE[resto - 10]
    else {
      const d = Math.floor(resto / 10)
      const u = resto % 10
      parte = DECENAS[d] + (u ? ` Y ${UNIDADES[u]}` : '')
    }
    texto = texto ? `${texto} ${parte}` : parte
  }
  return texto
}

/** 0 a 999,999,999 */
function entero(n) {
  if (n === 0) return 'CERO'
  const millones = Math.floor(n / 1_000_000)
  const miles = Math.floor((n % 1_000_000) / 1000)
  const resto = n % 1000
  const partes = []
  if (millones) partes.push(millones === 1 ? 'UN MILLÓN' : `${centenas(millones)} MILLONES`)
  if (miles) partes.push(`${centenas(miles)} MIL`)
  if (resto) partes.push(centenas(resto))
  return partes.join(' ')
}

export function montoEnLetras(valor) {
  const centavosTotales = Math.round(Number(valor || 0) * 100)
  const quetzales = Math.floor(centavosTotales / 100)
  const centavos = String(centavosTotales % 100).padStart(2, '0')
  const nombre = quetzales === 1 ? 'QUETZAL' : 'QUETZALES'
  // "UN MILLÓN DE QUETZALES", pero "UN MILLÓN DOSCIENTOS MIL QUETZALES"
  const de = quetzales >= 1_000_000 && quetzales % 1_000_000 === 0 ? 'DE ' : ''
  return `${entero(quetzales)} ${de}${nombre} CON ${centavos}/100`
}
