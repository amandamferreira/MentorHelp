import { useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../app/firebase'
import { Link, useNavigate } from 'react-router-dom'

const msg = (err) => {
  const code = err?.code || ''
  if (code.includes('operation-not-allowed')) return 'Habilite o login com Google no Firebase (Authentication > Método de login).'
  if (code.includes('popup-closed-by-user')) return 'Popup fechado. Tente novamente.'
  if (code.includes('popup-blocked')) return 'Popup bloqueado pelo navegador. Libere popups para localhost.'
  if (code.includes('invalid-credential')) return 'E-mail ou senha inválidos.'
  return `${code} — ${err?.message || 'Erro ao entrar'}`
}

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) { setError(msg(err)) }
  }

  const loginGoogle = async () => {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (err) { setError(msg(err)) }
  }

  return (
    <div className="container-xxl py-4" style={{maxWidth: 480}}>
      <h3 style={{color:'var(--mh-navy)'}}>Entrar</h3>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <form onSubmit={login} className="mt-3">
        <input className="form-control mb-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="form-control mb-3" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary w-100">Entrar</button>
      </form>
      <button className="btn btn-outline-primary w-100 mt-2" onClick={loginGoogle}>
        Entrar com Google
      </button>
      <p className="mt-3">Não tem conta? <Link to="/signup">Criar conta</Link></p>
    </div>
  )
}
