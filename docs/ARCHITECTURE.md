# Almanac architecture

Almanac is a modular monolith: a React client and a Laravel API sharing one origin. PostgreSQL is the local application database. SQLite in-memory is used only for isolated backend tests. There is no cloud deployment or external account dependency for the core journal.

## Record flow

1. `frontend/src/features/EntryForms.tsx` keeps form values in the open native dialog until the request succeeds. Date, overlap, and future-date checks provide immediate feedback.
2. `src/lib/api.ts` obtains a session-bound CSRF token and makes a same-origin request. No authentication tokens or health records are stored in localStorage.
3. Laravel FormRequests validate date-only ISO strings, enumerated observations, lengths, and the user's timezone. `auth:sanctum` authenticates the Laravel session.
4. `app/Domain/Journal.php` scopes every read and mutation through the current user. Writes lock that user's row inside a database transaction so overlapping periods and duplicate daily check-ins cannot race. Ongoing periods occupy the interval from their start onward, until explicitly ended.
5. Eloquent encrypted casts protect dates, observations, notes, and preferences before PostgreSQL storage. Dates remain `YYYY-MM-DD` strings when decrypted; timestamps are separate. Encrypted fields use text columns because ciphertext is not SQL DATE data. Foreign keys, non-null fields, and cascades are database constraints; range constraints require the domain service because the database cannot compare encrypted dates.
6. `CycleSummary` recalculates completed cycles and the next-period range on each journal read or export. No derived cycle lengths or predicted dates are stored as recorded facts.
7. The typed response drives the calendar, history, selected-day panel, and reminder availability. After a mutation, the client refreshes the server summary. A successful write followed by a failed refresh is reported as a saved entry plus a retryable load error, avoiding a duplicate submission.

## Main files

| Area | Location |
| --- | --- |
| Design tokens, layout, breakpoints | `frontend/src/index.css` |
| App routes | `frontend/src/App.tsx` |
| Session and journal state | `frontend/src/lib/Provider.tsx` |
| Typed contracts | `frontend/src/lib/types.ts` |
| Client date-only utilities and validation | `frontend/src/lib/dates.ts` |
| Accessible calendar and native dialogs | `frontend/src/components/` |
| User journeys | `frontend/src/features/` |
| API routes | `backend/routes/web.php` |
| Server input validation | `backend/app/Http/Requests/` |
| Overlap/ownership/concurrency rules | `backend/app/Domain/Journal.php` |
| Period estimate rules | `backend/app/Domain/CycleSummary.php` |
| Clinical feature gate | `backend/app/Domain/FertilityPolicy.php` |
| Database schema | `backend/database/migrations/` |
| Education source content | `backend/database/seeders/articles.json` |
| Local email delivery | `backend/app/Mail/PreviewTransport.php` |

## Authentication and security

Sanctum uses the `web` session guard, HttpOnly session cookies, SameSite=Lax, session regeneration at registration/login, and Laravel request-forgery middleware. The API is deliberately registered in the `web` middleware group so session and CSRF protections apply without cross-origin token handling. All client requests go through the Vite proxy in development and the same Laravel origin in production; cross-origin CORS access is not enabled. Production requires HTTPS and `SESSION_SECURE_COOKIE=true`.

Authentication, exports, account deletion, and general journal access have separate rate limits. Resource IDs alone never authorize access. Passwords are hashed by Laravel. Password reset tokens are stored hashed, expire according to Laravel's broker configuration, and are single-use. Resets revoke database sessions. There is no administrator diary browser or sharing endpoint.

API responses use `Cache-Control: no-store, private`. The production HTML has a same-origin Content Security Policy and denies framing. Local Vite uses its own development headers. Exports are streamed and CSV formula-leading values are escaped. No export copy is saved server-side. No analytics, advertising, AI requests, external font requests, or service worker health-data caching are included.

## Encryption and backups

`APP_KEY` is the journal encryption root, not a disposable deployment setting. Keep it outside source control and back it up in a separate access-controlled secret store. Losing it makes encrypted records unreadable. Do not run `key:generate` on a live installation with existing data. Laravel supports `APP_PREVIOUS_KEYS` for staged rotation: retain old keys until records have been re-encrypted and backup retention is understood. Test recovery using an isolated restore of both database and required key material.

Production operators must additionally provision disk/database/backup encryption, TLS to PostgreSQL if remote, limited database credentials, protected log and mail directories, backup retention, key rotation procedures, and recovery testing. This local build does not claim those deployment controls are already operating.

Delete an account by validating the current password, logging out before model deletion (avoiding a remember-token save on a deleted user), deleting related live records and all sessions/reset tokens, then invalidating the current session. Downloaded/shared files and retained backups cannot be erased remotely. No backups are scheduled by this repository. Production retention and age/consent rules require an operator and legal review.

## Calculation policy

- A completed cycle is the UTC date-only difference between consecutive recorded start dates. The latest cycle has no completed length until another start is logged. Bleeding duration is inclusive start-to-end and remains unknown for ongoing entries.
- `period-range-v1` uses the most recent up to six completed cycles, with a minimum of three (four starts). It does not silently discard unusual cycles.
- Withhold period estimates if any of those lengths is outside 21–35 days or their spread exceeds seven days. These are conservative product heuristics, **not clinically validated eligibility rules or diagnosis**.
- Otherwise the earliest possible start displayed is latest start + shortest cycle − 2 days; the latest is latest start + longest cycle + 2 days. This is a planning range, **not a confidence interval**. Actual bleeding may occur outside it.
- If the range has passed, withhold it and ask the user to check for missing entries. Never roll it forward repeatedly or derive a fertility classification from a late period.
- Editing/deleting records recalculates the summary. Export types explicitly separate `recorded_period`, `recorded_symptoms`, `derived_completed_cycle`, and `estimated_period_start_range`.

## Deliberate boundaries

Private reminders are evaluated when the signed-in app renders: a check-in reminder if there is no entry today; an upcoming-range reminder from three days before the range until its end. Both use the discreet wording “A moment for your journal?” There is no background scheduling or push delivery claim.

Clinical approval is external. Fertility availability is always false. Education summaries show their source-check date and pending clinical-review status; source organizations have not endorsed the application. No admin MFA module is necessary because no admin module is shipped.

All automated tests and seed accounts use synthetic data. The landing preview is isolated illustrative data. Real accounts are never automatically seeded.
