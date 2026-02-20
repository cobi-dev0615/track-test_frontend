import { useState } from 'react';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import TripSummary from './components/TripSummary';
import StopsList from './components/StopsList';
import ELDLogSheet from './components/ELDLogSheet';
import { planTrip } from './api/tripApi';

function App() {
  const [tripResult, setTripResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setTripResult(null);
    try {
      const result = await planTrip(formData);
      setTripResult(result);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to plan trip';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ELD Trip Planner</h1>
              <p className="text-xs text-slate-500">HOS-Compliant Route Planning & Electronic Logging</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Trip Form */}
        <TripForm onSubmit={handleSubmit} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-800">Trip Planning Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
            </div>
            <p className="text-slate-500 font-medium">Planning your route & generating ELD logs...</p>
          </div>
        )}

        {/* Results */}
        {tripResult && !loading && (
          <div className="mt-8 space-y-8">
            {/* Summary */}
            <TripSummary summary={tripResult.trip_summary} locations={tripResult.locations} />

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Route Map</h2>
                <p className="text-sm text-slate-500">Route with stops, rest areas, and fuel stations</p>
              </div>
              <div className="h-[500px]">
                <RouteMap
                  routeGeometry={tripResult.route_geometry}
                  locations={tripResult.locations}
                  stops={tripResult.stops}
                />
              </div>
            </div>

            {/* Stops List */}
            <StopsList stops={tripResult.stops} />

            {/* ELD Logs */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Daily ELD Log Sheets</h2>
                <p className="text-sm text-slate-500">
                  {tripResult.eld_logs.length} day{tripResult.eld_logs.length !== 1 ? 's' : ''} of logs generated
                </p>
              </div>
              <div className="space-y-6">
                {tripResult.eld_logs.map((log, index) => (
                  <ELDLogSheet key={log.date} log={log} dayIndex={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-400">
          ELD Trip Planner &middot; Property-Carrying Driver &middot; 70hr/8day Cycle &middot; FMCSA HOS Compliant
        </div>
      </footer>
    </div>
  );
}

export default App;
