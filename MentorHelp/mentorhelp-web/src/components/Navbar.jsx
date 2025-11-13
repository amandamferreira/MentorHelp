import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'
import { signOut } from 'firebase/auth'
import { auth } from '../app/firebase'

function initialsOf(str = '') {
  if (!str) return 'U'
  const name = str.includes('@') ? str.split('@')[0] : str
  const parts = name.split(/[ ._-]+/).filter(Boolean)
  const first = (parts[0] || '').charAt(0)
  const second = (parts[1] || '').charAt(0)
  return (first + second).toUpperCase() || 'U'
}

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const logout = async () => { await signOut(auth); navigate('/') }

  const avatarLabel = user?.displayName || user?.email || ''
  const avatar = initialsOf(avatarLabel)

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'var(--mh-navy)' }}>
      <div className="container-fluid px-3">
        {/* Logo (servida da pasta public/) */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/logo.png" alt="MentorHelp" style={{ height: 28 }} />
          <span className="fw-semibold">MentorHelp</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMH"
          aria-controls="navMH"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse pt-2 pt-lg-0" id="navMH">
          {/* ms-auto empurra pra direita; em mobile coluna, em lg linha */}
          <ul className="navbar-nav ms-auto flex-column flex-lg-row align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/mentors">Explorar</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/bookings">Agendadas</NavLink>
            </li>

            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink className="btn btn-outline-primary w-100 w-lg-auto mb-2 mb-lg-0" to="/signin">
                    Entrar
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-primary w-100 w-lg-auto" to="/signup">
                    Criar conta
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <button
                  className="btn d-flex align-items-center gap-2 text-white dropdown-toggle w-100 w-lg-auto"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ background: 'transparent', border: 0 }}
                >
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: '#ffffff22', display: 'grid', placeItems: 'center',
                      fontWeight: 600, color: '#fff'
                    }}
                    title={avatarLabel}
                  >
                    {avatar}
                  </div>
                  <span className="d-none d-sm-inline">{avatarLabel}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Perfil</Link></li>
                  <li><Link className="dropdown-item" to="/mentor/profile">Perfil Mentor</Link></li>
                  <li><Link className="dropdown-item" to="/bookings">Minhas sessões</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={logout}>Sair</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
