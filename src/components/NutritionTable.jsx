export default function NutritionTable({ data }) {
  const { energy_kj, energy_kcal, fat_total, fat_saturated,
          carbs_total, carbs_sugars, fiber, protein, salt } = data

  return (
    <table className="nutrition-table">
      <thead>
        <tr>
          <th>Gemiddelde voedingswaarden</th>
          <th className="nt-value">per 100 g</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Energie</td>
          <td className="nt-value">{energy_kj} kJ<br />{energy_kcal} kcal</td>
        </tr>
        <tr>
          <td>Vetten</td>
          <td className="nt-value">{fat_total} g</td>
        </tr>
        <tr>
          <td className="nt-indent">waarvan verzadigde vetzuren</td>
          <td className="nt-value">{fat_saturated} g</td>
        </tr>
        <tr>
          <td>Koolhydraten</td>
          <td className="nt-value">{carbs_total} g</td>
        </tr>
        <tr>
          <td className="nt-indent">waarvan suikers</td>
          <td className="nt-value">{carbs_sugars} g</td>
        </tr>
        <tr>
          <td>Vezels</td>
          <td className="nt-value">{fiber} g</td>
        </tr>
        <tr>
          <td>Eiwitten</td>
          <td className="nt-value">{protein} g</td>
        </tr>
        <tr>
          <td>Zout</td>
          <td className="nt-value">{salt} g</td>
        </tr>
      </tbody>
    </table>
  )
}
