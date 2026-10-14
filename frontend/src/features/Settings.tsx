import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Download, LockKeyhole, Trash2 } from "lucide-react";
import { api, downloadExport } from "../lib/api";
import { useApp } from "../lib/context";
import { ErrorMessage, Modal, Brand } from "../components/UI";
import type { User } from "../lib/types";
export default function Settings({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const { user, setUser, notify } = useApp(),
    nav = useNavigate(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState(false),
    [deleteError, setDeleteError] = useState("");
  if (!user) return null;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget);
    try {
      const u = await api<User>("/settings", "PUT", {
        name: d.get("name"),
        timezone: d.get("timezone"),
        onboarded: true,
        preferences: {
          goal: d.get("goal"),
          remind_logging: d.has("remind_logging"),
          remind_period: d.has("remind_period"),
        },
      });
      setUser(u);
      notify(
        onboarding
          ? "Your journal is ready. Add past dates whenever you like."
          : "Your preferences have been saved.",
      );
      if (onboarding) nav("/journal");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setDeleteError("");
    try {
      await api(
        "/account",
        "DELETE",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setUser(null);
      notify("Your account and live records have been deleted.");
      nav("/");
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const content = (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {onboarding ? "MAKE YOURSELF AT HOME" : "JUST THE WAY YOU LIKE IT"}
          </p>
          <h1>
            {onboarding ? "A journal that fits you." : "Your preferences."}
          </h1>
          <p>
            {onboarding
              ? "Choose what feels useful. You can change all of this later."
              : "Small choices. A space that feels like yours."}
          </p>
        </div>
      </div>
      <form className="settings-form" onSubmit={submit}>
        <ErrorMessage message={error} />
        <section>
          <h2>{onboarding ? "A little introduction" : "Your profile"}</h2>
          <div className="two-fields">
            <label>
              Your name
              <input
                name="name"
                defaultValue={user.name}
                required
                maxLength={80}
                autoComplete="given-name"
              />
            </label>
            <label>
              Timezone
              <select name="timezone" defaultValue={user.timezone}>
                {Array.from(
                  new Set([
                    user.timezone,
                    "UTC",
                    ...Intl.supportedValuesOf("timeZone"),
                  ]),
                )
                  .sort()
                  .map((t) => (
                    <option key={t}>{t}</option>
                  ))}
              </select>
            </label>
          </div>
          {!onboarding && (
            <p className="fine-print">
              Account email: {user.email}.{" "}
              <Link to="/forgot-password">Reset your password</Link>.
            </p>
          )}
        </section>
        <section>
          <h2>What brings you here?</h2>
          <p className="muted">
            Both options include period tracking and education.
          </p>
          <label className="option-row">
            <input
              type="radio"
              name="goal"
              value="monitoring"
              defaultChecked={user.preferences?.goal !== "awareness"}
            />
            <span>
              <strong>Understand my period</strong>
              <small>
                Keep dates, notice changes, and build a personal record.
              </small>
            </span>
          </label>
          <label className="option-row">
            <input
              type="radio"
              name="goal"
              value="awareness"
              defaultChecked={user.preferences?.goal === "awareness"}
            />
            <span>
              <strong>Learn about fertility awareness</strong>
              <small>
                Explore educational information. Fertility estimates are
                unavailable.
              </small>
            </span>
          </label>
        </section>
        <section>
          <h2>
            <Bell size={21} /> Gentle reminders
          </h2>
          <p>
            Optional reminders appear inside your journal while you’re signed
            in. They aren’t sent to your phone, email, or browser.
          </p>
          <label className="option-row">
            <input
              type="checkbox"
              name="remind_logging"
              defaultChecked={user.preferences?.remind_logging}
            />
            <span>
              <strong>A daily moment to check in</strong>
              <small>
                “A moment for your journal?” when there’s no check-in for today.
              </small>
            </span>
          </label>
          <label className="option-row">
            <input
              type="checkbox"
              name="remind_period"
              defaultChecked={user.preferences?.remind_period}
            />
            <span>
              <strong>A heads-up when a range approaches</strong>
              <small>
                The same discreet wording, within three days of an available
                estimate.
              </small>
            </span>
          </label>
        </section>
        {onboarding && (
          <div className="muted-box">
            Have previous period dates? You can add them from your calendar
            after setup. Starting with no history is welcome, too.
          </div>
        )}
        <button className="button primary" disabled={busy}>
          {busy
            ? "Saving…"
            : onboarding
              ? "Open my journal"
              : "Save preferences"}
          <ArrowRight size={16} />
        </button>
      </form>
      {!onboarding && (
        <section className="data-controls">
          <h2>
            <LockKeyhole size={22} /> Your data, your choice
          </h2>
          <div className="control-row">
            <div>
              <h3>Take your records with you</h3>
              <p>
                Download periods, symptoms, notes, and clearly labeled derived
                values and estimates.
              </p>
            </div>
            <button
              className="button secondary"
              onClick={async () => {
                try {
                  await downloadExport();
                  notify("Your CSV has downloaded.");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
          <div className="control-row">
            <div>
              <h3>Delete your account</h3>
              <p>
                Permanently remove your account and live records. Downloaded
                files and existing backups are not remotely erased.
              </p>
            </div>
            <button
              className="button danger-outline"
              onClick={() => setDeleting(true)}
            >
              <Trash2 size={16} /> Delete account
            </button>
          </div>
          <Link to="/privacy" className="inline-link">
            Read the privacy notice <ArrowRight size={16} />
          </Link>
        </section>
      )}
      {deleting && (
        <Modal
          title="Delete your account?"
          onClose={() => {
            if (!busy) setDeleting(false);
          }}
        >
          <form onSubmit={remove}>
            <p>
              This permanently deletes your account, periods, symptoms,
              preferences, and active sessions from the live database. This
              cannot be undone. Export first if you want a copy.
            </p>
            <ErrorMessage message={deleteError} />
            <label>
              Confirm your password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setDeleting(false)}
              >
                Keep my account
              </button>
              <button className="button danger" disabled={busy}>
                {busy ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
  return onboarding ? (
    <div className="onboarding">
      <Brand />
      <main id="main">{content}</main>
    </div>
  ) : (
    content
  );
}
