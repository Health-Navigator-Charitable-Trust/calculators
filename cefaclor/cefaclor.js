// Config for the shared paediatric dose engine (shared/paediatric-dose.js).
// Cefaclor. Values match the Healthify reference.
window.HEAL_PAED_CONFIG = {
  title: "Cefaclor dose — children",
  sub: "Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr",
  drugLabel: "cefaclor",
  strengths: [
    { label: "Cefaclor 125 mg per 5 mL", mgPerMl: 25, mlPerKgLow: 0.4 },
  ],
  mgPerKgLow: 10,
  mgPerKgHigh: null,
  maxMgLow: 1000,
  freq: "Three times a day",
};
