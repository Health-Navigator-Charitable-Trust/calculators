// Config for the shared paediatric dose engine (shared/paediatric-dose.js).
// Amoxicillin + clavulanic acid (co-amoxiclav). Values match the Healthify reference.
window.HEAL_PAED_CONFIG = {
  title: "Amoxicillin + clavulanic acid — children",
  sub: "Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr",
  drugLabel: "co-amoxiclav",
  strengths: [
    { label: "Co-amoxiclav 125/31.25 mg per 5 mL", mgPerMl: 25, mlPerKgLow: 0.48 },
    { label: "Co-amoxiclav 250/62.5 mg per 5 mL", mgPerMl: 50, mlPerKgLow: 0.24 },
  ],
  mgPerKgLow: 12,
  mgPerKgHigh: null,
  maxMgLow: 500,
  freq: "Three times a day",
};
