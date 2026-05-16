// src/App.jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider, useT } from './i18n.js'
import Home from './screens/Home.jsx'
import NewLabel from './screens/NewLabel.jsx'
import Settings from './screens/Settings.jsx'
import './app.css'

function Nav() {
  const { t, lang, setLang } = useT()
  return (
    <nav style={{ background: '#222', color: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontWeight: 'bold', marginRight: 16, padding: '10px 0' }}>OCRLabel</span>
      <a href="#/" style={{ color: '#ccc', textDecoration: 'none', padding: '10px 8px' }}>{t('nav_labels')}</a>
      <a href="#/new" style={{ color: '#ccc', textDecoration: 'none', padding: '10px 8px' }}>{t('nav_new')}</a>
      <div style={{ flex: 1 }} />
      <a href="#/settings" style={{ color: '#ccc', textDecoration: 'none', padding: '10px 8px' }}>{t('nav_settings')}</a>
      <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
        {['en', 'nl'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '4px 8px',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid #555',
              color: lang === l ? '#fff' : '#aaa',
              fontWeight: lang === l ? 'bold' : 'normal',
              textDecoration: lang === l ? 'underline' : 'none',
              fontSize: 12,
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
          <Nav />
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new" element={<NewLabel />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </LanguageProvider>
  )
}
