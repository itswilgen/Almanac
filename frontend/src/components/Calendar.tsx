import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatDate, parseDate } from "../lib/dates";
import type { Period, Summary, Symptom } from "../lib/types";
export function Calendar({
  today,
  periods = [],
  symptoms = [],
  estimate = null,
  onSelect,
  example = false,
}: {
  today: string;
  periods?: Period[];
  symptoms?: Symptom[];
  estimate?: Summary["estimate"];
  onSelect?: (date: string) => void;
  example?: boolean;
}) {
  const [month, setMonth] = useState(today.slice(0, 7)),
    [selected, setSelected] = useState(today);
  const first = `${month}-01`,
    d = parseDate(first),
    offset = (d.getUTCDay() + 6) % 7,
    total = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
    ).getUTCDate();
  const move = (n: number) => {
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
    setMonth(next.toISOString().slice(0, 7));
  };
  function select(date: string) {
    setSelected(date);
    onSelect?.(date);
  }
  return (
    <section
      className={`calendar ${example ? "calendar-example" : ""}`}
      aria-label={example ? "Example menstrual calendar" : "Menstrual calendar"}
    >
      <div className="calendar-heading">
        <h2>{formatDate(first, { month: "long", year: "numeric" })}</h2>
        <div className="calendar-controls">
          <button
            className="text-button"
            onClick={() => {
              setMonth(today.slice(0, 7));
              select(today);
            }}
          >
            Today
          </button>
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => move(-1)}
          >
            <ChevronLeft size={19} />
          </button>
          <button
            className="icon-button"
            aria-label="Next month"
            onClick={() => move(1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div className="weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: Math.ceil((offset + total) / 7) * 7 }, (_, i) => {
          const date = addDays(first, i - offset),
            isMonth = date.startsWith(month),
            recorded = periods.some(
              (p) => date >= p.start_date && date <= (p.end_date || today),
            ),
            estimated =
              estimate && date >= estimate.from && date <= estimate.to,
            note = symptoms.some((s) => s.date === date);
          return (
            <button
              key={date}
              data-date={date}
              className={`day ${!isMonth ? "outside" : ""} ${recorded ? "recorded" : ""} ${estimated ? "estimated" : ""} ${date === today ? "today" : ""} ${date === selected ? "selected" : ""}`}
              aria-pressed={date === selected}
              aria-label={`${formatDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${recorded ? ", recorded period" : ""}${estimated ? ", estimated period start range" : ""}${note ? ", check-in recorded" : ""}${date === today ? ", today" : ""}`}
              onClick={() => select(date)}
              onKeyDown={(e) => {
                const n = (
                  {
                    ArrowLeft: -1,
                    ArrowRight: 1,
                    ArrowUp: -7,
                    ArrowDown: 7,
                  } as Record<string, number>
                )[e.key];
                if (n) {
                  e.preventDefault();
                  const target = addDays(date, n);
                  setSelected(target);
                  if (!target.startsWith(month)) setMonth(target.slice(0, 7));
                  setTimeout(
                    () =>
                      document
                        .querySelector<HTMLButtonElement>(
                          `[data-date="${target}"]`,
                        )
                        ?.focus(),
                    0,
                  );
                }
              }}
            >
              <span>{parseDate(date).getUTCDate()}</span>
              <small>
                {recorded ? "•" : estimated ? "◌" : note ? "·" : ""}
              </small>
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span>
          <i className="legend-recorded" />
          Recorded period
        </span>
        <span>
          <i className="legend-estimated" />
          Estimated start range
        </span>
        <span>
          <i className="legend-today" />
          Today
        </span>
      </div>
      {example && (
        <p className="example-caption">
          ILLUSTRATIVE EXAMPLE · NOT YOUR HEALTH DATA
        </p>
      )}
    </section>
  );
}
