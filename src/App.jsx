import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RutaProtegida } from './components/RutaProtegida'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Proveedores from './pages/Proveedores'
import Facturas from './pages/Facturas'
import NuevaFactura from './pages/NuevaFactura'
import DetalleFactura from './pages/DetalleFactura'
import Pagos from './pages/Pagos'
import ReciboPago from './pages/ReciboPago'
import EstadoCuenta from './pages/reportes/EstadoCuenta'
import Pendientes from './pages/reportes/Pendientes'
import Antiguedad from './pages/reportes/Antiguedad'
import PagosPeriodo from './pages/reportes/PagosPeriodo'
import Empresa from './pages/parametros/Empresa'
import FormasPago from './pages/parametros/FormasPago'
import Bancos from './pages/parametros/Bancos'
import Usuarios from './pages/parametros/Usuarios'
import NoEncontrado from './pages/NoEncontrado'

/** Rutas de CxP360. Todo, salvo el login, exige sesión (RN-02). */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        {/* Menú principal */}
        <Route index element={<Dashboard />} />

        {/* Catálogos y movimientos */}
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="facturas" element={<Facturas />} />
        <Route path="facturas/nueva" element={<NuevaFactura />} />
        <Route path="facturas/:id" element={<DetalleFactura />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="pagos/:id/recibo" element={<ReciboPago />} />

        {/* Consultas y reportes */}
        <Route path="reportes/estado-cuenta" element={<EstadoCuenta />} />
        <Route path="reportes/pendientes" element={<Pendientes />} />
        <Route path="reportes/antiguedad" element={<Antiguedad />} />
        <Route path="reportes/pagos" element={<PagosPeriodo />} />

        {/* Parámetros del sistema: solo Administrador (RN-31) */}
        <Route path="parametros/empresa" element={<RutaProtegida soloAdmin><Empresa /></RutaProtegida>} />
        <Route path="parametros/formas-pago" element={<RutaProtegida soloAdmin><FormasPago /></RutaProtegida>} />
        <Route path="parametros/bancos" element={<RutaProtegida soloAdmin><Bancos /></RutaProtegida>} />
        <Route path="parametros/usuarios" element={<RutaProtegida soloAdmin><Usuarios /></RutaProtegida>} />

        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}
