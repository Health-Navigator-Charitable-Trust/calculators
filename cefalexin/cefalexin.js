// Config for the shared paediatric dose engine (shared/paediatric-dose.js).
// Cefalexin. Values match the Healthify reference.
window.HEAL_PAED_CONFIG = {
  title: "Cefalexin dose — children",
  sub: "Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr",
  drugLabel: "cefalexin",
  strengths: [
    { label: "Cefalexin 125 mg per 5 mL", mgPerMl: 25, mlPerKgLow: 0.5 },
    { label: "Cefalexin 250 mg per 5 mL", mgPerMl: 50, mlPerKgLow: 0.25 },
  ],
  mgPerKgLow: 12.5,
  mgPerKgHigh: null,
  maxMgLow: 1000,
  freq: "Two to four times a day",
};
