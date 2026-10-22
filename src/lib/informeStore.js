// Borradores de informes guardados en el dispositivo (IndexedDB).
// Texto y fotos quedan en el celular/PC; al servidor solo viaja el texto cuando hay señal.
import { createStore, get, set, del, entries } from 'idb-keyval';

const reportsDB = createStore('hse-informes', 'reports');
const photosDB = createStore('hse-informes-fotos', 'photos');

export const listReports = async () => {
  const all = await entries(reportsDB);
  return all.map(([, v]) => v).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};
export const getReport = (id) => get(id, reportsDB);
export const saveReport = (report) => set(report.id, { ...report, updatedAt: Date.now() }, reportsDB);
export const deleteReport = async (report) => {
  for (const o of report.observaciones || []) {
    for (const f of o.fotos || []) await del(f.id, photosDB);
  }
  await del(report.id, reportsDB);
};

export const savePhoto = (id, blob) => set(id, blob, photosDB);
export const getPhoto = (id) => get(id, photosDB);
export const deletePhoto = (id) => del(id, photosDB);

export const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
