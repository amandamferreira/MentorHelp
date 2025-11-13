import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container-xxl py-4">Carregando…</div>
  return user ? children : <Navigate to="/signin" replace />
}
