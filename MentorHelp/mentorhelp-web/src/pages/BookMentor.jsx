import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../app/firebase'
import { useAuth } from '../app/AuthContext'

export default function BookMentor(){
  const { id: mentorId } = useParams()        // id do documento em /mentors (pode ser aleatório)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mentor, setMentor] = useState(null)
  const [form, setForm] = useState({ topic:'', date:'', time:'', duration:60, notes:'' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'mentors', mentorId))
        setMentor(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      } catch (e) {
        console.error('Erro carregando mentor:', e)
        setError('Não foi possível carregar os dados do mentor.')
      }
    })()
  }, [mentorId])

  if (!user) return <div className="container-xxl py-4">Faça login para agendar.</div>
  if (!mentor) return <div className="container-xxl py-4">Carregando mentor…</div>

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.topic?.trim() || !form.date || !form.time) {
      setError('Preencha tópico, data e hora.')
      return
    }

    try {
      setSaving(true)

      await addDoc(collection(db, 'bookings'), {
        // participante cliente
        userId: user.uid,

        // identificadores do mentor
        mentorId,                        // id do doc em /mentors (pode ser aleatório)
        mentorUserId: mentor.userId || mentorId, // uid real do mentor (se existir), senão quebra-galho

        mentorName: mentor.displayName || mentorId,
        topic: form.topic.trim(),
        date: form.date,
        time: form.time,
        duration: Number(form.duration) || 60,
        notes: form.notes || '',
        status: 'REQUESTED',
        createdAt: serverTimestamp(),
      })

      navigate('/bookings')
    } catch (e) {
      console.error('Erro ao agendar:', e)
      setError(
        e?.message?.includes('Missing or insufficient permissions')
          ? 'Permissão negada nas regras do Firestore. Confira as regras e se está logada.'
          : `Erro ao agendar: ${e?.message || e}`
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-xxl py-4">
      <div className="mx-auto bg-white rounded-4 p-3 p-md-4 shadow-sm" style={{maxWidth:720}}>
        <h3 className="mb-3" style={{color:'var(--mh-navy)'}}>Agendar com {mentor.displayName}</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Tópico</label>
            <input className="form-control" value={form.topic}
                   onChange={e=>setForm(f=>({...f, topic:e.target.value}))} required />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Data</label>
            <input type="date" className="form-control" value={form.date}
                   onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Hora</label>
            <input type="time" className="form-control" value={form.time}
                   onChange={e=>setForm(f=>({...f, time:e.target.value}))} required />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Duração (min)</label>
            <input type="number" min="15" step="15" className="form-control" value={form.duration}
                   onChange={e=>setForm(f=>({...f, duration:e.target.value}))} />
          </div>

          <div className="col-12">
            <label className="form-label">Observações</label>
            <textarea className="form-control" rows={3} value={form.notes}
                      onChange={e=>setForm(f=>({...f, notes:e.target.value}))} />
          </div>

          <div className="col-12 d-grid d-sm-flex gap-2">
            <button className="btn btn-primary w-100 w-sm-auto" disabled={saving}>
              {saving ? 'Agendando…' : 'Confirmar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
