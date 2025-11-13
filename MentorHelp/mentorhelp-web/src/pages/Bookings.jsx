import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../app/firebase'
import { useAuth } from '../app/AuthContext'

const statusPt = {
  REQUESTED: 'Solicitada',
  ACCEPTED: 'Aceita',
  CONFIRMED: 'Confirmada',
  CANCELED: 'Cancelada',
  DONE: 'Concluída',
}

const badgeClass = (s='REQUESTED') => ({
  REQUESTED: 'text-bg-warning',
  ACCEPTED:  'text-bg-info',
  CONFIRMED: 'text-bg-primary',
  CANCELED:  'text-bg-secondary',
  DONE:      'text-bg-success',
}[s] || 'text-bg-light')

export default function Bookings(){
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isMentor = (b) => b.mentorUserId === user?.uid   // <<< usa mentorUserId
  const isClient = (b) => b.userId === user?.uid

  const load = async () => {
    if (!user) return
    setError(''); setLoading(true)
    try {
      // Busca por cliente e por mentor (mentorUserId)
      const q1 = query(collection(db, 'bookings'), where('userId','==', user.uid))
      const q2 = query(collection(db, 'bookings'), where('mentorUserId','==', user.uid))
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
      const rows = [...s1.docs, ...s2.docs].map(d=>({ id:d.id, ...d.data() }))
      rows.sort((a,b)=>((b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)))
      setList(rows)
    } catch (e) {
      console.error(e)
      setError('Erro ao carregar seus agendamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  // AÇÕES (Dupla confirmação)
  const accept = async (b) => {
    const room = `MentorHelp-${b.id || crypto.randomUUID()}`
    const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(room)}`
    await updateDoc(doc(db,'bookings', b.id), {
      status:'ACCEPTED', jitsiRoom: room, jitsiUrl, acceptedAt: serverTimestamp()
    })
    load()
  }
  const decline = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), { status:'CANCELED', canceledBy:user.uid, canceledAt:serverTimestamp() })
    load()
  }
  const confirm = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), { status:'CONFIRMED', confirmedAt: serverTimestamp() })
    load()
  }
  const cancel = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), { status:'CANCELED', canceledBy:user.uid, canceledAt:serverTimestamp() })
    load()
  }
  const done = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), { status:'DONE', doneAt: serverTimestamp() })
    load()
  }

  if (!user) return <div className="container-xxl py-4">Faça login para ver suas sessões.</div>
  if (loading) return <div className="container-xxl py-4">Carregando…</div>

  return (
    <div className="container-xxl py-4">
      <h3 className="mb-3" style={{color:'var(--mh-navy)'}}>Minhas sessões</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {list.length === 0 && !error && <div className="alert alert-secondary">Nenhuma sessão encontrada.</div>}

      <div className="row g-3">
        {list.map(b => (
          <div className="col-12 col-md-6 col-lg-4" key={b.id}>
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{b.topic || '(sem assunto)'}</h5>

                <p className="mb-1"><strong>Data:</strong> {b.date || '—'} <strong>Hora:</strong> {b.time || '—'}</p>
                <p className="mb-1"><strong>Duração:</strong> {b.duration} min</p>
                <p className="mb-1"><strong>Mentor(a):</strong> {b.mentorName || b.mentorId}</p>
                <p className="mb-2">
                  <span className={`badge ${badgeClass(b.status)}`}>{statusPt[b.status] || b.status}</span>
                </p>

                <div className="mt-auto d-grid d-sm-flex gap-2">
                  {/* Mentor decide sobre REQUESTED */}
                  {isMentor(b) && b.status === 'REQUESTED' && (
                    <>
                      <button className="btn btn-primary w-100 w-sm-auto" onClick={()=>accept(b)}>Aceitar</button>
                      <button className="btn btn-outline-secondary w-100 w-sm-auto" onClick={()=>decline(b)}>Recusar</button>
                    </>
                  )}

                  {/* Cliente confirma ACCEPTED */}
                  {isClient(b) && b.status === 'ACCEPTED' && (
                    <>
                      <button className="btn btn-primary w-100 w-sm-auto" onClick={()=>confirm(b)}>Confirmar</button>
                      <button className="btn btn-outline-secondary w-100 w-sm-auto" onClick={()=>cancel(b)}>Cancelar</button>
                    </>
                  )}

                  {/* Entrar na sala quando Confirmada */}
                  {b.status === 'CONFIRMED' && b.jitsiUrl && (
                    <a className="btn btn-primary w-100 w-sm-auto" href={b.jitsiUrl} target="_blank" rel="noreferrer">Entrar na sala</a>
                  )}

                  {/* Cliente pode cancelar pedido pendente */}
                  {(b.status === 'REQUESTED' && isClient(b)) && (
                    <button className="btn btn-outline-secondary w-100 w-sm-auto" onClick={()=>cancel(b)}>Cancelar</button>
                  )}

                  {/* Mentor finaliza após a sessão */}
                  {(b.status === 'CONFIRMED' && isMentor(b)) && (
                    <button className="btn btn-outline-secondary w-100 w-sm-auto" onClick={()=>done(b)}>Finalizar</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
