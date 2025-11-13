import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../app/firebase'
import { Link } from 'react-router-dom'

export default function ExploreMentors() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'mentors'))
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setMentors(rows)
      } catch (err) {
        console.error(err)
        setError((err?.code || 'erro') + ' - ' + (err?.message || 'Falha ao carregar mentores'))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const term = q.toLowerCase()
  const filtered = mentors.filter(m => {
    const name = (m.displayName || '').toLowerCase()
    const topics = (m.topics || []).join(' ').toLowerCase()
    return !term || name.includes(term) || topics.includes(term)
  })

  const formatPrice = (p) =>
    Number(p ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="container-xxl py-4">
      <div className="row align-items-center mb-3">
        <div className="col-12 col-md-6">
          <h2 className="mb-2" style={{color:'var(--mh-navy)'}}>Explorar mentores</h2>
        </div>
        <div className="col-12 col-md-6">
          <input
            className="form-control ms-md-auto"
            style={{ maxWidth: 420 }}
            placeholder="Buscar por nome ou tópico"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="alert alert-secondary">Carregando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="alert alert-warning">Nenhum mentor encontrado.</div>
      )}

      <div className="row g-3">
        {filtered.map(m => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={m.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{m.displayName || m.id}</h5>
                <p className="card-text mb-1"><strong>Tópicos:</strong> {(m.topics || []).join(', ')}</p>
                <p className="card-text"><strong>Preço/Hora:</strong> {formatPrice(m.pricePerHour)}</p>
                <Link to={`/mentors/${m.id}`} className="btn btn-primary w-100">Ver perfil</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
