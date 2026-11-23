import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:8000/api/requests/' // <-- For step 3, we will change this one line to your online Django URL

const inputStyle = { width: '100%', padding: '13px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }
const cardBtn = { background: '#111827', color: 'white', padding: '11px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '700' }
const primaryBtn = { background: '#0f766e', color: 'white', padding: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '800', fontSize: '15px' }

const FUNDING = [
  { title: 'NYDA Grant Funding', desc: 'For youth-owned businesses (18-35). Up to R200k for equipment & stock.', tag: 'Youth' },
  { title: 'SEFA Small Business Loan', desc: 'Low-interest loans for township & rural businesses.', tag: 'Loan' },
  { title: 'DSBD Spaza Support', desc: 'Support for spaza shops & informal traders - stock & equipment.', tag: 'Grant' },
]
const TRAINING = [
  { title: 'Business Basics - 2 Days', desc: 'Pricing, bookkeeping & marketing. Free, in East London.', tag: 'Beginner' },
  { title: 'Digital Marketing', desc: 'WhatsApp, Facebook & TikTok for your business. Online + in-person.', tag: 'Online' },
  { title: 'Financial Literacy', desc: 'Budgeting, saving & applying for funding. Certificate included.', tag: 'Free' },
]

function App() {
  const [requests, setRequests] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Business Support')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')
  const [loginName, setLoginName] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [regName, setRegName] = useState('')
  const [regPass, setRegPass] = useState('')
  const [view, setView] = useState('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = async () => {
    try {
      const res = await fetch(API)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : data.results || [])
    } catch (e) { console.log(e) }
  }
  useEffect(() => { load() }, [])

  const doCreate = async (e) => {
    e.preventDefault()
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, category, status: 'OPEN' }) })
    if (res.ok) { setTitle(''); setDescription(''); load(); setMessage('✅ Request submitted!') }
    else { setMessage('Failed to submit') }
  }

  const applyFor = async (item, cat) => {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: item.title, description: `Applied for: ${item.desc}`, category: cat, status: 'OPEN' }) })
    if (res.ok) { load(); setMessage(`✅ Applied for ${item.title}!`); setView('all') }
    else { setMessage('Failed to apply') }
  }

  const doRegister = (e) => {
    e.preventDefault()
    if (!regName || !regPass) return setMessage('Fill in username + password')
    const users = JSON.parse(localStorage.getItem('ubuntu_users') || '{}')
    if (users[regName]) return setMessage('That username already exists - try login')
    users[regName] = regPass
    localStorage.setItem('ubuntu_users', JSON.stringify(users))
    setMessage('✅ Registered! Now login.')
    setLoginName(regName); setLoginPass(''); setPage('login')
  }

  const doLogin = (e) => {
    e.preventDefault()
    if (!loginName) return
    const users = JSON.parse(localStorage.getItem('ubuntu_users') || '{}')
    if (users[loginName] && users[loginName] !== loginPass) return setMessage('Wrong password for ' + loginName)
    setUser({ name: loginName }); setPage('home'); setMessage('')
  }

  const doDelete = async (id) => {
    if (!confirm('Delete this request?')) return
    await fetch(`${API}${id}/`, { method: 'DELETE' })
    setRequests(prev => prev.filter(r => r.id !== id)); load()
  }

  const doStatus = async (r) => {
    const next = r.status === 'OPEN' ? 'IN_PROGRESS' : r.status === 'IN_PROGRESS' ? 'DONE' : 'OPEN'
    const res = await fetch(`${API}${r.id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    if (res.ok) load()
    else setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: next } : x))
  }

  if (page === 'login' || page === 'register' || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f766e 0%, #14b8a6 35%, #eef2f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', width: '100%', maxWidth: '420px', padding: '32px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#0f766e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', margin: '0 auto 12px' }}>U</div>
          <h1 style={{ margin: '0', color: '#111827', fontSize: '30px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>UBUNTU Support</h1>
          <p style={{ color: '#4b5563', marginTop: '8px' }}>Business support, funding & training - all in one place.</p>
          <p style={{ color: '#dc2626', fontWeight: '700' }}>{message}</p>
          {page === 'register' ? (
            <form onSubmit={doRegister} style={{ textAlign: 'left', marginTop: '10px' }}>
              <h3 style={{ textAlign: 'center' }}>Create Account</h3>
              <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Choose username" style={inputStyle} />
              <input value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Choose password" type="password" style={inputStyle} />
              <button style={primaryBtn}>Register</button>
              <button type="button" onClick={() => { setPage('login'); setMessage('') }} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', marginTop: '12px', width: '100%', fontWeight: '700' }}>Already have account? Login</button>
            </form>
          ) : page === 'login' ? (
            <form onSubmit={doLogin} style={{ textAlign: 'left', marginTop: '10px' }}>
              <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Username" style={inputStyle} />
              <input value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" type="password" style={inputStyle} />
              <button style={primaryBtn}>Login</button>
              <button type="button" onClick={() => { setPage('register'); setMessage('') }} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', marginTop: '12px', width: '100%', fontWeight: '700' }}>No account? Register here</button>
              <button type="button" onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginTop: '6px', width: '100%' }}>Back</button>
            </form>
          ) : (
            <>
              <button style={{ ...primaryBtn, marginTop: '20px' }} onClick={() => setPage('login')}>Login to Continue</button>
              <button onClick={() => setPage('register')} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', marginTop: '12px', width: '100%', fontWeight: '700' }}>No account? Register here</button>
              <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '14px' }}>You must be logged in to request support.</p>
            </>
          )}
        </div>
      </div>
    )
  }

  // 1. DASHBOARD NUMBERS
  const total = requests.length
  const openCount = requests.filter(r => r.status === 'OPEN').length
  const progressCount = requests.filter(r => r.status === 'IN_PROGRESS').length
  const doneCount = requests.filter(r => r.status === 'DONE').length

  const base = view === 'funding' ? requests.filter(r => r.category === 'Funding Opportunities')
    : view === 'training' ? requests.filter(r => r.category === 'Training')
    : view === 'support' ? requests.filter(r => ['Business Support','Plumbing','Electrical'].includes(r.category))
    : requests
  const shownRequests = base.filter(r => {
    const q = search.toLowerCase()
    const matchesSearch = !q || (r.title + ' ' + (r.description||'') + ' ' + r.category).toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(90deg, #0f766e, #14b8a6)', padding: '22px', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div><h2 style={{ margin: '0', color: 'white', lineHeight: '1.2' }}>UBUNTU Support</h2><p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>Hi {user.name}! How can we help today?</p></div>
          <button onClick={() => setUser(null)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Logout</button>
        </div>

        {/* 1. DASHBOARD */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Requests', val: total, bg: '#111827', color: 'white' },
            { label: 'Open', val: openCount, bg: '#fee2e2', color: '#991b1b' },
            { label: 'In Progress', val: progressCount, bg: '#fef9c3', color: '#854d0e' },
            { label: 'Done', val: doneCount, bg: '#dcfce7', color: '#166534' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, color: s.color, flex: 1, minWidth: '120px', padding: '16px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1' }}>{s.val}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '6px', opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{ color: 'green', textAlign: 'center', fontWeight: '700' }}>{message}</p>

        {view === 'all' && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', textAlign: 'center', flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '28px' }}>🛠️</div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', minHeight: '42px' }}>Submit requests for business development assistance.</p>
              <button style={cardBtn} onClick={() => { setView('support'); setCategory('Business Support'); setMessage('') }}>Request Support</button>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', textAlign: 'center', flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '28px' }}>💰</div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', minHeight: '42px' }}>Discover available funding opportunities for your business.</p>
              <button style={cardBtn} onClick={() => { setView('funding'); setMessage('') }}>View Funding</button>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', textAlign: 'center', flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '28px' }}>🎓</div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', minHeight: '42px' }}>Find training programmes to develop your business skills.</p>
              <button style={cardBtn} onClick={() => { setView('training'); setMessage('') }}>View Training</button>
            </div>
          </div>
        )}

        {view === 'funding' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', marginBottom: '18px' }}>
            <button onClick={() => setView('all')} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontWeight: '700', padding: '0' }}>← Back to Home</button>
            <h3 style={{ fontSize: '22px' }}>💰 Funding Opportunities</h3>
            {FUNDING.map(f => (
              <div key={f.title} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{f.title}</b><span style={{ background: '#ccfbf1', color: '#0f766e', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{f.tag}</span></div>
                <p style={{ color: '#475569', fontSize: '14px' }}>{f.desc}</p>
                <button style={{ ...primaryBtn, width: 'auto', padding: '10px 18px' }} onClick={() => applyFor(f, 'Funding Opportunities')}>Apply for Funding →</button>
              </div>
            ))}
          </div>
        )}

        {view === 'training' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', marginBottom: '18px' }}>
            <button onClick={() => setView('all')} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontWeight: '700', padding: '0' }}>← Back to Home</button>
            <h3 style={{ fontSize: '22px' }}>🎓 Training Programmes</h3>
            {TRAINING.map(f => (
              <div key={f.title} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{f.title}</b><span style={{ background: '#ccfbf1', color: '#0f766e', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{f.tag}</span></div>
                <p style={{ color: '#475569', fontSize: '14px' }}>{f.desc}</p>
                <button style={{ ...primaryBtn, width: 'auto', padding: '10px 18px' }} onClick={() => applyFor(f, 'Training')}>Book Training →</button>
              </div>
            ))}
          </div>
        )}

        {(view === 'all' || view === 'support') && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            {view === 'support' && <button onClick={() => setView('all')} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontWeight: '700', padding: '0' }}>← Back to Home</button>}
            <h3 style={{ textAlign: 'center', marginTop: '8px' }}>Create New Request</h3>
            <form onSubmit={doCreate}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Leaking tap in Room 12 / Need funding advice" style={inputStyle} />
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                <option>Plumbing</option><option>Electrical</option><option>Business Support</option><option>Funding Opportunities</option><option>Training</option>
              </select>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the problem in detail..." rows={3} style={inputStyle} />
              <button style={primaryBtn}>Submit Request</button>
            </form>

            <h4 style={{ textAlign: 'center' }}>My Requests {view !== 'all' ? `(${view})` : ''} — Showing {shownRequests.length} of {total}</h4>
            <div style={{ display: 'flex', gap: '10px', maxWidth: '560px', margin: '0 auto 14px' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search requests..." style={{ ...inputStyle, marginBottom: '0' }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, marginBottom: '0', width: '150px' }}>
                <option value="ALL">All Status</option><option value="OPEN">OPEN</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">DONE</option>
              </select>
            </div>
            <ul style={{ maxWidth: '560px', margin: '0 auto', listStyle: 'none', padding: '0' }}>
              {shownRequests.map(r => (
                <li key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}><b>{r.title}</b><span style={{ background: r.status === 'DONE' ? '#dcfce7' : r.status === 'IN_PROGRESS' ? '#fef9c3' : '#fee2e2', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{r.status}</span></div>
                  <p style={{ margin: '6px 0', color: '#475569', fontSize: '13px' }}>{r.category} - #{r.id} - {r.description}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => doStatus(r)} style={{ background: '#0f766e', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Change Status →</button>
                    <button onClick={() => doDelete(r.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Delete 🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
            {shownRequests.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280' }}>No requests found.</p>}
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '18px' }}>UBUNTU Support • East London • Built with React + Django</p>
          </div>
        )}
      </div>
    </div>
  )
}
export default App