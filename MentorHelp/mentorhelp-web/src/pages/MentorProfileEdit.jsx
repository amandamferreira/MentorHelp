import { useEffect, useState } from 'react'
import { useAuth } from '../app/AuthContext'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../app/firebase'

export default function MentorProfileEdit(){
  const { user } = useAuth()
  const uid = user.uid
  const [form, setForm] = useState({
    displayName: '', about: '', topics: '', pricePerHour: 0,
    links: '', availability: '', isActive: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'mentors', uid))
      const d = snap.exists() ? snap.data() : {}
      setForm({
        displayName: d.displayName || user.displayName || '',
        about: d.about || '',
        topics: (d.topics || []).join(', '),
        pricePerHour: d.pricePerHour ?? 0,
        links: (d.links || []).join(', '),
        availability: (d.availability || []).join(', '),
        isActive: !!d.isActive,
      })
    })()
  }, [uid, user.displayName])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    await setDoc(doc(db, 'mentors', uid), {
      userId: uid,
      displayName: form.displayName,
      about: form.about,
      topics: form.topics.split(',').map(s=>s.trim()).filter(Boolean),
      pricePerHour: Number(form.pricePerHour) || 0,
      links: form.links.split(',').map(s=>s.trim()).filter(Boolean),
      availability: form.availability.split(',').map(s=>s.trim()).filter(Boolean),
      isActive: form.isActive,
      updatedAt: serverTimestamp()
    }, { merge:true })
    setSaving(false)
    alert('Perfil de mentor salvo!')
  }

  return (
    <div className="container-xxl py-4" style={{maxWidth:820}}>
      <h3 style={{color:'var(--mh-navy)'}}>Perfil do mentor</h3>

      <form onSubmit={save} className="mt-3">
        <label className="form-label">Nome público</label>
        <input className="form-control mb-3" value={form.displayName}
          onChange={e=>setForm(f=>({...f, displayName:e.target.value}))} />

        <label className="form-label">Sobre</label>
        <textarea className="form-control mb-3" rows={3} value={form.about}
          onChange={e=>setForm(f=>({...f, about:e.target.value}))} />

        <label className="form-label">Tópicos (separados por vírgula)</label>
        <input className="form-control mb-3" value={form.topics}
          onChange={e=>setForm(f=>({...f, topics:e.target.value}))} />

        <label className="form-label">Preço por hora (R$)</label>
        <input className="form-control mb-3" type="number" min="0" step="1" value={form.pricePerHour}
          onChange={e=>setForm(f=>({...f, pricePerHour:e.target.value}))} />

        <label className="form-label">Links (LinkedIn, portfólio… separados por vírgula)</label>
        <input className="form-control mb-3" value={form.links}
          onChange={e=>setForm(f=>({...f, links:e.target.value}))} />

        <label className="form-label">Disponibilidade (ex.: seg 19:00, qua 14:00)</label>
        <input className="form-control mb-3" value={form.availability}
          onChange={e=>setForm(f=>({...f, availability:e.target.value}))} />

        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="isActive"
            checked={form.isActive} onChange={e=>setForm(f=>({...f, isActive:e.target.checked}))} />
          <label className="form-check-label" htmlFor="isActive">
            Aparecer na listagem de mentores
          </label>
        </div>

        <button className="btn btn-primary" disabled={saving}>Salvar</button>
      </form>
    </div>
  )
}
