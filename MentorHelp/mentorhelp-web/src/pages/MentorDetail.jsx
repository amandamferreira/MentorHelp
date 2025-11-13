import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../app/firebase'

export default function MentorDetail(){
  const { id } = useParams()
  const [m, setM] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'mentors', id))
      setM(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="container-xxl py-4">Carregando…</div>
  if (!m) return <div className="container-xxl py-4">Mentor não encontrado.</div>

  return (
    <div className="container-xxl py-4">
      <div className="bg-white rounded-4 p-3 p-md-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <h2 className="mb-0" style={{color:'var(--mh-navy)'}}>{m.displayName}</h2>
          <Link className="btn btn-primary" to={`/mentors/${m.id}/book`}>Agendar</Link>
        </div>

        <p className="text-muted mt-2 mb-1"><strong>Tópicos:</strong> {(m.topics||[]).join(', ') || '—'}</p>
        <p className="text-muted"><strong>Preço/Hora:</strong> {Number(m.pricePerHour||0).toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</p>

        <h5>Sobre</h5>
        <p>{m.about || '—'}</p>

        {!!(m.links||[]).length && (
          <>
            <h5>Links</h5>
            <ul className="mb-0">
              {(m.links||[]).map((l,i)=>(
                <li key={i}><a href={l} target="_blank" rel="noreferrer">{l}</a></li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
