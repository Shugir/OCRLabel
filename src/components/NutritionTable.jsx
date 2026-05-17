export default function NutritionTable({ data }) {
  const { energy_kj, energy_kcal, fat_total, fat_saturated,
          carbs_total, carbs_sugars, fiber, protein, salt } = data

  const hasEnergy = energy_kj || energy_kcal
  const hasFat = fat_total
  const hasFatSat = fat_saturated
  const hasCarbs = carbs_total
  const hasCarbsSugars = carbs_sugars
  const hasFiber = fiber
  const hasProtein = protein
  const hasSalt = salt

  const hasAny = hasEnergy || hasFat || hasFatSat || hasCarbs || hasCarbsSugars || hasFiber || hasProtein || hasSalt
  if (!hasAny) return null

  return (
    <table className="nutrition-table">
      <thead>
        <tr>
          <th>Gemiddelde voedingswaarden</th>
          <th className="nt-value">per 100 g</th>
        </tr>
      </thead>
      <tbody>
        {hasEnergy && (
          <tr>
            <td>Energie</td>
            <td className="nt-value">
              {energy_kj ? <>{energy_kj} kJ<br /></> : null}
              {energy_kcal ? <>{energy_kcal} kcal</> : null}
            </td>
          </tr>
        )}
        {hasFat && (
          <tr>
            <td>Vetten</td>
            <td className="nt-value">{fat_total} g</td>
          </tr>
        )}
        {hasFatSat && (
          <tr>
            <td className="nt-indent">waarvan verzadigde vetzuren</td>
            <td className="nt-value">{fat_saturated} g</td>
          </tr>
        )}
        {hasCarbs && (
          <tr>
            <td>Koolhydraten</td>
            <td className="nt-value">{carbs_total} g</td>
          </tr>
        )}
        {hasCarbsSugars && (
          <tr>
            <td className="nt-indent">waarvan suikers</td>
            <td className="nt-value">{carbs_sugars} g</td>
          </tr>
        )}
        {hasFiber && (
          <tr>
            <td>Vezels</td>
            <td className="nt-value">{fiber} g</td>
          </tr>
        )}
        {hasProtein && (
          <tr>
            <td>Eiwitten</td>
            <td className="nt-value">{protein} g</td>
          </tr>
        )}
        {hasSalt && (
          <tr>
            <td>Zout</td>
            <td className="nt-value">{salt} g</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
