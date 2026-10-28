# CxP360 – Frontend

Interfaz web del **Sistema de Cuentas por Pagar de Ferretería Los Esclavos** (Cuilapa, Santa Rosa).
Proyecto final del curso Desarrollo Web – Universidad Mariano Gálvez de Guatemala, 2026.

## Tecnologías

| Herramienta | Uso |
|---|---|
| React 19 + Vite | Interfaz de usuario |
| React Router | Navegación entre pantallas |
| Tailwind CSS 4 | Estilos |
| Lucide | Íconos |
| ESLint | Calidad del código |

La interfaz consume la API REST del repositorio **cxp360-backend** (ASP.NET Core + SQL Server).

## Módulos

- **Seguridad:** inicio de sesión con token JWT; roles Administrador y Operador.
- **Menú principal:** panel de inicio con indicadores de deuda, vencimientos y pagos.
- **Proveedores:** registro, búsqueda, modificación, activación y saldo.
- **Ingresos por compra:** facturas con detalle de productos, IVA incluido y vencimiento automático.
- **Pagos:** abonos totales o parciales, anulación y advertencia de pagos duplicados.
- **Consultas y reportes:** estado de cuenta, pendientes y vencidas, antigüedad de saldos y pagos por período, con impresión y PDF.
- **Parámetros (Administrador):** empresa e IVA, formas de pago, bancos y usuarios.

## Ejecución local

Requisitos: Node.js 20 o superior y la API de CxP360 en ejecución.

```bash
npm install
npm run dev
```

La aplicación se abre en `http://localhost:5173`. La dirección de la API se configura en `.env.development` (`VITE_API_URL`).

## Estructura

```
src/
├── api/          Cliente HTTP (token JWT y manejo de errores)
├── components/   Componentes reutilizables, menú y ventanas emergentes
├── context/      Sesión del usuario y notificaciones
├── hooks/        Carga de datos y acceso a la sesión
├── pages/        Pantallas (reportes y parámetros en subcarpetas)
└── utils/        Formato de quetzales y fechas
```
