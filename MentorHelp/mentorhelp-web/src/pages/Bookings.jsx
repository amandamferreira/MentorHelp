import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../app/firebase'
import { useAuth } from '../app/AuthContext'

const statusPt = {
  REQUESTED: 'Solicitada',
  ACCEPTED: 'Aceita',
  CONFIRMED: 'Confirmada',
  CANCELED: 'Cancelada',
  DONE: 'Concluída',
}

const badgeClass = (s = 'REQUESTED') => ({
  REQUESTED: 'text-bg-warning',
  ACCEPTED:  'text-bg-info',
  CONFIRMED: 'text-bg-primary',
  CANCELED:  'text-bg-secondary',
  DONE:      'text-bg-success',
}[s] || 'text-bg-light')

export default function Bookings() {
  const { user } = useAuth()

  const [asClient, setAsClient]   = useState([])
  const [asMentor, setAsMentor]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const isMentorSide = (b) => b.mentorUserId === user?.uid
  const isClientSide = (b) => b.userId === user?.uid

   const load = async () => {
    if (!user) return
    setError('')
    setLoading(true)

    try {
      // sessões onde o usuário é cliente
      const qClient  = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      )

      // sessões onde o usuário é mentor
      const qMentor  = query(
        collection(db, 'bookings'),
        where('mentorUserId', '==', user.uid)
      )

      const [sClient, sMentor] = await Promise.all([
        getDocs(qClient),
        getDocs(qMentor)
      ])

      const visibleStatuses = ['REQUESTED','ACCEPTED','CONFIRMED']

      const rowsClient = sClient.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => visibleStatuses.includes(b.status))

      const rowsMentor = sMentor.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => visibleStatuses.includes(b.status))

      rowsClient.sort((a, b) => ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
      rowsMentor.sort((a, b) => ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))

      setAsClient(rowsClient)
      setAsMentor(rowsMentor)
    } catch (e) {
      console.error(e)
      setError('Erro ao carregar seus agendamentos.')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => { load() }, [user])

  // AÇÕES (mesma lógica que você já tinha)
  const accept = async (b) => {
    const room    = `MentorHelp-${b.id || crypto.randomUUID()}`
    const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(room)}`

    await updateDoc(doc(db, 'bookings', b.id), {
      status:    'ACCEPTED',
      jitsiRoom: room,
      jitsiUrl,
      acceptedAt: serverTimestamp()
    })
    load()
  }

  const decline = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), {
      status:    'CANCELED',
      canceledBy: user.uid,
      canceledAt: serverTimestamp()
    })
    load()
  }

  const confirm = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), {
      status:      'CONFIRMED',
      confirmedAt: serverTimestamp()
    })
    load()
  }

  const cancel = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), {
      status:    'CANCELED',
      canceledBy: user.uid,
      canceledAt: serverTimestamp()
    })
    load()
  }

  const done = async (b) => {
    await updateDoc(doc(db,'bookings', b.id), {
      status: 'DONE',
      doneAt: serverTimestamp()
    })
    load()
  }

  if (!user) {
    return (
      <div className="container-xxl py-4">
        Faça login para ver suas sessões.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container-xxl py-4">
        Carregando…
      </div>
    )
  }

  const renderCard = (b, side) => (
    <div className="card h-100" key={b.id}>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{b.topic || '(sem assunto)'}</h5>

        <p className="mb-1">
          <strong>Data:</strong> {b.date || '—'}{' '}
          <strong>Hora:</strong> {b.time || '—'}
        </p>
        <p className="mb-1">
          <strong>Duração:</strong> {b.duration} min
        </p>

        {side === 'client' && (
          <p className="mb-1">
            <strong>Mentor(a):</strong> {b.mentorName || b.mentorId}
          </p>
        )}

        {side === 'mentor' && (
          <p className="mb-1">
            <strong>Aluno(a):</strong> {b.userEmail || b.userId}
          </p>
        )}

        <p className="mb-2">
          <span className={`badge ${badgeClass(b.status)}`}>
            {statusPt[b.status] || b.status}
          </span>
        </p>

        <div className="mt-auto d-grid d-sm-flex gap-2">
          {/* Mentor decide sobre REQUESTED */}
          {side === 'mentor' && b.status === 'REQUESTED' && (
            <>
              <button
                className="btn btn-primary w-100 w-sm-auto"
                onClick={() => accept(b)}
              >
                Aceitar
              </button>
              <button
                className="btn btn-outline-secondary w-100 w-sm-auto"
                onClick={() => decline(b)}
              >
                Recusar
              </button>
            </>
          )}

          {/* Cliente confirma ACCEPTED */}
          {side === 'client' && b.status === 'ACCEPTED' && (
            <>
              <button
                className="btn btn-primary w-100 w-sm-auto"
                onClick={() => confirm(b)}
              >
                Confirmar
              </button>
              <button
                className="btn btn-outline-secondary w-100 w-sm-auto"
                onClick={() => cancel(b)}
              >
                Cancelar
              </button>
            </>
          )}

          {/* Entrar na sala quando Confirmada */}
          {b.status === 'CONFIRMED' && b.jitsiUrl && (
            <a
              className="btn btn-primary w-100 w-sm-auto"
              href={b.jitsiUrl}
              target="_blank"
              rel="noreferrer"
            >
              Entrar na sala
            </a>
          )}

          {/* Cliente pode cancelar pedido pendente */}
          {side === 'client' && b.status === 'REQUESTED' && (
            <button
              className="btn btn-outline-secondary w-100 w-sm-auto"
              onClick={() => cancel(b)}
            >
              Cancelar
            </button>
          )}

          {/* Mentor finaliza após a sessão */}
          {side === 'mentor' && b.status === 'CONFIRMED' && (
            <button
              className="btn btn-outline-secondary w-100 w-sm-auto"
              onClick={() => done(b)}
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-xxl py-4">
      <h3 className="mb-3" style={{ color: 'var(--mh-navy)' }}>
        Minhas sessões
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* COMO ALUNO */}
      <section className="mb-4">
        <h5 className="mb-2">Mentorias que vou receber (como aluno)</h5>

        {asClient.length === 0 && !error && (
          <div className="alert alert-secondary">
            Você ainda não tem mentorias agendadas como aluno.
          </div>
        )}

        <div className="row g-3">
          {asClient.map((b) => (
            <div className="col-12 col-md-6 col-lg-4" key={b.id}>
              {renderCard(b, 'client')}
            </div>
          ))}
        </div>
      </section>

      {/* COMO MENTOR */}
      <section>
        <h5 className="mb-2">Mentorias que vou realizar (como mentor)</h5>

        {asMentor.length === 0 && !error && (
          <div className="alert alert-secondary">
            Você ainda não tem mentorias para realizar como mentor.
          </div>
        )}

        <div className="row g-3">
          {asMentor.map((b) => (
            <div className="col-12 col-md-6 col-lg-4" key={b.id}>
              {renderCard(b, 'mentor')}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
