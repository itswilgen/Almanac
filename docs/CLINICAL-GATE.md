# Fertility feature: unavailable by design

Policy identifier: `unreviewed-v1`. No fertility algorithm is active. `app/Domain/FertilityPolicy.php` unconditionally returns unavailable with a null classification. Deployment variables and administrator flags cannot turn it on. The module accepts future records/circumstances inputs but deliberately does not collect those circumstances from users in this version.

The current policy is fail-closed for **all** cases, including apparently regular records, insufficient history, missing records, contradictions, irregular cycles, absent periods, postpartum status, breastfeeding, and hormonal contraception. These cases are tested individually. No date is assigned a lower-fertility classification, pregnancy probability, or “safe” label. A missed period never changes availability to true.

Before any future implementation, a qualified professional must select one established method, define and sign off its source version, population, contraindications, required observations, eligibility algorithm, uncertainty wording, clinical tests, and implementation. For insufficient history, gaps/contradictions, irregular cycles, absent periods, postpartum/breastfeeding status, or hormonal contraception, undefined/unsupported rules must return unavailable. Do not infer suitability from cycle averages, mix methods, or turn review status into an administrator checkbox.

Starting sources checked on 14 October 2026:

- [CDC Standard Days Method](https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html): a specific method with its own cycle-duration requirements; fertile timing varies even with regular cycles. It is not implemented here.
- [NHS natural family planning](https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/): professional instruction and observations beyond period dates can be required.
- [NHS missed or late periods](https://www.nhs.uk/symptoms/missed-or-late-periods/): multiple possible causes and reasons to seek clinical advice. The app cannot infer the cause.

These references are not sign-off. Article summaries are source-linked and explicitly **Clinical review pending**. No medical endorsement or accuracy guarantee is claimed. The period-range heuristic is also a transparent product planning aid, not a validated clinical method.
