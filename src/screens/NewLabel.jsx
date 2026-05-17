import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n.js'
import LabelForm from '../components/LabelForm.jsx'
import LabelPreview from '../components/LabelPreview.jsx'

const EMPTY = {
  product_name: '', ingredients: '', allergens: '', storage_info: '',
  manufacturer: '', net_weight: '', energy_kj: '', energy_kcal: '',
  fat_total: '', fat_saturated: '', carbs_total: '', carbs_sugars: '',
  fiber: '', protein: '', salt: '',
}

export default function NewLabel() {
  const [data, setData] = useState(EMPTY)
  const [imagePath, setImagePath] = useState(null)
  const [tab, setTab] = useState('edit')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [copies, setCopies] = useState(1)
  const previewRef = useRef(null)
  const navigate = useNavigate()
  const { t } = useT()

  function handleChange(key, value) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePickImage() {
    const path = await window.api.file.open()
    if (!path) return
    setImagePath(path)
    setError(null)
    setLoading(true)
    try {
      const extracted = await window.api.ocr.extract(path)
      if (extracted) {
        const combined = [
          extracted.product_name, extracted.ingredients,
          extracted.allergens, extracted.storage_info, extracted.manufacturer,
        ].filter(Boolean).join('\n\n')
        setData({
          ...EMPTY, ...extracted,
          ingredients: combined,
          product_name: '', allergens: '', storage_info: '', manufacturer: '',
        })
      } else {
        setError(t('new_err_extract'))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function hasData() {
    return data.ingredients.trim().length > 0
  }

  async function handleSave() {
    if (!hasData()) {
      setError(t('new_err_empty'))
      return
    }
    const id = await window.api.label.save({ ...data, image_path: imagePath || '' })
    setSavedId(id)
    setTab('preview')
  }

  async function handlePrint() {
    if (!previewRef.current) return
    const html = previewRef.current.innerHTML
    await window.api.print.label(html, copies)
    if (savedId) await window.api.label.markPrinted(savedId)
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>{t('new_btn_back')}</button>
        <h2 style={{ flex: 1, margin: 0 }}>{t('new_title')}</h2>
        <button onClick={handlePickImage} disabled={loading} style={{ padding: '6px 14px', cursor: 'pointer' }}>
          {loading ? t('new_btn_picking') : t('new_btn_pick')}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee', color: '#900', padding: '8px 24px', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
        {['edit', 'preview'].map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => {
              if (tabKey === 'preview' && !hasData()) {
                setError(t('new_err_empty'))
                return
              }
              setError(null)
              setTab(tabKey)
            }}
            style={{
              padding: '8px 20px',
              cursor: 'pointer',
              borderBottom: tab === tabKey ? '2px solid #000' : '2px solid transparent',
              background: 'none',
              fontWeight: tab === tabKey ? 'bold' : 'normal',
              fontSize: 14,
            }}
          >
            {tabKey === 'edit' ? t('new_tab_edit') : t('new_tab_preview')}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'edit' ? (
          <LabelForm data={data} onChange={handleChange} onSave={handleSave} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ transform: 'scale(2)', transformOrigin: 'top left' }}>
                <div ref={previewRef}>
                  <LabelPreview data={data} />
                </div>
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: '12px 24px', borderTop: '1px solid #ddd', display: 'flex', gap: 12, alignItems: 'center', background: '#fff' }}>
              <button onClick={() => setTab('edit')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                {t('new_btn_edit')}
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                Copies:
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                  style={{ width: 52, padding: '6px 8px', fontSize: 14, textAlign: 'center' }}
                />
              </label>
              <button onClick={handlePrint} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
                {t('new_btn_print')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
