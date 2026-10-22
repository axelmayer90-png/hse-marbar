import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Plus, Trash2, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { checklistProgress, itemKey, unitsFor } from '../lib/checklistUtils';

const KIND_STYLE = {
  ok: { on: 'bg-emerald-600 text-white border-emerald-600', dot: 'bg-emerald-500' },
  bad: { on: 'bg-red-600 text-white border-red-600', dot: 'bg-red-500' },
  na: { on: 'bg-slate-500 text-white border-slate-500', dot: 'bg-slate-400' },
};

// Pantalla de carga de un checklist (RG.SSA.06 / RG.SSA.07) dentro de un informe
export default function ChecklistEditor({ cl, def, info, onChange, onBack, onSendToReport, obsNumberById, onRemove }) {
  const [open, setOpen] = useState(null); // id de sección abierta
  const [openComments, setOpenComments] = useState({});
  const kindOf = (v) => def.scale.find(s => s.k === v)?.kind;
  const okKey = def.scale.find(s => s.kind === 'ok').k;
  const naKey = def.scale.find(s => s.kind === 'na').k;
  const prog = checklistProgress(cl, def);

  const input = 'w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none';

  const setAnswer = (key, v) => onChange(c => {
    const a = c.answers[key] || {};
    c.answers[key] = { ...a, v: a.v === v ? '' : v };
    return c;
  });
  const setComment = (key, text) => onChange(c => {
    c.answers[key] = { ...(c.answers[key] || {}), c: text };
    return c;
  });

  const bulk = (section, unitId, value, onlyEmpty) => onChange(c => {
    section.items.forEach((_, i) => {
      const k = itemKey(section.id, unitId, i);
      const a = c.answers[k] || {};
      if (onlyEmpty && a.v) return;
      c.answers[k] = { ...a, v: value };
    });
    return c;
  });

  const addUnit = (section) => onChange(c => {
    const list = c.units[section.id] || [];
    if (list.length >= section.repeat.max) return c;
    c.units[section.id] = [...list, { id: `u${Date.now().toString(36)}`, name: '' }];
    return c;
  });
  const removeUnit = (section, unitId) => {
    if (!window.confirm(`¿Quitar esta unidad (${section.repeat.label}) y sus respuestas?`)) return;
    onChange(c => {
      c.units[section.id] = (c.units[section.id] || []).filter(u => u.id !== unitId);
      Object.keys(c.answers).forEach(k => { if (k.startsWith(`${section.id}:${unitId}:`)) delete c.answers[k]; });
      return c;
    });
  };
  const renameUnit = (section, unitId, name) => onChange(c => {
    const u = (c.units[section.id] || []).find(x => x.id === unitId);
    if (u) u.name = name;
    return c;
  });

  const renderItems = (section, unitId) => (
    <div className="divide-y divide-slate-100">
      {section.items.map((text, i) => {
        const k = itemKey(section.id, unitId, i);
        const a = cl.answers[k] || {};
        const kind = kindOf(a.v);
        const showComment = kind === 'bad' || openComments[k] || (a.c || '').length > 0;
        const linkedNum = a.obsId ? obsNumberById(a.obsId) : null;
        return (
          <div key={k} className={`py-2.5 ${kind === 'bad' ? 'bg-red-50/60 -mx-3 px-3' : ''}`}>
            <p className="text-[13px] leading-snug text-slate-800">{text}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {def.scale.map(s => (
                <button
                  key={s.k}
                  onClick={() => setAnswer(k, s.k)}
                  className={`min-w-[52px] text-xs font-bold py-2 px-2.5 rounded-lg border transition active:scale-95 ${a.v === s.k ? KIND_STYLE[s.kind].on : 'bg-white text-slate-600 border-slate-300'}`}
                  title={s.name}
                >
                  {s.label}
                </button>
              ))}
              {!showComment && (
                <button onClick={() => setOpenComments(o => ({ ...o, [k]: true }))} className="ml-auto p-2 text-slate-400 hover:text-slate-700" title="Agregar comentario">
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>
            {showComment && (
              <textarea
                className={`${input} mt-2 text-[13px]`}
                rows={2}
                maxLength={600}
                placeholder={kind === 'bad' ? `${def.commentLabel} (qué se observó)` : 'Comentario (opcional)'}
                value={a.c || ''}
                onChange={e => setComment(k, e.target.value)}
              />
            )}
            {kind === 'bad' && (
              linkedNum ? (
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En el informe como Obs. {linkedNum} (agregale fotos ahí)
                </span>
              ) : (
                <button
                  onClick={() => onSendToReport(cl.id, k)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 px-3 py-1.5 rounded-lg active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> Pasar al informe
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="sticky top-[60px] sm:top-[72px] z-10 bg-slate-100/95 backdrop-blur py-2 -mx-1 px-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex items-center justify-between gap-2">
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5">
            <ArrowLeft className="w-4 h-4" /> Volver al informe
          </button>
          <div className="text-right pr-1">
            <div className="text-xs font-bold text-slate-800">{prog.done}/{prog.total} ítems</div>
            <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-emerald-500" style={{ width: `${prog.total ? (prog.done / prog.total) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">{def.code} · {def.title}</h2>
            <p className="text-[11px] text-slate-500">{def.rev} · Se imprime como anexo del informe</p>
          </div>
          <button onClick={onRemove} className="p-1.5 text-slate-300 hover:text-red-600" title="Quitar checklist del informe"><Trash2 className="w-4 h-4" /></button>
        </div>
        <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2">
          Equipo <b>{info.equipo || '—'}</b> · Pozo <b>{info.pozo || '—'}</b> · Fecha <b>{info.fecha || '—'}</b> · Responsable <b>{info.responsable || '—'}</b>
          <span className="block text-slate-400">Se toman del informe.</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {def.headerFields.map(f => (
            <div key={f.k}>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{f.label}</span>
              <input className={input} value={cl.header[f.k] || ''} onChange={e => onChange(c => { c.header[f.k] = e.target.value; return c; })} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
          {def.scale.map(s => (
            <span key={s.k} className="inline-flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${KIND_STYLE[s.kind].dot}`} /> <b>{s.label}</b> {s.name} · {prog.count[s.k] || 0}</span>
          ))}
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-slate-400" /> Sin evaluar · {prog.total - prog.done}</span>
        </div>
      </section>

      {def.sections.map((section, si) => {
        const header = section.block && section.block !== def.sections[si - 1]?.block
          ? <h3 key={`b-${section.id}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 px-1">{section.block}</h3>
          : null;
        const sp = prog.bySection[section.id];
        const isOpen = open === section.id;
        const units = section.repeat ? unitsFor(cl, section) : [null];
        return (
          <React.Fragment key={section.id}>
            {header}
            <div id={`sec-${section.id}`} className={`bg-white rounded-xl shadow-sm border ${sp.bad ? 'border-red-300' : 'border-slate-200'} overflow-hidden`}>
              <button onClick={() => {
                setOpen(isOpen ? null : section.id);
                if (!isOpen) setTimeout(() => {
                  const el = document.getElementById(`sec-${section.id}`);
                  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: 'smooth' });
                }, 50);
              }} className="w-full flex items-center justify-between gap-2 p-3 text-left">
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-800">{section.label}</span>
                  <span className="text-[11px] text-slate-500">
                    {sp.done}/{sp.total} evaluados
                    {section.repeat ? ` · ${units.length} ${section.repeat.label.toLowerCase()}${units.length === 1 ? '' : 's'}` : ''}
                    {sp.bad ? <b className="text-red-700"> · {sp.bad} observado{sp.bad > 1 ? 's' : ''}</b> : ''}
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {sp.done === sp.total && sp.total > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 border-t border-slate-100">
                  {units.map((u, ui) => (
                    <div key={u ? u.id : 'single'} className={u ? 'mt-3 border border-slate-200 rounded-lg p-3' : ''}>
                      {u && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700 shrink-0">{section.repeat.label} {ui + 1}</span>
                          <input className={`${input} py-1.5`} placeholder="Ubicación / identificación" value={u.name}
                            onChange={e => renameUnit(section, u.id, e.target.value)} />
                          <button onClick={() => removeUnit(section, u.id)} className="p-1.5 text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 py-2">
                        <button onClick={() => bulk(section, u?.id, okKey, true)} className="text-[11px] font-semibold border border-emerald-300 text-emerald-800 bg-emerald-50 rounded-full px-2.5 py-1">
                          Resto en {def.scale.find(s => s.k === okKey).label}
                        </button>
                        <button onClick={() => bulk(section, u?.id, naKey, false)} className="text-[11px] font-semibold border border-slate-300 text-slate-700 bg-slate-50 rounded-full px-2.5 py-1">
                          {u ? 'Unidad' : 'Sección'} completa N/A
                        </button>
                      </div>
                      {renderItems(section, u?.id)}
                    </div>
                  ))}
                  {section.repeat && units.length < section.repeat.max && (
                    <button onClick={() => addUnit(section)} className="mt-3 w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 text-slate-600 font-semibold text-sm py-2 rounded-lg">
                      <Plus className="w-4 h-4" /> Agregar {section.repeat.label.toLowerCase()}
                    </button>
                  )}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {def.extras.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
          {def.extras.map(x => (
            <div key={x.k}>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{x.label}</span>
              <textarea className={input} rows={3} maxLength={1500} value={cl.extras[x.k] || ''}
                onChange={e => onChange(c => { c.extras[x.k] = e.target.value; return c; })} />
            </div>
          ))}
        </section>
      )}

      <button onClick={onBack} className="w-full bg-slate-900 text-white font-bold text-sm py-3 rounded-xl">Listo, volver al informe</button>
    </div>
  );
}
