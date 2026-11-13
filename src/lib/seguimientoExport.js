// Exporta los desvíos de un informe RG.SGI.27 en un archivo .json que un flujo de
// Power Automate levanta desde SharePoint (carpeta "Importar observaciones") y carga
// en la lista Seguimiento_Acciones_SSMA, sin duplicar las que siguen abiertas.
import { CHECKLISTS } from './checklists.js';
import { describeKey } from './checklistUtils.js';

export const EXPORT_VERSION = 1;
const DIAS_PLAZO = 15;

// "Control de Sólidos" -> CDS · "Fluidos / Inyección" -> SFP
export const servicioDe = (sector = '') => {
  const s = sector.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  if (s.includes('SOLIDOS') || s.includes('CDS')) return 'CDS';
  if (s.includes('FLUIDO') || s.includes('SFP') || s.includes('INYECC')) return 'SFP';
  return '';
};

// Mismo nombre de equipo que usa la lista: "TECPETROL - F-26" -> "F-26", "HP213 YPF" -> "H&P-213"
export const equipoLista = (equipo = '') => {
  const t = equipo.toUpperCase().replace(/\s+/g, '');
  const pats = [
    [/H&?P-?(\d{3})/, 'H&P-'], [/DLS-?(\d{3})/, 'DLS-'], [/SAI-?(\d{3})/, 'SAI-'],
    [/(?:^|[^A-Z])F-?(\d{2})(?!\d)/, 'F-'], [/(?:^|[^A-Z])N-?(\d{3})/, 'N-'], [/(?:^|[^A-Z])T-?(\d{3})/, 'T-'],
  ];
  for (const [re, pre] of pats) { const m = t.match(re); if (m) return pre + m[1]; }
  return equipo.trim();
};

const ddmmyyyyToIso = (s = '') => {
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return '';
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
};
const addDays = (iso, n) => {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Referencia estable del ítem: "RG.SSA.07.AR · 10 Unidad CDS · f" (con la unidad si se repite: "11 Decanters (Decanter 1) · b")
export const itemRef = (cl, key) => {
  const def = CHECKLISTS[cl.type];
  const d = def && describeKey(cl, def, key);
  if (!d) return '';
  const letra = ((d.item || '').match(/^\s*([a-zñ]{1,2})\s*\)/i) || [])[1] || String(Number(key.split(':')[2]) + 1);
  const unidad = d.unit ? ` (${d.section.repeat.label} ${(cl.units[d.section.id] || []).findIndex(u => u.id === d.unit.id) + 1})` : '';
  return `${def.code} · ${d.section.label}${unidad} · ${letra.toLowerCase()}`;
};

export const buildSeguimientoExport = (r, pdfName = '') => {
  const fecha = ddmmyyyyToIso(r.info.fecha);
  const servicio = servicioDe(r.info.sector);
  const equipo = equipoLista(r.info.equipo);
  const clById = Object.fromEntries((r.checklists || []).map(c => [c.id, c]));
  let n = 0;
  const observaciones = [];
  for (const key of ['CALIDAD', 'SSA']) {
    for (const o of (r.observaciones || []).filter(x => x.aspecto === key)) {
      n++;
      if (o.estado !== 'DESVIO') continue;
      const cl = o.fromChecklist && clById[o.fromChecklist.clId];
      observaciones.push({
        nro: n,
        item: cl ? itemRef(cl, o.fromChecklist.key) : '',
        observacion: (o.texto || '').trim(),
        accion: (o.accion || '').trim() || 'Acondicionar',
        fechaLimite: o.accionFecha || addDays(fecha, DIAS_PLAZO),
      });
    }
  }
  return {
    tipo: 'RG.SGI.27-seguimiento',
    version: EXPORT_VERSION,
    informe: {
      archivo: pdfName,
      fecha,
      servicio,
      equipo,
      equipoInforme: r.info.equipo || '',
      locacion: [r.info.locacion, r.info.pozo && `Pozo ${r.info.pozo}`].filter(Boolean).join(' - '),
      responsable: r.info.responsable || '',
      tipoOrigen: 'Inspección SSA',
    },
    observaciones,
  };
};

export const seguimientoFileName = (pdfName) => pdfName.replace(/\.pdf$/i, '') + ' - seguimiento.json';
