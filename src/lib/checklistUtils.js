import { CHECKLISTS } from './checklists.js';

export const itemKey = (sectionId, unitId, i) => `${sectionId}:${unitId || '-'}:${i}`;

export const unitsFor = (cl, section) => (section.repeat ? (cl.units[section.id] || []) : [null]);

export const newChecklist = (type) => {
  const def = CHECKLISTS[type];
  const units = {};
  def.sections.filter(s => s.repeat).forEach(s => {
    const names = s.repeat.defaults || [''];
    units[s.id] = names.map((name, i) => ({ id: `u${i + 1}`, name }));
  });
  return {
    id: `cl-${type}-${Date.now().toString(36)}`,
    type,
    header: {},
    answers: {},
    units,
    extras: {},
  };
};

export const checklistProgress = (cl, def) => {
  const kind = Object.fromEntries(def.scale.map(s => [s.k, s.kind]));
  const out = { total: 0, done: 0, bad: 0, count: {}, bySection: {} };
  def.sections.forEach(section => {
    const sp = { total: 0, done: 0, bad: 0 };
    unitsFor(cl, section).forEach(u => {
      section.items.forEach((_, i) => {
        const a = cl.answers[itemKey(section.id, u?.id, i)];
        sp.total++;
        if (a && a.v) {
          sp.done++;
          out.count[a.v] = (out.count[a.v] || 0) + 1;
          if (kind[a.v] === 'bad') sp.bad++;
        }
      });
    });
    out.bySection[section.id] = sp;
    out.total += sp.total; out.done += sp.done; out.bad += sp.bad;
  });
  return out;
};

// Busca sección / unidad / ítem a partir de la clave
export const describeKey = (cl, def, key) => {
  const [sid, uid, idx] = key.split(':');
  const section = def.sections.find(s => s.id === sid);
  if (!section) return null;
  const units = unitsFor(cl, section);
  const ui = uid === '-' ? -1 : units.findIndex(u => u && u.id === uid);
  const unit = ui >= 0 ? units[ui] : null;
  const unitLabel = unit ? `${section.repeat.label} ${ui + 1}${unit.name ? ` – ${unit.name}` : ''}` : '';
  return { section, unit, unitLabel, item: section.items[Number(idx)] };
};

// Texto automático de la observación que se genera desde un ítem del checklist
export const autoObsText = (cl, key) => {
  const def = CHECKLISTS[cl.type];
  const d = describeKey(cl, def, key);
  if (!d) return '';
  const comment = (cl.answers[key]?.c || '').trim();
  const where = `${def.code} ${def.short} · ${d.section.label}${d.unitLabel ? ` (${d.unitLabel})` : ''}`;
  return `${where}: ${d.item}${comment ? `\n${comment}` : ''}`;
};
