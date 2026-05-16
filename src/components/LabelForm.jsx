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
  const f = (key) => ({ value: data[key] || '', onChange: (v) => onChange(key, v) })

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <Field label="Productnaam" id="product_name" {...f('product_name')} />
      <Field label="Ingrediënten" id="ingredients" {...f('ingredients')} multiline />
      <Field label="Kan bevatten (allergenen)" id="allergens" {...f('allergens')} />
      <Field label="Bewaren (opslaginfo)" id="storage_info" {...f('storage_info')} />
      <Field label="Fabrikant / Importeur" id="manufacturer" {...f('manufacturer')} />
      <Field label="Netto gewicht" id="net_weight" {...f('net_weight')} />

      <div style={{ marginTop: 12, marginBottom: 4, fontWeight: 'bold', fontSize: 13, borderTop: '1px solid #ccc', paddingTop: 8 }}>
        Voedingswaarden per 100g
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <Field label="Energie (kJ)" id="energy_kj" {...f('energy_kj')} />
        <Field label="Energie (kcal)" id="energy_kcal" {...f('energy_kcal')} />
        <Field label="Vet (g)" id="fat_total" {...f('fat_total')} />
        <Field label="waarvan Verzadigd (g)" id="fat_saturated" {...f('fat_saturated')} />
        <Field label="Koolhydraten (g)" id="carbs_total" {...f('carbs_total')} />
        <Field label="waarvan Suikers (g)" id="carbs_sugars" {...f('carbs_sugars')} />
        <Field label="Vezels (g)" id="fiber" {...f('fiber')} />
        <Field label="Eiwitten (g)" id="protein" {...f('protein')} />
        <Field label="Zout (g)" id="salt" {...f('salt')} />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={onSave} style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
          Opslaan & Voorbeeld →
        </button>
      </div>
    </div>
  )
}
