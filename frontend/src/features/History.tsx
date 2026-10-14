import { useState } from "react";
import { Download, Plus, History as HistoryIcon } from "lucide-react";
import { useApp } from "../lib/context";
import { formatDate, daysBetween, todayIn } from "../lib/dates";
import { downloadExport } from "../lib/api";
import { EntryForm } from "./EntryForms";
import type { Period, Symptom } from "../lib/types";
import { ErrorMessage } from "../components/UI";
export default function History() {
  const { journal, user, notify } = useApp(),
    [form, setForm] = useState<{
      kind: "period" | "symptom";
      date: string;
      entry?: Period | Symptom;
    } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!journal) return <p role="status">Loading your history…</p>;
  const cycles = journal.summary.completed_cycles;
  async function exportData() {
    setBusy(true);
    setError("");
    try {
      await downloadExport();
      notify("Your CSV has downloaded. You decide whether to share it.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE BIGGER PICTURE</p>
          <h1>Your cycle history.</h1>
          <p>A record to return to, whenever you need it.</p>
        </div>
        <button
          className="button secondary"
          disabled={busy}
          onClick={exportData}
        >
          <Download size={17} />
          {busy ? "Preparing…" : "Export records"}
        </button>
      </div>
      <ErrorMessage message={error} />
      {cycles.length >= 3 && (
        <section className="history-chart">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RECORDED PATTERNS</p>
              <h2>Every cycle has its own pace.</h2>
            </div>
            <span>{cycles.length} completed cycles</span>
          </div>
          <div
            className="cycle-bars"
            role="img"
            aria-label={cycles
              .slice(-6)
              .map((c) => `${formatDate(c.start_date)}: ${c.days} days`)
              .join("; ")}
          >
            {cycles.slice(-6).map((c) => (
              <div className="bar-column" key={c.start_date}>
                <span>{c.days} days</span>
                <div className="bar-track">
                  <div
                    style={{
                      height: `${Math.min(100, (c.days / Math.max(...cycles.map((x) => x.days))) * 100)}%`,
                    }}
                  />
                </div>
                <small>{formatDate(c.start_date)}</small>
              </div>
            ))}
          </div>
          <p className="fine-print">
            Cycle length is the number of days between consecutive recorded
            starts. Bleeding duration is separate.
          </p>
        </section>
      )}
      <section className="history-records">
        <div className="section-heading">
          <h2>Period records</h2>
          <button
            className="text-button"
            onClick={() =>
              setForm({ kind: "period", date: todayIn(user?.timezone) })
            }
          >
            <Plus size={16} /> Add period
          </button>
        </div>
        {!journal.periods.length ? (
          <div className="empty-state">
            <HistoryIcon size={32} strokeWidth={1.2} />
            <h3>Your history starts here.</h3>
            <p>
              Log a period when you’re ready. We won’t fill the gaps with
              guesses.
            </p>
            <button
              className="button primary"
              onClick={() =>
                setForm({ kind: "period", date: todayIn(user?.timezone) })
              }
            >
              Log your first period
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Recorded dates</th>
                  <th>Bleeding duration</th>
                  <th>Completed cycle</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...journal.periods].reverse().map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>
                        {formatDate(p.start_date, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                      <span>
                        to {p.end_date ? formatDate(p.end_date) : "ongoing"}
                      </span>
                    </td>
                    <td>
                      {p.end_date
                        ? `${daysBetween(p.start_date, p.end_date) + 1} days`
                        : "Ongoing"}
                    </td>
                    <td>
                      {cycles.find((c) => c.start_date === p.start_date)?.days
                        ? `${cycles.find((c) => c.start_date === p.start_date)?.days} days`
                        : "Not completed"}
                    </td>
                    <td>
                      <button
                        className="text-button"
                        aria-label={`Edit period starting ${p.start_date}`}
                        onClick={() =>
                          setForm({
                            kind: "period",
                            date: p.start_date,
                            entry: p,
                          })
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="history-records">
        <div className="section-heading">
          <h2>Daily check-ins</h2>
          <button
            className="text-button"
            onClick={() =>
              setForm({ kind: "symptom", date: todayIn(user?.timezone) })
            }
          >
            <Plus size={16} /> Add check-in
          </button>
        </div>
        {!journal.symptoms.length ? (
          <p className="muted-box">
            Your symptoms and notes will appear here after your first check-in.
          </p>
        ) : (
          journal.symptoms.map((s) => (
            <div className="entry-row" key={s.id}>
              <div>
                <strong>
                  {formatDate(s.date, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
                <p>
                  {s.observations.bleeding} bleeding · {s.observations.cramps}{" "}
                  cramps · {s.observations.mood} mood
                </p>
                {s.observations.notes && (
                  <p className="private-text">{s.observations.notes}</p>
                )}
              </div>
              <button
                className="text-button"
                onClick={() =>
                  setForm({ kind: "symptom", date: s.date, entry: s })
                }
              >
                Edit
              </button>
            </div>
          ))
        )}
      </section>
      {form && <EntryForm {...form} onClose={() => setForm(null)} />}
    </>
  );
}
