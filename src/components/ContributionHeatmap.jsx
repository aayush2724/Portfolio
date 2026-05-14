import { useMemo } from "react";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LEVEL_COLORS = [
  "rgba(255,255,255,0.06)",
  "rgba(34,197,94,0.35)",
  "rgba(34,197,94,0.55)",
  "rgba(34,197,94,0.75)",
  "rgba(34,197,94,0.95)",
];

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function getLevel(count) {
  if (!count) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function buildDays(activityByDate) {
  const today = new Date();
  const rawDays = [];

  for (let i = 364; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = toIsoDate(d);
    const count = Number(activityByDate?.[iso] || 0);

    rawDays.push({
      date: d,
      iso,
      count,
      level: getLevel(count),
    });
  }

  const first = rawDays[0];
  const firstWeekday = first.date.getDay();
  const leading = Array.from({ length: firstWeekday }, () => ({
    empty: true,
    level: 0,
  }));

  return [...leading, ...rawDays];
}

export default function ContributionHeatmap({
  title,
  username,
  provider,
  activityByDate,
  totalLabel,
}) {
  const days = useMemo(
    () => buildDays(activityByDate),
    [activityByDate],
  );

  const weeks = useMemo(() => {
    const out = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  const monthMarkers = useMemo(() => {
    return weeks
      .map((week, i) => {
        const firstDay = week.find((d) => !d.empty)?.date;
        if (!firstDay) return null;
        return {
          col: i,
          month: firstDay.getMonth(),
          day: firstDay.getDate(),
        };
      })
      .filter(Boolean)
      .filter((m, i, arr) => i === 0 || m.month !== arr[i - 1].month)
      .filter((m) => m.day <= 7);
  }, [weeks]);

  return (
    <div className="gc rounded-2xl border border-white/7 p-5 sm:p-6 overflow-x-auto">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-xs text-white/25 mb-1">{provider}</p>
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <p className="font-mono text-xs text-white/25 mt-1">{username}</p>
        </div>
        {totalLabel ? (
          <div className="font-mono text-xs text-white/35 text-right">
            {totalLabel}
          </div>
        ) : null}
      </div>

      <div className="min-w-[760px]">
        <div className="relative h-5 ml-8 mb-2">
          {monthMarkers.map((m) => (
            <span
              key={`${m.col}-${m.month}`}
              className="absolute font-mono text-[10px] text-white/30"
              style={{ left: `${m.col * 14}px` }}
            >
              {MONTH_LABELS[m.month]}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="w-6 flex flex-col justify-between py-[2px] font-mono text-[10px] text-white/25">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, di) => {
                  const day = week[di] || { empty: true, level: 0 };
                  return (
                    <div
                      key={di}
                      className="w-[11px] h-[11px] rounded-[2px] border border-white/5"
                      style={{
                        background: day.empty
                          ? "transparent"
                          : LEVEL_COLORS[day.level],
                      }}
                      title={
                        day.empty
                          ? ""
                          : `${day.count} contributions on ${day.iso}`
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 font-mono text-[10px] text-white/30">
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <span
              key={i}
              className="w-[11px] h-[11px] rounded-[2px] border border-white/5"
              style={{ background: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
