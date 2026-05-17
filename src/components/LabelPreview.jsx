import NutritionTable from './NutritionTable.jsx'

const LABEL_CSS = `
.label-root{width:62mm;font-family:Arial,Helvetica,sans-serif;font-size:6pt;line-height:1.3;color:#000;background:#fff;padding:2mm;box-sizing:border-box;}
.label-text{white-space:pre-wrap;margin-bottom:2mm;}
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
        <div className="label-text">{data.ingredients || ''}</div>
        <NutritionTable data={data} />
        {data.net_weight && <div className="label-net-weight">Netto gewicht: {data.net_weight}</div>}
      </div>
    </div>
  )
}
