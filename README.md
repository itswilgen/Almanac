# Almanac

A mobile-friendly menstrual journal and family-planning education application built with React, TypeScript, Vite, Tailwind CSS, Laravel, Sanctum, and PostgreSQL. Includes real authentication, encrypted persistent records, cycle calculations, cautious period ranges, private in-app reminders, and CSV downloads. Fertility predictions remain unavailable pending clinical review.

## Open the current local build

- Frontend: **http://127.0.0.1:5173**
- Laravel API and built frontend: **http://127.0.0.1:8000**

Create an account from the landing page. New accounts start empty. No shared default password is installed. Use synthetic data to evaluate this local build.

## Requirements

PHP 8.3+ with Laravel's required extensions, `pdo_pgsql`, and `pdo_sqlite` for tests; Composer 2; Node 22.12+; npm; PostgreSQL. Playwright is configured for installed Google Chrome. Locked dependencies are in `frontend/package-lock.json` and `backend/composer.lock`. This implementation uses React 19, Vite 8, Tailwind 4, and Laravel 13. Node 25.2.1 and PHP 8.5.1 were used locally.

## First-time setup on another machine

From the repository root:

```sh
composer install --working-dir=backend
npm --prefix frontend ci
cp backend/.env.example backend/.env
```

Create a dedicated local PostgreSQL role and database using your PostgreSQL administrator account, if they do not exist:

```sh
createuser --pwprompt almanac
createdb --owner=almanac almanac_dev
```

Set the database username/password/host in `backend/.env`. The example uses `almanac`; this development session uses the existing local PostgreSQL role with a dedicated `almanac_dev` database. Keep `.env` private.

```sh
cd backend
php artisan key:generate
php artisan migrate --seed
cd ..
npm run dev
```

Open **http://127.0.0.1:5173**. The root command runs Laravel on port 8000 and Vite on 5173. Alternatively run `php artisan serve --host=127.0.0.1 --port=8000` from `backend` and `npm run dev` from `frontend` in separate terminals. Stop existing servers before launching duplicates.

The default seeder adds educational content only. An optional local-only synthetic demo prints a randomly generated password once:

```sh
cd backend
php artisan db:seed --class=DemoSeeder
```

It never populates real accounts or overwrites an existing demo; the UI labels the demo as synthetic.

## Build and serve from Laravel

```sh
npm run build
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

The build copies compiled assets and HTML into `backend/public/app`, preserving Laravel's entry point. Open **http://127.0.0.1:8000**. Set `APP_URL=http://127.0.0.1:8000` when this is your primary origin so recovery links point there. Vite is unnecessary for the built app.

Before public deployment: configure HTTPS, secure cookies, real mail delivery, secret management, database/backup encryption and recovery, monitoring that excludes health data, operator contact details, retention policies, and qualified clinical/legal review. The PHP development server is not a production server.

## Local password recovery

`MAIL_MAILER=preview` saves actual recovery emails to `backend/storage/app/private/mail/*.eml` with private permissions. No external email is sent. Submit “Forgot password?” in the app, open the newest `.eml` in a local mail viewer, and follow its link. Preview transport refuses to run outside `APP_ENV=local`; production needs SMTP or another supported delivery provider.

These private files contain short-lived recovery links. They are not web-served or committed and should be deleted after local testing. There is no public mailbox endpoint. Failed transports return errors rather than fabricated success.

## Verification commands

```sh
npm run typecheck
npm run lint
npm --prefix frontend run format:check
npm run test
npm run build
# With local servers running:
npm run test:e2e
# Against the compiled, same-origin application:
E2E_BASE_URL=http://127.0.0.1:8000 npm run test:e2e
# Backend style:
cd backend
vendor/bin/pint --format agent
```

Playwright uses synthetic accounts and deletes them after successful runs. Failed runs may retain clearly named synthetic accounts for debugging. Screenshots are captured in `frontend/test-results/screenshots/` at 375, 768, and 1440px. Backend tests use isolated in-memory SQLite and never reset the application PostgreSQL database. See [observed verification](docs/VERIFICATION.md).

## Folder map

```text
frontend/src/components/   Calendar, dialog helpers, navigation
frontend/src/features/     Landing, auth, journal, history, education, settings
frontend/src/lib/          Typed API, session state, date-only helpers
backend/app/Domain/        Record rules, cycle calculations, clinical gate
backend/app/Http/          Controllers, validation, headers
backend/app/Models/        Ownership and encryption
backend/database/         Migrations, educational content, demo seeder
backend/tests/            Date, authentication, ownership, export, deletion tests
frontend/tests/           Browser journey, CSRF/session, responsive checks
scripts/                  Development runner and asset copying
docs/                     Architecture, API, clinical policy, verification
```

[Architecture and record flow](docs/ARCHITECTURE.md) covers design tokens, validation, estimates, encryption keys, and backups. [API contracts](docs/API.md) lists endpoints and data shapes. [Clinical gate](docs/CLINICAL-GATE.md) documents the review dependency and unsupported circumstances.

## Scope and remaining dependencies

Implemented: registration/login/logout and recovery; optional onboarding; monthly calendar; ongoing/completed period CRUD; symptom/note CRUD; cycle history and real-data charts; period start ranges; in-app reminders; source-linked education with review status; timezone/preferences; CSV export; password-confirmed account deletion; privacy/terms pages.

Clinical sign-off for fertility rules and educational summaries, production hosting/email/backups, and jurisdiction-specific legal/age-consent review remain external dependencies. Core tracking works independently. There is no fertility classification, push delivery, diagnosis, third-party analytics, partner access, admin diary browser, or claimed clinical certification.
