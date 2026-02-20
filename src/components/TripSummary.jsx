export default function TripSummary({ summary, locations }) {
  const stats = [
    {
      label: 'Total Distance',
      value: `${summary.total_miles.toLocaleString()} mi`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Driving Time',
      value: formatHours(summary.total_driving_hours),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Trip Time',
      value: formatHours(summary.total_trip_hours),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Stops',
      value: `${summary.number_of_stops} stops`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      ),
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-900">Trip Summary</h2>
      </div>

      {/* Route description */}
      <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-slate-50 rounded-xl text-sm">
        <span className="font-medium text-slate-700 truncate">{truncateName(locations?.current?.name)}</span>
        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="font-medium text-emerald-700 truncate">{truncateName(locations?.pickup?.name)}</span>
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="font-medium text-red-700 truncate">{truncateName(locations?.dropoff?.name)}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
            <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time range */}
      {summary.start_time && summary.end_time && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>
            <span className="font-medium text-slate-700">Start:</span>{' '}
            {new Date(summary.start_time).toLocaleString()}
          </span>
          <span>
            <span className="font-medium text-slate-700">Est. Arrival:</span>{' '}
            {new Date(summary.end_time).toLocaleString()}
          </span>
          <span>
            <span className="font-medium text-slate-700">Days:</span> {summary.number_of_days}
          </span>
        </div>
      )}
    </div>
  );
}

function formatHours(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function truncateName(name) {
  if (!name) return '—';
  const parts = name.split(',');
  return parts.slice(0, 2).join(',').trim();
}
