import { Link } from "react-router-dom";
import { Brand, Footer } from "../components/UI";
export default function Legal({ privacy = false }: { privacy?: boolean }) {
  return (
    <>
      <header className="public-header">
        <Brand />
        <Link className="inline-link" to="/journal">
          Your journal
        </Link>
      </header>
      <main id="main" className="article legal">
        <p className="eyebrow">PLAIN LANGUAGE · UPDATED 14 OCTOBER 2026</p>
        <h1>
          {privacy ? "Your privacy matters." : "A few shared understandings."}
        </h1>
        <div className="review-note">
          Local development version. Legal and privacy review required before
          public deployment. No privacy-law compliance certification is claimed.
        </div>
        {privacy ? (
          <>
            <h2>What this application stores</h2>
            <p>
              Your name, email, hashed password, timezone, preferences, period
              dates, and any symptoms and notes you enter. Journal dates,
              observations, and preferences are encrypted by the application
              before database storage. Account identifiers remain readable to
              the application operator. Session records support secure sign-in.
            </p>
            <h2>Who can see your journal</h2>
            <p>
              The application only exposes records to the signed-in owner. There
              is no administrator diary browser, partner access, or sharing
              link. Technical operators with server and encryption-key access
              could decrypt records; encryption is not end-to-end. No health
              information is sent to advertising, analytics, or third-party AI
              services by this application.
            </p>
            <h2>You control your records</h2>
            <p>
              You can correct or delete entries and download a CSV in Settings.
              Exports are generated on demand without a saved server copy.
              Anyone with access to your downloaded file can read it. Sharing
              with a healthcare professional is your choice.
            </p>
            <h2>Deleting your account</h2>
            <p>
              Account deletion removes the live user record, period entries,
              symptoms, preferences, password reset tokens, and sessions. It
              cannot erase files you downloaded or copies you shared. This local
              setup does not run automated backups. A production operator must
              publish backup retention and deletion timelines before launch;
              existing backups may retain deleted records until they expire.
            </p>
            <h2>Cookies, reminders, and recovery</h2>
            <p>
              Essential session and CSRF cookies support sign-in and protect
              requests. Private reminders appear only in the signed-in app; no
              push notifications are sent. In local development, password
              recovery emails are saved as private .eml files on the development
              machine. Production requires a configured email provider and a
              published retention policy.
            </p>
            <h2>Before this becomes a public service</h2>
            <p>
              The operator must provide a contact address, hosting and retention
              information, applicable age and consent rules, and a reviewed
              legal basis for processing health data. These operational
              requirements are not yet supplied. Use synthetic records when
              evaluating this local build.
            </p>
          </>
        ) : (
          <>
            <h2>What Almanac is for</h2>
            <p>
              Almanac supports menstrual recordkeeping and general education. It
              is not a medical device, emergency service, diagnosis,
              prescription, or contraceptive method. It cannot diagnose
              pregnancy, infertility, or a medical condition.
            </p>
            <h2>Estimates have limits</h2>
            <p>
              Period estimates use recorded completed cycles and may be
              unavailable or inaccurate. No predicted day is guaranteed
              pregnancy-free. Fertility estimates remain unavailable until an
              independently reviewed policy and implementation exist.
            </p>
            <h2>Your account and choices</h2>
            <p>
              Keep your sign-in details private. Enter dates as accurately as
              you can and correct mistakes when you notice them. You choose
              whether to export or share records. Sign out when you finish using
              a shared device.
            </p>
            <h2>Education and care</h2>
            <p>
              Educational summaries link to public health sources and identify
              their review status. Consult a qualified healthcare professional
              for advice about your circumstances. Contact local emergency
              services when urgent help is needed.
            </p>
            <h2>Development status</h2>
            <p>
              This is a locally implemented application for evaluation. There is
              no service availability guarantee. The deployment operator,
              jurisdiction, contact details, age-consent policy, and legally
              reviewed terms must be established before a public launch.
            </p>
          </>
        )}
        <Link to="/" className="inline-link">
          Return home
        </Link>
      </main>
      <Footer />
    </>
  );
}
