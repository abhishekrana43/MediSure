
import { useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Bell, ChevronDown, ClipboardList, FileUp, LayoutDashboard,
  Menu, Package, Pill, Search, ShieldCheck, ShieldAlert,
  ScanLine, Settings, X, Clock3, CheckCircle2, LogOut
} from 'lucide-react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Medicine Inventory', icon: Package },
  { label: 'Verify Medicine', icon: ScanLine },
  { label: 'Bulk Import', icon: FileUp },
  { label: 'Scan History', icon: ClipboardList },
]

function App() {
  const [page, setPage] = useState('Overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [serial, setSerial] = useState('')
  const [verification, setVerification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('unknown')

  async function verifyMedicine(event) {
    event.preventDefault()
    if (!serial.trim()) return

    setLoading(true)
    setError('')
    setVerification(null)

    try {
      const response = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: serial.trim() }),
      })

      const data = await response.json()

      console.log('MediSure verification API response:', data)

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Verification request failed.')
      }

      setVerification(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Make sure the Express server is running on port 5000.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  async function checkBackend() {
    try {
      const response = await fetch(`${API_BASE.replace(/\/api\/v1\/?$/, '')}/`)
      setApiStatus(response.ok ? 'online' : 'offline')
    } catch {
      setApiStatus('offline')
    }
  }

  // const status = verification?.result || verification?.status
  // const risk = verification?.riskScore ?? verification?.risk ?? verification?.riskScore
  // const medicine = verification?.medicine || verification?.data?.medicine || null
  
     const resultData = verification?.data ?? verification
     const status = resultData?.result ?? resultData?.status
     const risk = resultData?.riskScore ?? resultData?.risk
     const medicine = resultData?.medicine ?? null

    const resultLabel = String(status || '').toUpperCase()

  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-overlay" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}

      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={24} /></div>
          <div>
            <div className="brand-name">MediSure</div>
            <div className="brand-subtitle">MEDICINE INTELLIGENCE</div>
          </div>
          <button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${page === label ? 'nav-active' : ''}`}
              onClick={() => {
                setPage(label)
                setMobileMenu(false)
                setError('')
              }}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Verify Medicine' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <div className="security-icon"><ShieldCheck size={19} /></div>
            <div className="security-title">Trust through verification</div>
            <p>Traceable records. Informed decisions.</p>
          </div>
          <button className="nav-item settings-item" onClick={() => setPage('Settings')}>
            <Settings size={19} /><span>Settings</span>
          </button>
          <div className="user-profile">
            <div className="avatar">MS</div>
            <div className="user-details">
              <strong>Demo Workspace</strong>
              <span>Local development</span>
            </div>
            <ChevronDown size={16} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileMenu(true)}><Menu size={21} /></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className={`connection-pill ${apiStatus}`}>
              <span className="connection-dot" />
              {apiStatus === 'online' ? 'API connected' : apiStatus === 'offline' ? 'API offline' : 'API not checked'}
            </div>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><span /></button>
            <div className="topbar-divider" />
            <div className="topbar-avatar">MS</div>
          </div>
        </header>

        <div className="page-content">
          {page === 'Overview' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Activity size={14} /> MEDICINE SAFETY PLATFORM</div>
                  <h1>Good to see you.</h1>
                  <p className="page-description">Monitor medicine records and verify product identifiers from one workspace.</p>
                </div>
                <button className="button-primary" onClick={() => setPage('Verify Medicine')}><ScanLine size={17} /> Verify a medicine</button>
              </div>

              <section className="notice-banner">
                <div className="notice-icon"><ShieldCheck size={21} /></div>
                <div className="notice-copy">
                  <strong>Verification workspace</strong>
                  <p>Results are based on registered records and the backend's current risk rules.</p>
                </div>
                <button className="text-button" onClick={checkBackend}>Check API <ArrowUpRight size={15} /></button>
              </section>

              <div className="section-heading">
                <div><h2>Workspace overview</h2><p>Live statistics will be added when the dashboard API is available.</p></div>
                <span className="date-chip"><Clock3 size={14} /> Local development</span>
              </div>

              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top"><span>Total medicines</span><span className="stat-icon blue"><Pill size={19} /></span></div>
                  <div className="stat-value">—</div>
                  <div className="stat-foot">Registered medicine records</div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Verified scans</span><span className="stat-icon green"><ShieldCheck size={19} /></span></div>
                  <div className="stat-value">—</div>
                  <div className="stat-foot">Verification history</div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Flagged records</span><span className="stat-icon amber"><ShieldAlert size={19} /></span></div>
                  <div className="stat-value">—</div>
                  <div className="stat-foot">Suspicious or unregistered</div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Recent activity</span><span className="stat-icon violet"><Activity size={19} /></span></div>
                  <div className="stat-value">—</div>
                  <div className="stat-foot">Recorded scan events</div>
                </article>
              </section>

              <div className="section-heading lower-heading">
                <div><h2>Quick actions</h2><p>Choose a task to get started.</p></div>
              </div>
              <section className="quick-grid">
                <button className="quick-card" onClick={() => setPage('Verify Medicine')}>
                  <div className="quick-icon"><ScanLine size={21} /></div><div className="quick-text"><strong>Verify medicine</strong><span>Check a serial number against registered records.</span></div><ArrowUpRight size={17} className="quick-arrow" />
                </button>
                <button className="quick-card" onClick={() => setPage('Medicine Inventory')}>
                  <div className="quick-icon"><Package size={21} /></div><div className="quick-text"><strong>Explore inventory</strong><span>Review registered medicine records.</span></div><ArrowUpRight size={17} className="quick-arrow" />
                </button>
                <button className="quick-card" onClick={() => setPage('Bulk Import')}>
                  <div className="quick-icon"><FileUp size={21} /></div><div className="quick-text"><strong>Import stock data</strong><span>Prepare a bulk medicine import.</span></div><ArrowUpRight size={17} className="quick-arrow" />
                </button>
              </section>

              <section className="bottom-panel">
                <div className="panel-heading"><div><h2>System connection</h2><p>Check whether the backend can be reached.</p></div><span className={`status-label ${apiStatus}`}>{apiStatus === 'online' ? 'Connected' : apiStatus === 'offline' ? 'Unavailable' : 'Not checked'}</span></div>
                <div className="connection-row"><span className="connection-symbol"><Activity size={18} /></span><div className="connection-details"><strong>Express REST API</strong><span>{API_BASE}</span></div><button className="button-secondary" onClick={checkBackend}>Test connection</button></div>
              </section>
            </>
          )}

          {page === 'Verify Medicine' && (
            <>
              <div className="welcome-row">
                <div><div className="eyebrow"><ScanLine size={14} /> PRODUCT AUTHENTICATION</div><h1>Verify medicine</h1><p className="page-description">Check a package serial number against the registered medicine database.</p></div>
              </div>
              <section className="verify-layout">
                <div className="content-card verify-card">
                  <div className="card-heading"><div className="heading-icon"><ScanLine size={20} /></div><div><h2>Serial number lookup</h2><p>Enter the serial number printed on the package.</p></div></div>
                  <form onSubmit={verifyMedicine}>
                    <label className="field-label" htmlFor="serial-number">Medicine serial number</label>
                    <div className="input-wrap"><Search size={18} /><input id="serial-number" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="e.g. MS-2026-000001" autoComplete="off" /></div>
                    <p className="field-hint">Use an identifier from your registered test dataset.</p>
                    <button className="button-primary verify-submit" disabled={loading || !serial.trim()}>{loading ? <span className="spinner" /> : <ShieldCheck size={17} />}{loading ? 'Checking records…' : 'Verify serial number'}</button>
                  </form>
                  {error && <div className="inline-error"><AlertTriangle size={18} /><span>{error}</span></div>}
                  <div className="verification-disclaimer"><ShieldAlert size={17} /><p>A registered serial number alone cannot prove that the physical package is genuine. A copied identifier may require additional investigation.</p></div>
                </div>
                <div className="content-card result-card">
                  <div className="card-heading"><div className="heading-icon"><ClipboardList size={20} /></div><div><h2>Verification result</h2><p>Backend response</p></div></div>
                  {!verification ? (
                    <div className="empty-result"><div className="empty-illustration"><ScanLine size={30} /></div><strong>Awaiting verification</strong><p>Submit a serial number to see its classification and risk assessment here.</p></div>
                  ) : (
                    <div className="result-content">
                      <div className={`result-status ${resultLabel === 'GENUINE' ? 'result-genuine' : resultLabel === 'COUNTERFEIT' ? 'result-counterfeit' : 'result-suspicious'}`}>
                        {resultLabel === 'GENUINE' ? <CheckCircle2 size={23} /> : <AlertTriangle size={23} />}
                        <div><strong>{resultLabel || 'RESULT RECEIVED'}</strong><span>Classification returned by API</span></div>
                      </div>
                      <div className="result-details">
                        <div><span>Serial number</span><strong>{serial}</strong></div>
                        {medicine?.name && <div><span>Medicine</span><strong>{medicine.name}</strong></div>}
                        {medicine?.manufacturer && <div><span>Manufacturer</span><strong>{medicine.manufacturer}</strong></div>}
                        {risk != null && <div><span>Risk score</span><strong>{risk}/100</strong></div>}
                        {(verification.reason || verification.message) && <div className="reason-row"><span>Assessment</span><p>{verification.reason || verification.message}</p></div>}
                      </div>
                      <button className="button-secondary full-width" onClick={() => { setVerification(null); setError(''); setSerial('') }}>Verify another serial</button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {page === 'Medicine Inventory' && <ComingSoon title="Medicine inventory" description="Inventory search and medicine records will connect to your existing medicine endpoints next." icon={Package} />}
          {page === 'Bulk Import' && <ComingSoon title="Bulk stock import" description="The CSV upload workflow will be wired to your backend bulk-import route after we confirm its request format." icon={FileUp} />}
          {page === 'Scan History' && <ComingSoon title="Scan history" description="Recorded verification events and pagination will be connected to the scan-history endpoint." icon={ClipboardList} />}
          {page === 'Settings' && <ComingSoon title="Settings" description="Workspace preferences and account controls will be added here." icon={Settings} />}
        </div>

        <footer className="app-footer"><span>© {new Date().getFullYear()} MediSure</span><span><span className="footer-dot" /> Medicine safety workspace</span><span>Prototype · Synthetic test records</span></footer>
      </main>
    </div>
  )
}

function ComingSoon({ title, description, icon: Icon }) {
  return (
    <div className="placeholder-page">
      <div className="eyebrow"><Activity size={14} /> MEDISURE WORKSPACE</div>
      <div className="placeholder-icon"><Icon size={30} /></div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="placeholder-note"><AlertTriangle size={17} /><span>This screen is a UI placeholder, not a connected feature yet.</span></div>
    </div>
  )
}

export default App
