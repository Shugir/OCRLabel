import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LabelPreview from '../components/LabelPreview.jsx'

function formatDate(dt) {
  return dt ? dt.slice(0, 16).replace('T', ' ') : ''
}

export default function Home() {
  const [labels, setLabels] = useState(null)
  const navigate = useNavigate()

  async function load() {
    const rows = await window.api.label.list()
    setLabels(rows)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('Etiket verwijderen?')) return
    await window.api.label.delete(id)
    load()
  }

  async function handleReprint(label) {
    const el = document.getElementById('reprint-' + label.id)
    if (!el) return
    await window.api.print.label(el.innerHTML)
    await window.api.label.markPrinted(label.id)
    load()
  }

  if (labels === null) return <div style={{ padding: 24 }}>Laden…</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ flex: 1 }}>Etiketten</h2>
        <button onClick={() => navigate('/new')} style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
          + Nieuw etiket
        </button>
      </div>

      {labels.length === 0 ? (
        <p style={{ color: '#666' }}>Nog geen etiketten aangemaakt.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>Datum</th>
              <th style={{ padding: '6px 8px' }}>Product</th>
              <th style={{ padding: '6px 8px' }}>Netto</th>
              <th style={{ padding: '6px 8px' }}>Afgedrukt</th>
              <th style={{ padding: '6px 8px' }}>Acties</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((lbl) => (
              <tr key={lbl.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 8px' }}>{formatDate(lbl.created_at)}</td>
                <td style={{ padding: '6px 8px' }}>{lbl.product_name}</td>
                <td style={{ padding: '6px 8px' }}>{lbl.net_weight}</td>
                <td style={{ padding: '6px 8px' }}>{lbl.printed_at ? '✓' : '—'}</td>
                <td style={{ padding: '6px 8px', display: 'flex', gap: 6 }}>
                  <button onClick={() => handleReprint(lbl)} style={{ cursor: 'pointer' }}>Herdruk</button>
                  <button onClick={() => handleDelete(lbl.id)} style={{ cursor: 'pointer' }}>Verwijder</button>
                </td>
                <td style={{ display: 'none' }}>
                  <div id={'reprint-' + lbl.id}>
                    <LabelPreview data={lbl} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
