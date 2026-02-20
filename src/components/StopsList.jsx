const STOP_CONFIG = {
  pickup: { color: 'bg-emerald-500', label: 'Pickup', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  dropoff: { color: 'bg-red-500', label: 'Dropoff', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  rest: { color: 'bg-purple-500', label: 'Rest', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
  break: { color: 'bg-amber-500', label: 'Break', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
  fuel: { color: 'bg-cyan-500', label: 'Fuel', textColor: 'text-cyan-700', bgColor: 'bg-cyan-50' },
};

export default function StopsList({ stops }) {
  if (!stops || stops.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-900">Route Stops & Schedule</h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />

        <div className="space-y-1">
          {stops.map((stop, index) => {
            const config = STOP_CONFIG[stop.type] || STOP_CONFIG.break;
            return (
              <div key={index} className="relative flex items-start gap-4 pl-0">
                {/* Timeline dot */}
                <div className={`relative z-10 w-[31px] h-[31px] shrink-0 rounded-full ${config.color} flex items-center justify-center`}>
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTime(stop.start_time)} — {formatTime(stop.end_time)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({stop.duration_hours}h)
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{stop.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
