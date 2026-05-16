import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n.js'
import LabelPreview from '../components/LabelPreview.jsx'

function formatDate(dt) {
  return dt ? dt.slice(0, 16).replace('T', ' ') : ''
}

export default function Home() {
  const [labels, setLabels] = useState(null)
  const navigate = useNavigate()
  const { t } = useT()

  async function load() {
    const rows = await window.api.label.list()
    setLabels(rows)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm(t('home_confirm_delete'))) return
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

  if (labels === null) return <div style={{ padding: 24 }}>{t('home_loading')}</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ flex: 1 }}>{t('home_title')}</h2>
        <button onClick={() => navigate('/new')} style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
          {t('home_new_btn')}
        </button>
      </div>

      {labels.length === 0 ? (
        <p style={{ color: '#666' }}>{t('home_empty')}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>{t('home_col_date')}</th>
              <th style={{ padding: '6px 8px' }}>{t('home_col_product')}</th>
              <th style={{ padding: '6px 8px' }}>{t('home_col_weight')}</th>
              <th style={{ padding: '6px 8px' }}>{t('home_col_printed')}</th>
              <th style={{ padding: '6px 8px' }}>{t('home_col_actions')}</th>
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
                  <button onClick={() => handleReprint(lbl)} style={{ cursor: 'pointer' }}>{t('home_btn_reprint')}</button>
                  <button onClick={() => handleDelete(lbl.id)} style={{ cursor: 'pointer' }}>{t('home_btn_delete')}</button>
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
