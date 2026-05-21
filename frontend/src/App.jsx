import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Segments from './pages/Segments'
import Interactions from './pages/Interactions'
import Users from './pages/Users'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"               element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/customers"      element={<Customers />} />
        <Route path="/customers/:id"  element={<CustomerDetail />} />
        <Route path="/segments"       element={<Segments />} />
        <Route path="/interactions"   element={<Interactions />} />
        <Route path="/users"          element={<Users />} />
      </Routes>
    </Layout>
  )
}
