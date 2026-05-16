import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './screens/Home.jsx'
import NewLabel from './screens/NewLabel.jsx'
import Settings from './screens/Settings.jsx'
import './app.css'
// Note: label.css is embedded inline in LabelPreview — no import needed here

export default function App() {
  return (
    <HashRouter>
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <nav style={{ background: '#222', color: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontWeight: 'bold', marginRight: 16, padding: '10px 0' }}>OCRLabel</span>
          <a href="#/" style={{ color: '#ccc', textDecoration: 'none', padding: '10px 8px' }}>Etiketten</a>
          <a href="#/new" style={{ color: '#ccc', textDecoration: 'none', padding: '10px 8px' }}>+ Nieuw</a>
          <div style={{ flex: 1 }} />
          <a href="#/settings" style={{ color: '#ccc', textDecoration: 'none', padding: '10px 8px' }}>Instellingen</a>
        </nav>
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
  )
}
