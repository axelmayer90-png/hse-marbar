// Caché local para que la app pueda abrir y autocompletar datos sin señal.
// Se guarda en localStorage (se borra al cerrar sesión).
const PREFIX = 'hse_cache_';

export const cacheSet = (key, value) => {
  try { localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value })); } catch { /* sin espacio */ }
};

export const cacheGet = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw).v : fallback;
  } catch {
    return fallback;
  }
};

// Sesión de Supabase guardada en el dispositivo (para abrir la app sin señal)
export const getStoredSession = () => {
  try {
    const k = Object.keys(localStorage).find(x => x.startsWith('sb-') && x.endsWith('-auth-token'));
    if (!k) return null;
    const s = JSON.parse(localStorage.getItem(k));
    return s && s.user ? s : null;
  } catch {
    return null;
  }
};

export const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
