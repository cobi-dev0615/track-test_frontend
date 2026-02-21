import axios from 'axios';

// On Vercel (HTTPS), use relative /api so rewrites proxy to backend and avoid mixed content.
// Locally, use VITE_API_URL or fallback to same-origin.
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '';
  }
  return import.meta.env.VITE_API_URL || '';
};

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 60000,
});

export async function planTrip(tripData) {
  const response = await api.post('/api/plan/', tripData);
  return response.data;
}

export async function autocompleteLocation(query) {
  if (!query || query.length < 3) return [];
  const response = await api.get('/api/autocomplete/', {
    params: { q: query },
  });
  return response.data;
}
