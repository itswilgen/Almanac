import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  Droplet,
  NotebookPen,
  Info,
  Bell,
  Leaf,
} from "lucide-react";
import { useApp } from "../lib/context";
import { todayIn, formatDate, daysBetween } from "../lib/dates";
import { Calendar } from "../components/Calendar";
import { EntryForm } from "./EntryForms";
import type { Period, Symptom } from "../lib/types";
export default function JournalPage() {
  const { user, journal } = useApp(),
    today = todayIn(user?.timezone),
    [selected, setSelected] = useState(today),
    [form, setForm] = useState<{
      kind: "period" | "symptom";
      date: string;
      entry?: Period | Symptom;
    } | null>(null);
  if (!journal) return <p role="status">Loading your calendar…</p>;
  const { periods, symptoms, summary } = journal,
    period = periods.find(
      (p) => selected >= p.start_date && selected <= (p.end_date || today),
    ),
    symptom = symptoms.find((s) => s.date === selected),
    estimate = summary.estimate,
    prefs = user?.preferences;
  const reminder =
    (prefs?.remind_logging && !symptoms.some((s) => s.date === today)) ||
    (prefs?.remind_period &&
      estimate &&
      daysBetween(today, estimate.from) <= 3);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {formatDate(today, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }).toUpperCase()}
          </p>
          <h1>
            A moment for you{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p>Your days, your patterns, your own pace.</p>
        </div>
        <button
          className="button primary"
          onClick={() => setForm({ kind: "period", date: today })}
        >
          <Plus size={18} /> Log period
        </button>
      </div>
      {user?.email === "demo@almanac.test" && (
        <p className="muted-box">
          SYNTHETIC DEMO ACCOUNT — these are example records.
        </p>
      )}
      {!user?.onboarded && (
        <Link to="/onboarding" className="notice-link">
          Finish setting up your journal <ArrowRight size={16} />
        </Link>
      )}
      {reminder && (
        <div className="reminder">
          <Bell size={18} />
          <div>
            <strong>A moment for your journal?</strong>
            <span>
              Your private reminder, shown only while you’re signed in.
            </span>
          </div>
          <button
            className="text-button"
            onClick={() =>
              setForm({
                kind: "symptom",
                date: today,
                entry: symptoms.find((s) => s.date === today),
              })
            }
          >
            Check in <ArrowRight size={15} />
          </button>
        </div>
      )}
      <div className="journal-layout">
        <div>
          <Calendar
            today={today}
            periods={periods}
            symptoms={symptoms}
            estimate={estimate}
            onSelect={setSelected}
          />
          <section className="selected-day">
            <div className="section-heading">
              <div>
                <p className="eyebrow">A PAGE IN YOUR JOURNAL</p>
                <h2>
                  {formatDate(selected, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <NotebookPen size={24} strokeWidth={1.3} />
            </div>
            {period && (
              <div className="entry-row">
                <span className="entry-icon">
                  <Droplet size={18} />
                </span>
                <div>
                  <strong>Recorded period</strong>
                  <p>
                    {formatDate(period.start_date)} –{" "}
                    {period.end_date ? formatDate(period.end_date) : "ongoing"}
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    setForm({ kind: "period", date: selected, entry: period })
                  }
                >
                  Edit period
                </button>
              </div>
            )}
            {symptom ? (
              <div className="entry-row">
                <span className="entry-icon neutral">
                  <NotebookPen size={18} />
                </span>
                <div>
                  <strong>Daily check-in</strong>
                  <p>
                    {symptom.observations.bleeding} bleeding ·{" "}
                    {symptom.observations.cramps} cramps ·{" "}
                    {symptom.observations.mood} mood
                  </p>
                  {symptom.observations.notes && (
                    <p className="private-text">{symptom.observations.notes}</p>
                  )}
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    setForm({ kind: "symptom", date: selected, entry: symptom })
                  }
                >
                  Edit check-in
                </button>
              </div>
            ) : (
              <div className="day-empty">
                <p>
                  {selected > today
                    ? "This page is still ahead of you. Recorded entries can be added when the day arrives."
                    : "Nothing noted yet. A small check-in can help you notice what changes."}
                </p>
                {selected <= today && (
                  <button
                    className="button secondary"
                    onClick={() => setForm({ kind: "symptom", date: selected })}
                  >
                    <Plus size={16} /> Add check-in
                  </button>
                )}
              </div>
            )}
            {!period && selected <= today && (
              <button
                className="text-button"
                onClick={() => setForm({ kind: "period", date: selected })}
              >
                Log a period on this date <ArrowRight size={15} />
              </button>
            )}
          </section>
        </div>
        <aside className="journal-aside">
          <section className="cycle-note">
            <p className="eyebrow">
              <Leaf size={15} /> YOUR CYCLE, AT A GLANCE
            </p>
            <h2>
              {summary.cycle_day ? (
                <>
                  Day <span>{summary.cycle_day}</span>
                </>
              ) : (
                "A fresh page."
              )}
            </h2>
            <p>
              {summary.cycle_day
                ? "Counting from the first day of your last recorded period."
                : "Your story starts with your first entry."}
            </p>
            <div className="note-divider" />
            <p className="eyebrow">NEXT PERIOD</p>
            <h3>
              {estimate
                ? `${formatDate(estimate.from)} – ${formatDate(estimate.to)}`
                : "Getting to know your cycle"}
            </h3>
            {estimate && (
              <span className="estimate-label">Estimated start range</span>
            )}
            <p className="summary-reason">{summary.reason}</p>
            <Link className="inline-link" to="/history">
              Explore your history <ArrowRight size={16} />
            </Link>
          </section>
          <section className="awareness-note">
            <Info size={21} />
            <h3>A note on fertility</h3>
            <p>
              Fertility estimates are not available. No calendar date is
              guaranteed pregnancy-free.
            </p>
            <Link className="inline-link" to="/learn/fertility-awareness">
              Understand the limits <ArrowRight size={15} />
            </Link>
          </section>
          <Link className="reading-note" to="/learn/understanding-your-cycle">
            <span className="eyebrow">A LITTLE KNOWLEDGE</span>
            <h3>Your cycle, in your own words.</h3>
            <span>
              Take a moment to read <ArrowRight size={16} />
            </span>
          </Link>
        </aside>
      </div>
      {form && <EntryForm {...form} onClose={() => setForm(null)} />}
    </>
  );
}
