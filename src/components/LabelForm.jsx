import { useT } from '../i18n.js'

function Field({ label, id, value, onChange, multiline }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 'bold', fontSize: 12, marginBottom: 2 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ width: '100%', resize: 'vertical', fontSize: 13 }}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', fontSize: 13 }}
        />
      )}
    </div>
  )
}

export default function LabelForm({ data, onChange, onSave }) {
  const { t } = useT()
  const f = (key) => ({ value: data[key] || '', onChange: (v) => onChange(key, v) })

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <Field label={t('form_product_name')} id="product_name" {...f('product_name')} />
      <Field label={t('form_ingredients')} id="ingredients" {...f('ingredients')} multiline />
      <Field label={t('form_allergens')} id="allergens" {...f('allergens')} />
      <Field label={t('form_storage')} id="storage_info" {...f('storage_info')} />
      <Field label={t('form_manufacturer')} id="manufacturer" {...f('manufacturer')} />
      <Field label={t('form_net_weight')} id="net_weight" {...f('net_weight')} />

      <div style={{ marginTop: 12, marginBottom: 4, fontWeight: 'bold', fontSize: 13, borderTop: '1px solid #ccc', paddingTop: 8 }}>
        {t('form_nutrition_header')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <Field label={t('form_energy_kj')} id="energy_kj" {...f('energy_kj')} />
        <Field label={t('form_energy_kcal')} id="energy_kcal" {...f('energy_kcal')} />
        <Field label={t('form_fat')} id="fat_total" {...f('fat_total')} />
        <Field label={t('form_fat_sat')} id="fat_saturated" {...f('fat_saturated')} />
        <Field label={t('form_carbs')} id="carbs_total" {...f('carbs_total')} />
        <Field label={t('form_carbs_sugars')} id="carbs_sugars" {...f('carbs_sugars')} />
        <Field label={t('form_fiber')} id="fiber" {...f('fiber')} />
        <Field label={t('form_protein')} id="protein" {...f('protein')} />
        <Field label={t('form_salt')} id="salt" {...f('salt')} />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={onSave} style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
          {t('form_save_btn')}
        </button>
      </div>
    </div>
  )
}
