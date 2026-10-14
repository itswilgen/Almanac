# API contracts

Base path `/api`, same-origin cookies. Read responses are JSON unless stated otherwise. Obtain `GET /csrf` and send `X-CSRF-TOKEN` for mutations. Reload the token after authentication/logout. Use `Accept: application/json`. Validation errors are HTTP 422 with `{message, errors: {field: [messages]}}`; authentication 401; CSRF 419; ownership/missing record 404; throttling 429. Operational failures return errors, never fabricated success.

| Method/path | Body / response |
| --- | --- |
| GET `/csrf` | `{token}`; initializes session |
| POST `/register` | `{name,email,password,password_confirmation,timezone}` → 201 User |
| POST `/login` | `{email,password}` → User |
| POST `/logout` | no body → 204 |
| POST `/forgot-password` | `{email}` → generic `{message}` without account enumeration |
| POST `/reset-password` | `{email,token,password,password_confirmation}` → `{message}` |
| GET `/user` | User or 401 |
| PUT `/settings` | `{name,timezone,onboarded,preferences:{goal:"monitoring"|"awareness",remind_logging:boolean,remind_period:boolean}}` → User |
| DELETE `/account` | `{password}` → 204; irreversible live-data deletion |
| GET `/journal` | `{periods,symptoms,summary,fertility}` |
| POST `/periods` | `{start_date:"YYYY-MM-DD",end_date:"YYYY-MM-DD"|null}` → 201 Period |
| PUT `/periods/{id}` | same → Period |
| DELETE `/periods/{id}` | → 204 |
| POST `/symptoms` | `{date,bleeding,cramps,mood,notes?:string|null}` → 201 Symptom |
| PUT `/symptoms/{id}` | same → Symptom |
| DELETE `/symptoms/{id}` | → 204 |
| GET `/export` | private streamed CSV, filename `almanac-records.csv` |
| GET `/articles` | public Article[] with paragraphs, sources, review status, source-check date |

User never includes a password/hash. `preferences` can initially be null. Goal changes do not enable fertility calculations. Allowed observations: bleeding `none|spotting|light|moderate|heavy`; cramps `none|mild|moderate|severe`; mood `unrecorded|calm|energized|low|anxious|irritable`. Notes are limited to 2,000 characters. One check-in per user/date; use PUT to correct it.

`Period = {id,start_date,end_date,created_at,updated_at}`. `Symptom = {id,date,observations:{bleeding,cramps,mood,notes},created_at,updated_at}`. The client intentionally uses only the needed subset.

`summary = {completed_cycles:[{start_date,next_start,days}],history_count,cycle_day,reason,estimate:null|{from,to,kind:"estimated_period_start",method_version:"period-range-v1"}}`. `history_count` is the number of recent completed cycles considered, up to six, including irregular cycles that can prevent an estimate. `cycle_day` is elapsed time since last recorded start, not inferred hormonal phase.

`fertility = {available:false,policy_version:"unreviewed-v1",classification:null,reason}`. There is no endpoint or administrator toggle to bypass review.
