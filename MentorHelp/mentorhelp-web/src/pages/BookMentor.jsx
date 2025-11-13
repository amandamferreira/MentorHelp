import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../app/firebase'
import { useAuth } from '../app/AuthContext'

export default function BookMentor() {
  const { id: mentorId } = useParams() // id do documento em /mentors
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mentor, setMentor] = useState(null)
  const [form, setForm] = useState({
    topic: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        if (!mentorId) {
          setError('Mentor não informado na URL.')
          return
        }

        const snap = await getDoc(doc(db, 'mentors', mentorId))

        if (!snap.exists()) {
          setError('Mentor não encontrado.')
          setMentor(null)
          return
        }

        setMentor({ id: snap.id, ...snap.data() })
      } catch (e) {
        console.error('Erro carregando mentor:', e)
        setError('Não foi possível carregar os dados do mentor.')
      }
    })()
  }, [mentorId])

  if (!user) {
    return (
      <div className="container-xxl py-4">
        Faça login para agendar.
      </div>
    )
  }

  if (!mentor && !error) {
    return (
      <div className="container-xxl py-4">
        Carregando mentor…
      </div>
    )
  }

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.topic?.trim() || !form.date || !form.time) {
      setError('Preencha tópico, data e hora.')
      return
    }

    try {
      setSaving(true)

      const mentorName =
        mentor?.name ||
        mentor?.displayName ||
        'Mentor'

      const mentorUserId =
        mentor?.userId || // se você salvar o UID do mentor aqui na criação em /mentors
        mentorId          // quebra-galho: id do doc (se ele for igual ao uid)

      await addDoc(collection(db, 'bookings'), {
        // cliente
        userId: user.uid,
        userEmail: user.email || null,

        // mentor
        mentorId,          // id do doc em /mentors
        mentorUserId,      // usado pra tela do mentor ver as sessões
        mentorName,        // nome exibido na tela de agendadas

        // dados da sessão
        topic: form.topic.trim(),
        date: form.date,
        time: form.time,
        duration: Number(form.duration) || 60,
        notes: form.notes || '',

        // controle de status
        status: 'REQUESTED',
        createdAt: serverTimestamp()
      })

      navigate('/bookings')
    } catch (e) {
      console.error('Erro ao agendar:', e)
      setError(
        e?.message?.includes('Missing or insufficient permissions')
          ? 'Permissão negada nas regras do Firestore. Confira se está logado(a) e as regras do banco.'
          : `Erro ao agendar: ${e?.message || e}`
      )
    } finally {
      setSaving(false)
    }
  }

  const mentorDisplayName =
    mentor?.name ||
    mentor?.displayName ||
    'Mentor'

  return (
    <div className="container-xxl py-4">
      <div
        className="mx-auto bg-white rounded-4 p-3 p-md-4 shadow-sm"
        style={{ maxWidth: 720 }}
      >
        <h3 className="mb-3" style={{ color: 'var(--mh-navy)' }}>
          Agendar com {mentorDisplayName}
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Tópico</label>
            <input
              className="form-control"
              value={form.topic}
              onChange={handleChange('topic')}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-control"
              value={form.date}
              onChange={handleChange('date')}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Hora</label>
            <input
              type="time"
              className="form-control"
              value={form.time}
              onChange={handleChange('time')}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Duração (min)</label>
            <input
              type="number"
              min="15"
              step="15"
              className="form-control"
              value={form.duration}
              onChange={handleChange('duration')}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Observações</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.notes}
              onChange={handleChange('notes')}
            />
          </div>

          <div className="col-12 d-grid d-sm-flex gap-2">
            <button
              className="btn btn-primary w-100 w-sm-auto"
              disabled={saving}
              type="submit"
            >
              {saving ? 'Agendando…' : 'Confirmar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
