// Config for the shared paediatric dose engine (shared/paediatric-dose.js).
// Ibuprofen (dose range 5-10 mg/kg). Values match the Healthify reference.
window.HEAL_PAED_CONFIG = {
  title: "Ibuprofen dose — children",
  sub: "Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr",
  drugLabel: "ibuprofen",
  strengths: [
    { label: "Ibuprofen 100 mg per 5 mL", mgPerMl: 20, mlPerKgLow: 0.25, mlPerKgHigh: 0.5 },
  ],
  mgPerKgLow: 5,
  mgPerKgHigh: 10,
  maxMgLow: 200,
  maxMgHigh: 400,
  freq: "Three times a day",
};
