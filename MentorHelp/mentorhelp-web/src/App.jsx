import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ExploreMentors from './pages/ExploreMentors.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import Profile from './pages/Profile.jsx'
import MentorProfileEdit from './pages/MentorProfileEdit.jsx'
import MentorDetail from './pages/MentorDetail.jsx'
import BookMentor from './pages/BookMentor.jsx'
import Bookings from './pages/Bookings.jsx'
import ProtectedRoute from './app/ProtectedRoute.jsx'

export default function App() {
  return (
    <>
      <Navbar />

      <main className="mh-content">
        <div className="container-xxl py-4">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Mentores */}
            <Route path="/mentors" element={<ExploreMentors />} />
            <Route path="/mentors/:id" element={<MentorDetail />} />
            <Route
              path="/mentors/:id/book"
              element={
                <ProtectedRoute>
                  <BookMentor />
                </ProtectedRoute>
              }
            />

            {/* Perfil usuário / mentor */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/profile"
              element={
                <ProtectedRoute>
                  <MentorProfileEdit />
                </ProtectedRoute>
              }
            />

            {/* Minhas sessões */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* Auth */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <div style={{ background: 'var(--mh-navy)' }}>
        <footer className="mh-footer" style={{ background: 'transparent', marginTop: 0 }}>
          <div className="container-fluid d-flex justify-content-between">
            <span>© {new Date().getFullYear()} MentorHelp</span>
            <span>Conectando alunos e mentores</span>
          </div>
        </footer>
      </div>
    </>
  )
}
