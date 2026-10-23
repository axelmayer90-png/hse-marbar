import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, MapPin, X, Crosshair } from 'lucide-react';
import { BASE_FORMS, FORM_ORDER, daysUntil, fmtDate } from '../lib/baseForms.js';
import { symbolDefaults } from '../lib/basePlans.js';

const STATUS = {
  ok: { label: 'Controlado este mes', ring: 'bg-emerald-500 border-white', dot: 'bg-emerald-500' },
  pending: { label: 'Pendiente este mes', ring: 'bg-amber-400 border-white', dot: 'bg-amber-400' },
  bad: { label: 'Con observaciones / vencido', ring: 'bg-red-600 border-white', dot: 'bg-red-600' },
  ghost: { label: 'En el plano, sin cargar', ring: 'bg-white/90 border-slate-500 border-dashed', dot: 'bg-white border border-dashed border-slate-500' },
};

const ZOOMS = [1, 1.6, 2.4, 3.2];

// Plano de la base con el estado de cada elemento
export default function BasePlanView({ plan, elements, lastControl, thisMonth, onControl, onEdit, onCreate, onSavePlanPos }) {
  const [zoomIdx, setZoomIdx] = useState(0);
  const [types, setTypes] = useState(() => new Set(FORM_ORDER));
  const [selected, setSelected] = useState(null); // { kind: 'el'|'sym', id }
  const [placing, setPlacing] = useState(null); // elemento a ubicar
  const [showGhosts, setShowGhosts] = useState(true);
  const imgRef = useRef(null);
  const zoom = ZOOMS[zoomIdx];

  const linkedSyms = useMemo(() => new Set(elements.map(e => e.data?.plan?.sym).filter(Boolean)), [elements]);
  const ghosts = plan.symbols.filter(s => !linkedSyms.has(s.id));
  const placed = elements.filter(e => e.data?.plan && typeof e.data.plan.x === 'number');
  const unplaced = elements.filter(e => !(e.data?.plan && typeof e.data.plan.x === 'number'));

  const statusOf = (e) => {
    const form = BASE_FORMS[e.type];
    const lc = lastControl(e.id);
    const expired = form.fields.some(f => f.expiry && (daysUntil(e.data?.[f.k]) ?? 1) < 0);
    if (expired || (lc && lc.issues > 0)) return 'bad';
    if (lc && (lc.control_date || '').slice(0, 7) === thisMonth) return 'ok';
    return 'pending';
  };

  const counts = useMemo(() => {
    const c = { ok: 0, pending: 0, bad: 0 };
    placed.forEach(e => { c[statusOf(e)]++; });
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed, thisMonth]);

  const toggleType = (t) => setTypes(s => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });

  const onPlanClick = (ev) => {
    if (!placing || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    onSavePlanPos(placing, { x: Math.round(x * 10000) / 10000, y: Math.round(y * 10000) / 10000 });
    setSelected({ kind: 'el', id: placing.id });
    setPlacing(null);
  };

  const selEl = selected?.kind === 'el' ? elements.find(e => e.id === selected.id) : null;
  const selSym = selected?.kind === 'sym' ? plan.symbols.find(s => s.id === selected.id) : null;
  const candidates = selSym ? elements.filter(e => e.type === selSym.type && !e.data?.plan?.sym) : [];

  const marker = (key, x, y, status, label, onClick, isSel) => (
    <button
      key={key}
      onClick={(ev) => { ev.stopPropagation(); if (!placing) onClick(); }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${placing ? 'pointer-events-none opacity-60' : ''}`}
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, zIndex: isSel ? 20 : 10 }}
      title={label}
    >
      <span className={`block w-5 h-5 rounded-full border-2 shadow ${STATUS[status].ring} ${isSel ? 'ring-4 ring-slate-900/70 scale-125' : ''}`} />
      <span className="mt-0.5 px-1 rounded bg-slate-900/80 text-white text-[9px] font-bold leading-tight whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-700">{plan.title}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoomIdx(i => Math.max(0, i - 1))} disabled={zoomIdx === 0} className="p-1.5 rounded border border-slate-300 disabled:opacity-40"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-[11px] font-semibold w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoomIdx(i => Math.min(ZOOMS.length - 1, i + 1))} disabled={zoomIdx === ZOOMS.length - 1} className="p-1.5 rounded border border-slate-300 disabled:opacity-40"><ZoomIn className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FORM_ORDER.filter(t => plan.symbols.some(s => s.type === t) || elements.some(e => e.type === t)).map(t => (
            <button key={t} onClick={() => toggleType(t)}
              className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${types.has(t) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-300'}`}>
              {BASE_FORMS[t].icon} {BASE_FORMS[t].plural}
            </button>
          ))}
          <button onClick={() => setShowGhosts(g => !g)}
            className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${showGhosts ? 'bg-slate-100 text-slate-800 border-slate-400' : 'bg-white text-slate-400 border-slate-200'}`}>
            Sin cargar ({ghosts.length})
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
          {['ok', 'pending', 'bad'].map(k => (
            <span key={k} className="inline-flex items-center gap-1"><span className={`w-3 h-3 rounded-full ${STATUS[k].dot}`} /> {STATUS[k].label} · {counts[k]}</span>
          ))}
          <span className="inline-flex items-center gap-1"><span className={`w-3 h-3 rounded-full ${STATUS.ghost.dot}`} /> {STATUS.ghost.label}</span>
        </div>
      </section>

      {placing && (
        <div className="sticky top-[60px] sm:top-[72px] z-20 bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between gap-2 shadow-lg">
          <span className="text-sm font-semibold flex items-center gap-2"><Crosshair className="w-4 h-4 text-amber-400" /> Tocá en el plano dónde está {BASE_FORMS[placing.type].singular} {placing.code}</span>
          <button onClick={() => setPlacing(null)} className="text-xs font-bold bg-white/10 rounded px-2 py-1">Cancelar</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto max-h-[75vh]" style={{ touchAction: 'pan-x pan-y' }}>
        <div className={`relative ${placing ? 'cursor-crosshair' : ''}`} style={{ width: `${zoom * 100}%` }} onClick={onPlanClick}>
          <img ref={imgRef} src={plan.image} alt={plan.title} className="block w-full h-auto select-none" draggable={false} />
          {showGhosts && ghosts.filter(s => types.has(s.type)).map(s =>
            marker(`g-${s.id}`, s.x, s.y, 'ghost', s.label, () => setSelected({ kind: 'sym', id: s.id }), selected?.id === s.id))}
          {placed.filter(e => types.has(e.type)).map(e =>
            marker(`e-${e.id}`, e.data.plan.x, e.data.plan.y, statusOf(e), e.code || BASE_FORMS[e.type].singular, () => setSelected({ kind: 'el', id: e.id }), selected?.id === e.id))}
        </div>
      </div>

      {/* Ficha del elemento / símbolo seleccionado */}
      {selEl && (() => {
        const form = BASE_FORMS[selEl.type];
        const lc = lastControl(selEl.id);
        const st = statusOf(selEl);
        return (
          <section className="bg-white rounded-xl shadow-sm border border-slate-300 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-800">{form.icon} {form.singular} {selEl.code}</p>
                <p className="text-[11px] text-slate-500">{selEl.location || 'Sin ubicación'}{selEl.type === 'EXTINTOR' ? ` · ${[selEl.data?.tipo, selEl.data?.capacidad && `${selEl.data.capacidad} kg`].filter(Boolean).join(' ')}` : ''}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[12px]"><span className={`inline-block w-2.5 h-2.5 rounded-full mr-1 ${STATUS[st].dot}`} />{STATUS[st].label}{lc ? ` · último control ${fmtDate(lc.control_date)}` : ' · nunca controlado'}{lc?.issues ? ` · ${lc.issues} obs.` : ''}</p>
            {form.fields.filter(f => f.expiry && selEl.data?.[f.k]).map(f => (
              <p key={f.k} className="text-[11px] text-slate-600">{f.label}: {fmtDate(selEl.data[f.k])}</p>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => onControl(selEl)} className="text-xs font-bold bg-slate-900 text-white rounded-lg px-3 py-2">Controlar</button>
              <button onClick={() => onEdit(selEl)} className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2">Editar datos</button>
              <button onClick={() => { setPlacing(selEl); setSelected(null); }} className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Mover en el plano</button>
            </div>
          </section>
        );
      })()}

      {selSym && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-300 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-800">{BASE_FORMS[selSym.type].icon} Símbolo {selSym.label} del plano</p>
              <p className="text-[11px] text-slate-500">{BASE_FORMS[selSym.type].singular}{selSym.cap ? ` · ${selSym.cap === 'CO2' ? 'CO2' : `PQS ${selSym.cap} kg`}` : ''} · todavía no está cargado en la app.</p>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onCreate({ type: selSym.type, data: { ...symbolDefaults(selSym), plan: { sym: selSym.id, x: selSym.x, y: selSym.y } } })}
              className="text-xs font-bold bg-amber-600 text-white rounded-lg px-3 py-2">Dar de alta este {BASE_FORMS[selSym.type].singular.toLowerCase()}</button>
          </div>
          {candidates.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">…o vincularlo a uno ya cargado:</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {candidates.map(e => (
                  <button key={e.id} onClick={() => { onSavePlanPos(e, { sym: selSym.id, x: selSym.x, y: selSym.y }); setSelected({ kind: 'el', id: e.id }); }}
                    className="text-[11px] font-semibold border border-slate-300 rounded-full px-2.5 py-1">{e.code || BASE_FORMS[e.type].singular}{e.location ? ` · ${e.location}` : ''}</button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {unplaced.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cargados pero sin ubicar en el plano ({unplaced.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {unplaced.map(e => (
              <button key={e.id} onClick={() => { setPlacing(e); setSelected(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-[11px] font-semibold border border-slate-300 rounded-full px-2.5 py-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {BASE_FORMS[e.type].icon} {e.code || BASE_FORMS[e.type].singular}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
