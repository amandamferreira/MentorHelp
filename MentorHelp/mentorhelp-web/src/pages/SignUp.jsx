import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../app/firebase'
import { Link, useNavigate } from 'react-router-dom'

const msg = (err) => {
  const code = err?.code || ''
  if (code.includes('operation-not-allowed')) return 'Habilite o login com Google no Firebase (Authentication > Método de login).'
  if (code.includes('popup-closed-by-user')) return 'Popup fechado. Tente novamente.'
  if (code.includes('email-already-in-use')) return 'Esse e-mail já está em uso.'
  return `${code} — ${err?.message || 'Erro ao criar conta'}`
}

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const saveUserDoc = async (u) => {
    await setDoc(doc(db, 'users', u.uid), {
      name: u.displayName || name || '',
      email: u.email,
      role: 'USER',
      createdAt: serverTimestamp(),
    }, { merge: true })
  }

  const signup = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) await updateProfile(cred.user, { displayName: name })
      await saveUserDoc(cred.user)
      navigate('/')
    } catch (err) { setError(msg(err)) }
  }

  const signupGoogle = async () => {
    setError('')
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await saveUserDoc(cred.user)
      navigate('/')
    } catch (err) { setError(msg(err)) }
  }

  return (
    <div className="container-xxl py-4" style={{maxWidth: 480}}>
      <h3 style={{color:'var(--mh-navy)'}}>Criar conta</h3>
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form onSubmit={signup} className="mt-3">
        <input className="form-control mb-2" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
        <input className="form-control mb-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="form-control mb-3" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary w-100">Criar</button>
      </form>

      <button className="btn btn-outline-primary w-100 mt-2" onClick={signupGoogle}>
        Criar conta com Google
      </button>

      <p className="mt-3">Já tem conta? <Link to="/signin">Entrar</Link></p>
    </div>
  )
}
