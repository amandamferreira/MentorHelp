import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="container-xxl py-4">
      <div className="mh-hero">
        <div className="row g-3 align-items-center">
          <div className="col-lg-8">
            <h1 className="mb-2" style={{color:'var(--mh-navy)'}}>
              Encontre a mentoria certa, rápido e fácil!
            </h1>
            <p className="text-muted mb-3">
              Conecte-se com especialistas e agende mentorias com poucos cliques.
            </p>
            <div className="d-flex gap-2">
              <Link to="/mentors" className="btn btn-primary">Quero Mentoria</Link>
              <Link to="/signup" className="btn btn-outline-primary">Sou Mentor(a)</Link>
            </div>
          </div>
          <div className="col-lg-4">{/* espaço para imagem futura */}</div>
        </div>
      </div>
    </div>
  )
}
