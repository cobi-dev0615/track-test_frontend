import { useRef } from 'react';

/*
 * Standard DOT Daily Log Grid:
 * Y-axis (4 rows): 1-Off Duty, 2-Sleeper Berth, 3-Driving, 4-On Duty Not Driving
 * X-axis: 24 hours (Midnight to Midnight), each hour divided into 4 (15-min marks)
 * A continuous line shows driver's duty status throughout the day.
 */

const STATUS_ROWS = [
  { key: 'off_duty', label: 'OFF', fullLabel: 'Off Duty', color: '#10b981', index: 0 },
  { key: 'sleeper_berth', label: 'SB', fullLabel: 'Sleeper Berth', color: '#8b5cf6', index: 1 },
  { key: 'driving', label: 'D', fullLabel: 'Driving', color: '#3b82f6', index: 2 },
  { key: 'on_duty_not_driving', label: 'ON', fullLabel: 'On Duty (Not Driving)', color: '#f59e0b', index: 3 },
];

const HOURS = Array.from({ length: 25 }, (_, i) => i);

// Grid dimensions
const MARGIN = { top: 30, right: 20, bottom: 20, left: 55 };
const GRID_WIDTH = 720;
const ROW_HEIGHT = 28;
const GRID_HEIGHT = ROW_HEIGHT * 4;
const TOTAL_WIDTH = GRID_WIDTH + MARGIN.left + MARGIN.right;
const TOTAL_HEIGHT = GRID_HEIGHT + MARGIN.top + MARGIN.bottom;

function hourToX(hour) {
  return MARGIN.left + (hour / 24) * GRID_WIDTH;
}

function statusToY(statusKey) {
  const row = STATUS_ROWS.find((r) => r.key === statusKey);
  if (!row) return MARGIN.top;
  return MARGIN.top + row.index * ROW_HEIGHT + ROW_HEIGHT / 2;
}

export default function ELDLogSheet({ log, dayIndex }) {
  const svgRef = useRef(null);

  const entries = log.entries || [];
  const totalHours = log.total_hours || {};

  // Build the continuous line path
  const linePath = buildLinePath(entries);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            Day {log.day_number} — {formatDate(log.date)}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {log.total_miles > 0 ? `${log.total_miles} miles driven` : 'No driving'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {STATUS_ROWS.map((row) => (
            <div key={row.key} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
              <span className="text-slate-600">{row.fullLabel}:</span>
              <span className="font-semibold text-slate-900">
                {formatDuration(totalHours[row.key] || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 py-4 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
          className="w-full min-w-[700px]"
          style={{ maxHeight: '220px' }}
        >
          {/* Background */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={GRID_WIDTH}
            height={GRID_HEIGHT}
            fill="#fafbfc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Row backgrounds (alternating) */}
          {STATUS_ROWS.map((row, i) => (
            <rect
              key={row.key}
              x={MARGIN.left}
              y={MARGIN.top + i * ROW_HEIGHT}
              width={GRID_WIDTH}
              height={ROW_HEIGHT}
              fill={i % 2 === 0 ? '#fafbfc' : '#f1f5f9'}
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          ))}

          {/* Row labels */}
          {STATUS_ROWS.map((row, i) => (
            <g key={`label-${row.key}`}>
              <rect
                x={0}
                y={MARGIN.top + i * ROW_HEIGHT}
                width={MARGIN.left - 2}
                height={ROW_HEIGHT}
                fill={row.color}
                opacity={0.1}
                rx={4}
              />
              <text
                x={MARGIN.left - 8}
                y={MARGIN.top + i * ROW_HEIGHT + ROW_HEIGHT / 2}
                textAnchor="end"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="600"
                fill={row.color}
              >
                {row.label}
              </text>
            </g>
          ))}

          {/* Hour grid lines and labels */}
          {HOURS.map((hour) => {
            const x = hourToX(hour);
            const isMajor = hour % 3 === 0;
            return (
              <g key={`hour-${hour}`}>
                <line
                  x1={x}
                  y1={MARGIN.top}
                  x2={x}
                  y2={MARGIN.top + GRID_HEIGHT}
                  stroke={isMajor ? '#cbd5e1' : '#e2e8f0'}
                  strokeWidth={isMajor ? 1 : 0.5}
                />
                {hour < 24 && (
                  <text
                    x={x + (GRID_WIDTH / 24) / 2}
                    y={MARGIN.top - 8}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#94a3b8"
                    fontWeight={isMajor ? '600' : '400'}
                  >
                    {hour === 0 ? 'M' : hour === 12 ? 'N' : hour > 12 ? `${hour - 12}` : `${hour}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Midnight / Noon labels */}
          <text x={hourToX(0)} y={MARGIN.top - 18} textAnchor="middle" fontSize="7" fill="#64748b">
            Mid
          </text>
          <text x={hourToX(12)} y={MARGIN.top - 18} textAnchor="middle" fontSize="7" fill="#64748b">
            Noon
          </text>
          <text x={hourToX(24)} y={MARGIN.top - 18} textAnchor="middle" fontSize="7" fill="#64748b">
            Mid
          </text>

          {/* 15-minute tick marks */}
          {Array.from({ length: 96 }, (_, i) => {
            const hour = i / 4;
            const x = hourToX(hour);
            if (i % 4 === 0) return null; // Skip full hours (already drawn)
            return (
              <line
                key={`tick-${i}`}
                x1={x}
                y1={MARGIN.top}
                x2={x}
                y2={MARGIN.top + GRID_HEIGHT}
                stroke="#f1f5f9"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Colored status blocks (background) */}
          {entries.map((entry, i) => {
            const row = STATUS_ROWS.find((r) => r.key === entry.status);
            if (!row) return null;
            const x = hourToX(entry.start_hour);
            const width = hourToX(entry.end_hour) - x;
            if (width < 0.5) return null;

            return (
              <rect
                key={`block-${i}`}
                x={x}
                y={MARGIN.top + row.index * ROW_HEIGHT + 2}
                width={width}
                height={ROW_HEIGHT - 4}
                fill={row.color}
                opacity={0.15}
                rx={2}
              />
            );
          })}

          {/* The main duty status line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Status transition dots */}
          {entries.map((entry, i) => {
            const x = hourToX(entry.start_hour);
            const y = statusToY(entry.status);
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="white"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Remarks */}
      {log.remarks && log.remarks.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs font-medium text-slate-500 mb-1">Remarks</p>
          <div className="space-y-0.5">
            {log.remarks.map((remark, i) => (
              <p key={i} className="text-xs text-slate-600">{remark}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildLinePath(entries) {
  if (!entries || entries.length === 0) return null;

  let path = '';
  let prevY = null;

  entries.forEach((entry, i) => {
    const x1 = hourToX(entry.start_hour);
    const x2 = hourToX(entry.end_hour);
    const y = statusToY(entry.status);

    if (i === 0) {
      path += `M ${x1} ${y}`;
    } else if (prevY !== null && prevY !== y) {
      // Vertical transition
      path += ` L ${x1} ${prevY}`;
      path += ` L ${x1} ${y}`;
    }

    // Horizontal line for this status duration
    path += ` L ${x2} ${y}`;
    prevY = y;
  });

  return path;
}

function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0 && m === 0) return '0h';
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
