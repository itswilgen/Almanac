import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal, ErrorMessage } from "../components/UI";
import { useApp } from "../lib/context";
import { api } from "../lib/api";
import { periodError, todayIn } from "../lib/dates";
import type { Period, Symptom } from "../lib/types";
export function EntryForm({
  kind,
  date,
  entry,
  onClose,
}: {
  kind: "period" | "symptom";
  date: string;
  entry?: Period | Symptom;
  onClose: () => void;
}) {
  const { user, journal, refresh, notify } = useApp(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false),
    [ongoing, setOngoing] = useState(
      entry && "end_date" in entry ? !entry.end_date : true,
    );
  const period = entry && "start_date" in entry ? entry : undefined,
    symptom = entry && "observations" in entry ? entry : undefined,
    today = todayIn(user?.timezone);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data: Record<string, unknown> = Object.fromEntries(
      new FormData(e.currentTarget),
    );
    if (kind === "period") {
      data.end_date = ongoing ? null : data.end_date;
      const error = periodError(
        String(data.start_date),
        String(data.end_date || ""),
        today,
        journal?.periods || [],
        period?.id,
      );
      if (error) {
        setError(error);
        return;
      }
    }
    setBusy(true);
    try {
      await api(
        `/${kind === "period" ? "periods" : "symptoms"}${entry ? `/${entry.id}` : ""}`,
        entry ? "PUT" : "POST",
        data,
      );
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      return;
    }
    notify(
      entry ? "Your entry has been updated." : "Your entry has been saved.",
    );
    onClose();
    await refresh().catch(() => {});
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await api(
        `/${kind === "period" ? "periods" : "symptoms"}/${entry?.id}`,
        "DELETE",
      );
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      return;
    }
    notify("Entry deleted. Your cycle summary will update.");
    onClose();
    await refresh().catch(() => {});
  }
  return (
    <Modal
      title={
        confirm
          ? "Delete this entry?"
          : `${entry ? "Edit" : kind === "period" ? "Log" : "Add"} ${kind === "period" ? "period" : "daily check-in"}`
      }
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {confirm ? (
        <>
          <p>
            This removes the recorded entry and recalculates your summary. This
            action cannot be undone.
          </p>
          <ErrorMessage message={error} />
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => setConfirm(false)}
              disabled={busy}
            >
              Keep entry
            </button>
            <button className="button danger" onClick={remove} disabled={busy}>
              {busy ? "Deleting…" : "Delete entry"}
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <p className="form-intro">
            {kind === "period"
              ? "Add what you know. You can come back and change it anytime."
              : "A little space to notice how you feel. All fields stay private."}
          </p>
          <ErrorMessage message={error} />
          {kind === "period" ? (
            <>
              <label>
                Start date
                <input
                  name="start_date"
                  type="date"
                  max={today}
                  defaultValue={period?.start_date || date}
                  required
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={ongoing}
                  onChange={(e) => setOngoing(e.target.checked)}
                />{" "}
                My period is still ongoing
              </label>
              {!ongoing && (
                <label>
                  End date
                  <input
                    name="end_date"
                    type="date"
                    max={today}
                    defaultValue={period?.end_date || date}
                    required
                  />
                </label>
              )}
              <div className="muted-box">
                Recorded dates describe what happened. Upcoming estimates are
                shown separately.
              </div>
            </>
          ) : (
            <>
              <label>
                Date
                <input
                  name="date"
                  type="date"
                  max={today}
                  defaultValue={symptom?.date || date}
                  required
                />
              </label>
              <div className="two-fields">
                <label>
                  Bleeding
                  <select
                    name="bleeding"
                    defaultValue={symptom?.observations.bleeding || "none"}
                  >
                    {["none", "spotting", "light", "moderate", "heavy"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Cramps
                  <select
                    name="cramps"
                    defaultValue={symptom?.observations.cramps || "none"}
                  >
                    {["none", "mild", "moderate", "severe"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Mood
                <select
                  name="mood"
                  defaultValue={symptom?.observations.mood || "unrecorded"}
                >
                  {[
                    "unrecorded",
                    "calm",
                    "energized",
                    "low",
                    "anxious",
                    "irritable",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                A note to yourself <small>(optional)</small>
                <textarea
                  name="notes"
                  maxLength={2000}
                  rows={3}
                  defaultValue={symptom?.observations.notes || ""}
                  placeholder="Anything you’d like to remember…"
                />
              </label>
            </>
          )}
          <div className="form-actions">
            {entry && (
              <button
                className="text-button delete-button"
                type="button"
                onClick={() => setConfirm(true)}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button
              className="button secondary"
              type="button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="button primary" disabled={busy}>
              {busy ? "Saving…" : "Save entry"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
