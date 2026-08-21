// Config for the shared paediatric dose engine (shared/paediatric-dose.js).
// Co-trimoxazole. Values match the Healthify reference.
window.HEAL_PAED_CONFIG = {
  title: "Co-trimoxazole dose — children",
  sub: "Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr",
  drugLabel: "co-trimoxazole",
  // FLAGGED FOR CLINICAL REVIEW: the reference labels this "Cotrimoxazole480"
  // but its mL figures (0.5 mL/kg, max 20 mL) only work at 48 mg/mL = 240 mg/5 mL.
  // We follow the reference's math, so the label says 240 mg per 5 mL.
  strengths: [
    { label: "Co-trimoxazole 240 mg per 5 mL", mgPerMl: 48, mlPerKgLow: 0.5 },
  ],
  mgPerKgLow: 24,
  mgPerKgHigh: null,
  maxMgLow: 960,
  freq: "Twice a day",
};
