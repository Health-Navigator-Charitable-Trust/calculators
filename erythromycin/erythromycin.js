// Config for the shared paediatric dose engine (shared/paediatric-dose.js).
// Erythromycin. Values match the Healthify reference.
window.HEAL_PAED_CONFIG = {
  title: "Erythromycin dose — children",
  sub: "Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr",
  drugLabel: "erythromycin",
  strengths: [
    { label: "Erythromycin 200 mg per 5 mL", mgPerMl: 40, mlPerKgLow: 0.25 },
    { label: "Erythromycin 400 mg per 5 mL", mgPerMl: 80, mlPerKgLow: 0.125 },
  ],
  mgPerKgLow: 10,
  mgPerKgHigh: null,
  maxMgLow: 1000,
  freq: "Four times a day",
  note: "Total daily dose may be given in two divided doses.",
};
