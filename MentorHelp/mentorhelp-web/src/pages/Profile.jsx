import { useEffect, useState } from 'react'
import { useAuth } from '../app/AuthContext'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../app/firebase'
import { useNavigate, Link } from 'react-router-dom'

export default function Profile(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const uid = user.uid

  const [form, setForm] = useState({ name:'', bio:'', interests:'' })
  const [role, setRole] = useState('USER')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const ref = doc(db, 'users', uid)
      const snap = await getDoc(ref)
      const data = snap.exists() ? snap.data() : {}
      setForm({
        name: data.name || user.displayName || '',
        bio: data.bio || '',
        interests: (data.interests || []).join(', ')
      })
      setRole(data.role || 'USER')
    })()
  }, [uid, user.displayName])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    await setDoc(doc(db, 'users', uid), {
      name: form.name,
      email: user.email,
      bio: form.bio,
      interests: form.interests.split(',').map(s=>s.trim()).filter(Boolean),
      role,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge:true })
    setSaving(false)
    alert('Perfil salvo!')
  }

  const becomeMentor = async () => {
    setSaving(true)
    await setDoc(doc(db, 'users', uid), { role: 'MENTOR' }, { merge:true })
    await setDoc(doc(db, 'mentors', uid), {
      userId: uid,
      displayName: form.name || user.displayName || user.email,
      about: form.bio || '',
      topics: [],
      pricePerHour: 0,
      links: [],
      availability: [],
      isActive: false,
      ratingAvg: 0,
      ratingsCount: 0,
      createdAt: serverTimestamp(),
    }, { merge:true })
    setSaving(false)
    navigate('/mentor/profile')
  }

  return (
    <div className="container-xxl py-4" style={{maxWidth:720}}>
      <h3 style={{color:'var(--mh-navy)'}}>Meu perfil</h3>

      <form onSubmit={save} className="mt-3">
        <label className="form-label">Nome</label>
        <input className="form-control mb-3" value={form.name}
          onChange={e=>setForm(f=>({...f, name:e.target.value}))} />

        <label className="form-label">Bio</label>
        <textarea className="form-control mb-3" rows={3} value={form.bio}
          onChange={e=>setForm(f=>({...f, bio:e.target.value}))} />

        <label className="form-label">Interesses (separados por vírgula)</label>
        <input className="form-control mb-3" value={form.interests}
          onChange={e=>setForm(f=>({...f, interests:e.target.value}))} />

        <div className="d-flex gap-2 align-items-center mb-3">
          <span className="me-2">Tipo de conta:</span>
          <span className="badge text-bg-secondary">{role}</span>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={saving}>Salvar</button>
          {role !== 'MENTOR' ? (
            <button type="button" className="btn btn-outline-primary" onClick={becomeMentor} disabled={saving}>
              Quero ser mentor(a)
            </button>
          ) : (
            <Link to="/mentor/profile" className="btn btn-outline-primary">Editar perfil de mentor</Link>
          )}
        </div>
      </form>
    </div>
  )
}
