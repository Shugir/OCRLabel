import NutritionTable from './NutritionTable.jsx'

const LABEL_CSS = `
.label-root{width:62mm;font-family:Arial,Helvetica,sans-serif;font-size:6pt;line-height:1.3;color:#000;background:#fff;padding:2mm;box-sizing:border-box;}
.label-product-name{font-size:7pt;font-weight:bold;margin-bottom:1.5mm;}
.label-body{display:flex;gap:2mm;}
.label-left{flex:1;min-width:0;}
.label-section{margin-bottom:1.5mm;}
.label-section-title{font-weight:bold;}
.label-right{width:26mm;flex-shrink:0;}
.nutrition-table{width:100%;border-collapse:collapse;font-size:5.5pt;}
.nutrition-table th,.nutrition-table td{border:0.3pt solid #000;padding:0.4mm 0.8mm;text-align:left;vertical-align:top;}
.nutrition-table th{font-weight:bold;background:#f0f0f0;}
.nutrition-table .nt-indent{padding-left:2mm;}
.nutrition-table .nt-value{text-align:right;white-space:nowrap;}
.label-net-weight{margin-top:1.5mm;font-weight:bold;font-size:7pt;}
`

export default function LabelPreview({ data }) {
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: LABEL_CSS }} />
      <div className="label-root">
        <div className="label-product-name">(NL) {data.product_name}</div>
        <div className="label-body">
          <div className="label-left">
            {data.ingredients && (
              <div className="label-section">{data.ingredients}</div>
            )}
            {data.allergens && (
              <div className="label-section">{data.allergens}</div>
            )}
            {data.storage_info && (
              <div className="label-section">{data.storage_info}</div>
            )}
            {data.manufacturer && (
              <div className="label-section">
                <span className="label-section-title">Fabrikant/Importeur: </span>
                {data.manufacturer}
              </div>
            )}
          </div>
          <div className="label-right">
            <NutritionTable data={data} />
          </div>
        </div>
        <div className="label-net-weight">Netto gewicht: {data.net_weight}</div>
      </div>
    </div>
  )
}
