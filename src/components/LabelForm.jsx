import { useT } from '../i18n.js'

const NUTRITION_ROWS = [
  { key: 'energy_kj',     tKey: 'form_energy_kj' },
  { key: 'energy_kcal',   tKey: 'form_energy_kcal' },
  { key: 'fat_total',     tKey: 'form_fat' },
  { key: 'fat_saturated', tKey: 'form_fat_sat' },
  { key: 'carbs_total',   tKey: 'form_carbs' },
  { key: 'carbs_sugars',  tKey: 'form_carbs_sugars' },
  { key: 'fiber',         tKey: 'form_fiber' },
  { key: 'protein',       tKey: 'form_protein' },
  { key: 'salt',          tKey: 'form_salt' },
]

export default function LabelForm({ data, onChange, onSave }) {
  const { t } = useT()

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <textarea
        aria-label={t('form_label_text')}
        value={data.ingredients || ''}
        onChange={(e) => onChange('ingredients', e.target.value)}
        rows={10}
        style={{ width: '100%', resize: 'vertical', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
      />

      <div style={{ marginTop: 16, fontWeight: 'bold', fontSize: 13, borderTop: '1px solid #ccc', paddingTop: 8 }}>
        {t('form_nutrition_header')}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 4 }}>
        <tbody>
          {NUTRITION_ROWS.map(({ key, tKey }) => (
            <tr key={key}>
              <td style={{ padding: '3px 0', paddingRight: 8 }}>{t(tKey)}</td>
              <td style={{ padding: '3px 0', textAlign: 'right' }}>
                <input
                  aria-label={t(tKey)}
                  type="text"
                  value={data[key] || ''}
                  onChange={(e) => onChange(key, e.target.value)}
                  style={{ width: 80, textAlign: 'right', fontSize: 13 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="net_weight" style={{ fontWeight: 'bold', fontSize: 13 }}>
          {t('form_net_weight')}
        </label>
        <input
          id="net_weight"
          type="text"
          value={data.net_weight || ''}
          onChange={(e) => onChange('net_weight', e.target.value)}
          style={{ fontSize: 13, width: 100 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={onSave} style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
          {t('form_save_btn')}
        </button>
      </div>
    </div>
  )
}
