# HEAL Calculators

Embeddable health calculators by Health Navigator Charitable Trust.

**Live site (docs, demos, embed instructions):**
https://health-navigator-charitable-trust.github.io/calculators/

Free to embed on your site — see the live page for the two embed methods
(iframe or script tag). Embedding works once your domain is on the allowlist;
let us know via healthify.nz and we will add it.

## Structure

- `bmi/`, `paracetamol/`, `amoxicillin/`, `pregnancy/`, `phq9/`, `audit/`,
  `co-amoxiclav/`, `cefaclor/`, `cefalexin/`, `co-trimoxazole/`,
  `erythromycin/`, `flucloxacillin/`, `ibuprofen/` — one folder per calculator
- `shared/` — shared styles, embed guard, analytics, dose engine
- `allowed-domains.js` — domains allowed to embed
- `index.html` — the docs/demo page served at the URL above
