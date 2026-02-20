import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
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
