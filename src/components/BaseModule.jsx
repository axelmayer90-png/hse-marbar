import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Warehouse, Plus, ArrowLeft, Pencil, FileDown, CheckCheck, AlertTriangle, CalendarClock, Users, Trash2, WifiOff,
} from 'lucide-react';
import {
  BASES, BASE_FORMS, FORM_ORDER, scaleItems, countIssues, daysUntil, fmtDate, MONTHS,
} from '../lib/baseForms.js';
import { buildBasePdf } from '../lib/basePdf.js';
import { BASE_PLANS } from '../lib/basePlans.js';
import BasePlanView from './BasePlanView';

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const monthKey = (iso) => (iso || '').slice(0, 7);
const lc = (s) => (s === s.toUpperCase() ? s : s.charAt(0).toLowerCase() + s.slice(1)).replace('(dea)', '(DEA)');
const KIND_ON = { ok: 'bg-emerald-600 text-white border-emerald-600', bad: 'bg-red-600 text-white border-red-600', na: 'bg-slate-500 text-white border-slate-500' };

const blobToDataURL = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });

const expiryBadge = (days) => {
  if (days === null) return null;
  if (days < 0) return { cls: 'bg-red-100 text-red-800 border-red-300', text: `Vencido hace ${-days} d` };
  if (days <= 30) return { cls: 'bg-amber-100 text-amber-800 border-amber-300', text: `Vence en ${days} d` };
  if (days <= 60) return { cls: 'bg-yellow-50 text-yellow-800 border-yellow-200', text: `Vence en ${days} d` };
  return null;
};

export default function BaseModule({ supabase, session, currentUserProfile, isAdmin, profiles, onProfilesChanged }) {
  const userName = currentUserProfile?.full_name || session?.user?.email || '';
  const myBase = currentUserProfile?.base || '';
  const [base, setBase] = useState(isAdmin ? (myBase || BASES[0]) : myBase);
  const [tab, setTab] = useState('tablero');
  const [elements, setElements] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState('');
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [editingEl, setEditingEl] = useState(null); // {..element} o {type, isNew}
  const [controlFor, setControlFor] = useState(null); // elemento a controlar
  const [histType, setHistType] = useState('EXTINTOR');
  const [histPeriod, setHistPeriod] = useState(monthKey(todayISO()));
  const [busy, setBusy] = useState('');

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(); since.setMonth(since.getMonth() - 14);
    const sinceISO = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-01`;
    let qe = supabase.from('base_elements').select('*').order('created_at');
    let qc = supabase.from('base_controls').select('*').gte('control_date', sinceISO).order('control_date', { ascending: false });
    if (!isAdmin) { qe = qe.eq('base', myBase); qc = qc.eq('base', myBase); }
    const [re, rc] = await Promise.all([qe, qc]);
    if (re.error || rc.error) {
      setDbError((re.error || rc.error).message || 'Error');
    } else {
      setDbError('');
      setElements(re.data || []);
      setControls(rc.data || []);
    }
    setLoading(false);
  }, [supabase, isAdmin, myBase]);

  useEffect(() => { load(); }, [load]);

  const baseElements = useMemo(() => elements.filter(e => e.base === base && e.active !== false), [elements, base]);
  const baseControls = useMemo(() => controls.filter(c => c.base === base), [controls, base]);
  const thisMonth = monthKey(todayISO());

  const lastControl = useCallback((elId) => controls.find(c => c.element_id === elId), [controls]); // ya vienen ordenados desc

  // ---------- Resumen por base (para el administrador) ----------
  const summaryFor = useCallback((b) => {
    const els = elements.filter(e => e.base === b && e.active !== false);
    const done = els.filter(e => controls.some(c => c.element_id === e.id && monthKey(c.control_date) === thisMonth)).length;
    const issues = els.filter(e => (lastControl(e.id)?.issues || 0) > 0).length;
    return { total: els.length, done, issues };
  }, [elements, controls, thisMonth, lastControl]);

  // ---------- Vencimientos ----------
  const expiries = useMemo(() => {
    const out = [];
    baseElements.forEach(e => {
      const form = BASE_FORMS[e.type];
      if (!form) return;
      form.fields.filter(f => f.expiry).forEach(f => {
        const v = e.data?.[f.k];
        const d = daysUntil(v);
        if (d !== null && d <= 60) out.push({ e, form, label: f.label, value: v, days: d });
      });
      if (form.supplies) {
        const lc = lastControl(e.id);
        form.supplies.forEach(s => {
          const v = lc?.answers?.supplies?.[s.k]?.fv;
          const d = daysUntil(v);
          if (d !== null && d <= 60) out.push({ e, form, label: s.label, value: v, days: d });
        });
      }
    });
    return out.sort((a, b) => a.days - b.days);
  }, [baseElements, lastControl]);

  // ---------- Guardar elemento ----------
  const saveElement = async (el) => {
    const payload = { base: el.base || base, type: el.type, code: el.code || '', location: el.location || '', data: el.data || {}, active: el.active !== false, updated_at: new Date().toISOString() };
    const q = el.id ? supabase.from('base_elements').update(payload).eq('id', el.id) : supabase.from('base_elements').insert(payload);
    const { error } = await q;
    if (error) { alert('No se pudo guardar: ' + error.message); return false; }
    await load();
    return true;
  };

  // ---------- Guardar control ----------
  const saveControl = async (el, ctl, newData) => {
    const form = BASE_FORMS[el.type];
    const dataChanged = newData && JSON.stringify(newData) !== JSON.stringify(el.data || {});
    if (dataChanged) {
      const { error } = await supabase.from('base_elements').update({ data: newData, updated_at: new Date().toISOString() }).eq('id', el.id);
      if (error) { alert('No se pudo actualizar el elemento: ' + error.message); return false; }
    }
    const payload = {
      element_id: el.id, base: el.base, type: el.type,
      control_date: ctl.date, responsible: ctl.responsible, answers: ctl.answers,
      element_snapshot: { code: el.code, location: el.location, data: newData || el.data || {} },
      observations: ctl.observations || '', issues: countIssues(form, ctl.answers),
      created_by_name: userName,
    };
    const { error } = await supabase.from('base_controls').insert(payload);
    if (error) { alert('No se pudo guardar el control: ' + error.message); return false; }
    await load();
    return true;
  };

  const markReviewed = async (c) => {
    const { error } = await supabase.from('base_controls').update({ reviewed_by_name: userName, reviewed_at: new Date().toISOString() }).eq('id', c.id);
    if (error) alert(error.message); else load();
  };
  const deleteControl = async (c) => {
    if (!window.confirm('¿Eliminar este control?')) return;
    const { error } = await supabase.from('base_controls').delete().eq('id', c.id);
    if (error) alert(error.message); else load();
  };

  // ---------- PDF ----------
  const downloadPdf = async () => {
    const form = BASE_FORMS[histType];
    const perMonth = form.layout === 'monthlyTable' || form.layout === 'single';
    const [y, m] = histPeriod.split('-').map(Number);
    const period = perMonth ? { year: y, month: m } : { year: y };
    const inPeriod = (c) => (perMonth ? monthKey(c.control_date) === histPeriod : (c.control_date || '').startsWith(String(y)));
    setBusy('Generando PDF…');
    try {
      let logo = null;
      try { logo = await blobToDataURL(await (await fetch('/marbar-logo.jpg')).blob()); } catch { /* sin logo */ }
      // Para el PDF anual se buscan todos los controles del año (puede exceder lo cargado en pantalla)
      let list = baseControls.filter(c => c.type === histType && inPeriod(c));
      if (!perMonth) {
        const { data } = await supabase.from('base_controls').select('*').eq('base', base).eq('type', histType)
          .gte('control_date', `${y}-01-01`).lte('control_date', `${y}-12-31`);
        if (data) list = data;
      }
      const els = elements.filter(e => e.base === base && e.type === histType && (e.active !== false || list.some(c => c.element_id === e.id)));
      const doc = buildBasePdf({ form, base, period, elements: els, controls: list, logo });
      const per = perMonth ? `${MONTHS[m - 1]} ${y}` : `${y}`;
      doc.save(`${form.code} ${form.title} - Base ${base} - ${per}.pdf`.normalize('NFD').replace(/[̀-ͯ]/g, ''));
    } catch (e) {
      alert('No se pudo generar el PDF: ' + (e?.message || e));
    } finally {
      setBusy('');
    }
  };

  // ======================= UI =======================
  const card = 'bg-white rounded-xl shadow-sm border border-slate-200';
  const input = 'w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none';
  const label = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1';

  if (!isAdmin && !myBase) {
    return (
      <div className={`${card} p-6 text-center text-sm text-slate-600`}>
        <Warehouse className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        Tu usuario todavía no tiene una base asignada. Pedile al administrador que te asigne una.
      </div>
    );
  }

  if (dbError) {
    return (
      <div className={`${card} p-5 text-sm`}>
        <p className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> No se pudieron leer los datos de bases.</p>
        <p className="text-slate-600 mt-1">{!online ? 'Sin conexión: este módulo necesita señal para guardar y consultar.' : `Si es la primera vez, falta correr el archivo supabase_base.sql en Supabase. (${dbError})`}</p>
        <button onClick={load} className="mt-3 text-sm font-semibold text-amber-700">Reintentar</button>
      </div>
    );
  }

  // ---------- Pantalla: control ----------
  if (controlFor) {
    return (
      <ControlForm
        el={controlFor}
        userName={userName}
        last={lastControl(controlFor.id)}
        onCancel={() => setControlFor(null)}
        onSave={async (ctl, newData) => { const ok = await saveControl(controlFor, ctl, newData); if (ok) { setControlFor(null); window.scrollTo({ top: 0 }); } }}
        card={card} input={input} label={label}
      />
    );
  }

  // ---------- Pantalla: alta / edición de elemento ----------
  if (editingEl) {
    return (
      <ElementForm
        el={editingEl}
        onCancel={() => setEditingEl(null)}
        onSave={async (el) => { const ok = await saveElement(el); if (ok) setEditingEl(null); }}
        card={card} input={input} label={label}
      />
    );
  }

  const tabs = [
    { k: 'tablero', l: 'Tablero' },
    { k: 'plano', l: 'Plano' },
    { k: 'elementos', l: 'Elementos' },
    { k: 'historial', l: 'Historial y PDF' },
    ...(isAdmin ? [{ k: 'usuarios', l: 'Usuarios' }] : []),
  ];

  const pendingReview = isAdmin ? baseControls.filter(c => !c.reviewed_by_name) : [];
  const withIssues = baseElements.map(e => ({ e, c: lastControl(e.id) })).filter(x => x.c && x.c.issues > 0);

  return (
    <div className="space-y-4">
      {busy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center">
          <div className="bg-white rounded-xl px-5 py-4 text-sm font-semibold shadow-lg">{busy}</div>
        </div>
      )}

      <section className={`${card} p-4 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-600" /> {isAdmin ? 'Bases' : `Base ${base}`}
          </h2>
          {!online && <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700"><WifiOff className="w-3 h-3" /> Sin conexión</span>}
        </div>
        {isAdmin && (
          <div className="grid grid-cols-3 gap-2">
            {BASES.map(b => {
              const s = summaryFor(b);
              return (
                <button key={b} onClick={() => setBase(b)}
                  className={`text-left rounded-lg border p-2.5 transition ${base === b ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 bg-white'}`}>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{b}</span>
                  <span className="block text-[11px] text-slate-500">{s.done}/{s.total} controlados</span>
                  {s.issues > 0 && <span className="block text-[11px] font-bold text-red-700">{s.issues} con observ.</span>}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`px-3 py-1.5 rounded-md whitespace-nowrap ${tab === t.k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t.l}</button>
          ))}
        </div>
      </section>

      {loading && !elements.length && <p className="text-sm text-slate-500 px-1">Cargando…</p>}

      {/* ===== TABLERO ===== */}
      {tab === 'tablero' && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FORM_ORDER.map(t => {
              const form = BASE_FORMS[t];
              const els = baseElements.filter(e => e.type === t);
              const done = els.filter(e => baseControls.some(c => c.element_id === e.id && monthKey(c.control_date) === thisMonth));
              const pending = els.filter(e => !done.includes(e));
              const issues = els.filter(e => (lastControl(e.id)?.issues || 0) > 0).length;
              return (
                <div key={t} className={`${card} p-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{form.icon} {form.plural}</p>
                      <p className="text-[11px] text-slate-500">{form.code} · {MONTHS[new Date().getMonth()]}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${!els.length ? 'bg-slate-100 text-slate-500' : pending.length ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {els.length ? `${done.length}/${els.length}` : 'Sin cargar'}
                    </span>
                  </div>
                  {issues > 0 && <p className="text-[11px] font-bold text-red-700 mt-1">{issues} con ítems en mal estado / falta</p>}
                  {pending.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {pending.slice(0, 6).map(e => (
                        <button key={e.id} onClick={() => setControlFor(e)} className="text-[11px] font-semibold bg-slate-900 text-white rounded-full px-2.5 py-1">
                          Controlar {e.code || form.singular}
                        </button>
                      ))}
                      {pending.length > 6 && <button onClick={() => setTab('elementos')} className="text-[11px] font-semibold text-slate-600 px-2 py-1">+{pending.length - 6} más</button>}
                    </div>
                  )}
                  {!els.length && (
                    <button onClick={() => setEditingEl({ type: t, base, data: {}, isNew: true })} className="mt-2 text-xs font-semibold text-amber-700 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Cargar {lc(form.singular)}</button>
                  )}
                </div>
              );
            })}
          </section>

          <section className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CalendarClock className="w-4 h-4" /> Vencimientos próximos (60 días)</h3>
            {!expiries.length && <p className="text-sm text-slate-400 italic">Nada vence en los próximos 60 días.</p>}
            <div className="divide-y divide-slate-100">
              {expiries.map((x, i) => {
                const b = expiryBadge(x.days);
                return (
                  <div key={i} className="py-2 flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0">
                      <span className="font-semibold text-slate-800">{x.form.icon} {x.e.code || x.form.singular}</span>
                      <span className="text-slate-500"> · {x.label}: {fmtDate(x.value)}</span>
                      {x.e.location && <span className="block text-[11px] text-slate-400">{x.e.location}</span>}
                    </span>
                    {b && <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${b.cls}`}>{b.text}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          {withIssues.length > 0 && (
            <section className={`${card} p-4`}>
              <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Elementos con observaciones (último control)</h3>
              <div className="divide-y divide-slate-100">
                {withIssues.map(({ e, c }) => {
                  const form = BASE_FORMS[e.type];
                  const bad = new Set(form.scale.filter(s => s.kind === 'bad').map(s => s.k));
                  const items = scaleItems(form).filter(it => bad.has(c.answers?.[it.k])).map(it => `${it.label}: ${form.scale.find(s => s.k === c.answers[it.k]).name}`);
                  if (form.supplies) form.supplies.forEach(s => { const a = c.answers?.supplies?.[s.k]; if (a && a.ce !== '' && a.ce !== undefined && Number(a.ce) < parseFloat(s.qty)) items.push(`${s.label}: ${a.ce}/${s.qty}`); });
                  return (
                    <div key={e.id} className="py-2 text-sm">
                      <span className="font-semibold text-slate-800">{form.icon} {e.code || form.singular}</span>
                      <span className="text-[11px] text-slate-500"> · {fmtDate(c.control_date)}</span>
                      <p className="text-[12px] text-red-800">{items.join(' · ')}</p>
                      {c.observations && <p className="text-[11px] text-slate-500">{c.observations}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {isAdmin && pendingReview.length > 0 && (
            <section className={`${card} p-4`}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCheck className="w-4 h-4" /> Controles sin revisar ({pendingReview.length})</h3>
              <div className="divide-y divide-slate-100">
                {pendingReview.slice(0, 15).map(c => {
                  const form = BASE_FORMS[c.type];
                  return (
                    <div key={c.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0">
                        <span className="font-semibold">{form?.icon} {c.element_snapshot?.code || form?.singular}</span>
                        <span className="text-[11px] text-slate-500"> · {fmtDate(c.control_date)} · {c.responsible}</span>
                        {c.issues > 0 && <span className="text-[11px] font-bold text-red-700"> · {c.issues} obs.</span>}
                      </span>
                      <button onClick={() => markReviewed(c)} className="shrink-0 text-xs font-bold text-emerald-700 border border-emerald-300 rounded-lg px-2.5 py-1">Revisado</button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* ===== PLANO ===== */}
      {tab === 'plano' && (BASE_PLANS[base] ? (
        <BasePlanView
          plan={BASE_PLANS[base]}
          elements={baseElements}
          lastControl={lastControl}
          thisMonth={thisMonth}
          onControl={(e) => setControlFor(e)}
          onEdit={(e) => setEditingEl({ ...e })}
          onCreate={(x) => setEditingEl({ ...x, base, code: '', location: '', isNew: true })}
          onSavePlanPos={(e, pos) => saveElement({ ...e, data: { ...(e.data || {}), plan: { ...(e.data?.plan || {}), ...pos } } })}
        />
      ) : (
        <section className={`${card} p-5 text-sm text-slate-600`}>
          Todavía no hay un plano cargado para la base {base}. Cuando tengas el plano de evacuación de esta base, se agrega igual que el de Neuquén.
        </section>
      ))}

      {/* ===== ELEMENTOS ===== */}
      {tab === 'elementos' && FORM_ORDER.map(t => {
        const form = BASE_FORMS[t];
        const els = baseElements.filter(e => e.type === t)
          .sort((a, b) => (Number(a.data?.puesto) || 999) - (Number(b.data?.puesto) || 999) || String(a.code).localeCompare(String(b.code), 'es', { numeric: true }));
        return (
          <section key={t} className={`${card} p-4`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-slate-800">{form.icon} {form.plural} <span className="text-[11px] font-normal text-slate-400">{form.code}</span></h3>
              <button onClick={() => setEditingEl({ type: t, base, data: {}, isNew: true })} className="flex items-center gap-1 text-xs font-semibold text-amber-700"><Plus className="w-3.5 h-3.5" /> Agregar</button>
            </div>
            {!els.length && <p className="text-sm text-slate-400 italic">Sin {lc(form.plural)} cargados.</p>}
            <div className="divide-y divide-slate-100">
              {els.map(e => {
                const lc = lastControl(e.id);
                const doneMonth = lc && monthKey(lc.control_date) === thisMonth;
                const exp = form.fields.filter(f => f.expiry).map(f => ({ f, b: expiryBadge(daysUntil(e.data?.[f.k])) })).filter(x => x.b);
                return (
                  <div key={e.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {form.type === 'EXTINTOR' && e.data?.puesto ? `Puesto ${e.data.puesto} · ` : ''}{e.code || form.singular}
                        {form.type === 'EXTINTOR' && <span className="text-[11px] font-normal text-slate-500"> · {[e.data?.tipo, e.data?.clase, e.data?.capacidad && `${e.data.capacidad} kg`].filter(Boolean).join(' ')}</span>}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{e.location || 'Sin ubicación'}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${doneMonth ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {lc ? `Último: ${fmtDate(lc.control_date)}` : 'Nunca controlado'}{lc?.issues ? ` · ${lc.issues} obs.` : ''}
                        </span>
                        {exp.map(({ f, b }) => <span key={f.k} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${b.cls}`}>{f.label}: {b.text}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingEl({ ...e })} className="p-2 text-slate-400 hover:text-slate-700" title="Editar"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setControlFor(e)} className="text-xs font-bold bg-slate-900 text-white rounded-lg px-3 py-2">Controlar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ===== HISTORIAL ===== */}
      {tab === 'historial' && (() => {
        const form = BASE_FORMS[histType];
        const perMonth = form.layout === 'monthlyTable' || form.layout === 'single';
        const y = histPeriod.slice(0, 4);
        const list = baseControls.filter(c => c.type === histType && (perMonth ? monthKey(c.control_date) === histPeriod : (c.control_date || '').startsWith(y)));
        return (
          <section className={`${card} p-4 space-y-3`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className={label}>Registro</span>
                <select className={input} value={histType} onChange={e => setHistType(e.target.value)}>
                  {FORM_ORDER.map(t => <option key={t} value={t}>{BASE_FORMS[t].code} · {BASE_FORMS[t].plural}</option>)}
                </select>
              </div>
              <div>
                <span className={label}>{perMonth ? 'Mes' : 'Año (planilla anual por elemento)'}</span>
                {perMonth ? (
                  <input type="month" className={input} value={histPeriod} onChange={e => setHistPeriod(e.target.value || histPeriod)} />
                ) : (
                  <select className={input} value={y} onChange={e => setHistPeriod(`${e.target.value}-01`)}>
                    {[0, 1, 2].map(k => { const yy = new Date().getFullYear() - k; return <option key={yy} value={yy}>{yy}</option>; })}
                  </select>
                )}
              </div>
            </div>
            <button onClick={downloadPdf} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg">
              <FileDown className="w-4 h-4" /> Descargar PDF {form.code}
            </button>
            <div className="divide-y divide-slate-100">
              {!list.length && <p className="text-sm text-slate-400 italic py-2">Sin controles en el período.</p>}
              {list.map(c => (
                <div key={c.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold text-slate-800">{c.element_snapshot?.code || form.singular}</span>
                    <span className="text-[11px] text-slate-500"> · {fmtDate(c.control_date)} · {c.responsible}</span>
                    {c.issues > 0 && <span className="text-[11px] font-bold text-red-700"> · {c.issues} obs.</span>}
                    <span className="block text-[11px] text-slate-400">{c.reviewed_by_name ? `Revisó: ${c.reviewed_by_name} (${fmtDate(c.reviewed_at)})` : 'Sin revisar'}</span>
                  </span>
                  {isAdmin && (
                    <span className="flex items-center gap-1 shrink-0">
                      {!c.reviewed_by_name && <button onClick={() => markReviewed(c)} className="text-xs font-bold text-emerald-700 border border-emerald-300 rounded-lg px-2 py-1">Revisado</button>}
                      <button onClick={() => deleteControl(c)} className="p-1.5 text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ===== USUARIOS (admin) ===== */}
      {tab === 'usuarios' && isAdmin && (
        <UsersPanel supabase={supabase} profiles={profiles} onChanged={onProfilesChanged} card={card} input={input} />
      )}
    </div>
  );
}

// ======================= Alta / edición de elemento =======================
function ElementForm({ el, onCancel, onSave, card, input, label }) {
  const form = BASE_FORMS[el.type];
  const [draft, setDraft] = useState({ ...el, data: { ...(el.data || {}) } });
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const setData = (k, v) => setDraft(d => ({ ...d, data: { ...d.data, [k]: v } }));
  return (
    <div className="space-y-3">
      <button onClick={onCancel} className="flex items-center gap-1 text-sm font-semibold text-slate-600 px-1"><ArrowLeft className="w-4 h-4" /> Volver</button>
      <section className={`${card} p-4 space-y-3`}>
        <h2 className="text-base font-bold text-slate-800">{form.icon} {el.isNew ? `Nuevo: ${form.singular}` : `${form.singular} ${el.code || ''}`}</h2>
        <p className="text-[11px] text-slate-500">Base {draft.base} · {form.code}. Estos datos se cargan una sola vez y aparecen en cada control.</p>
        {draft.data?.plan && <p className="text-[11px] font-semibold text-emerald-700">📍 Ubicado en el plano de la base{draft.data.plan.sym ? ` (símbolo ${draft.data.plan.sym.split('-').pop()})` : ''}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><span className={label}>{form.codeLabel}</span><input className={input} value={draft.code || ''} onChange={e => set('code', e.target.value)} /></div>
          <div><span className={label}>{form.locationLabel}</span><input className={input} value={draft.location || ''} onChange={e => set('location', e.target.value)} /></div>
          {form.fields.map(f => (
            <div key={f.k}>
              <span className={label}>{f.label}</span>
              <input className={input} type={f.input === 'month' ? 'month' : f.input === 'date' ? 'date' : f.input === 'number' ? 'number' : 'text'}
                placeholder={f.placeholder || ''} value={draft.data[f.k] || ''} onChange={e => setData(f.k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={() => onSave(draft)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg">Guardar</button>
          {!el.isNew && (
            <button onClick={() => { if (window.confirm('¿Dar de baja este elemento? Deja de aparecer en los controles; su historial se conserva.')) onSave({ ...draft, active: false }); }}
              className="text-sm font-semibold text-red-700 border border-red-200 rounded-lg py-2.5 px-4">Dar de baja</button>
          )}
        </div>
      </section>
    </div>
  );
}

// ======================= Formulario de control =======================
function ControlForm({ el, userName, last, onCancel, onSave, card, input, label }) {
  const form = BASE_FORMS[el.type];
  const [date, setDate] = useState(todayISO());
  const [responsible, setResponsible] = useState(userName);
  const [answers, setAnswers] = useState(() => {
    if (!form.supplies) return {};
    // Botiquín: propone las cantidades y vencimientos del control anterior
    const prev = last?.answers?.supplies || {};
    return { supplies: Object.fromEntries(form.supplies.map(s => [s.k, { ce: prev[s.k]?.ce ?? '', fv: prev[s.k]?.fv || '' }])) };
  });
  const [data, setData] = useState({ ...(el.data || {}) });
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);

  const items = scaleItems(form);
  const okKey = form.scale.find(s => s.kind === 'ok').k;
  const answered = items.filter(i => answers[i.k]).length;

  const setA = (k, v) => setAnswers(a => ({ ...a, [k]: a[k] === v ? '' : v }));
  const setSupply = (k, field, v) => setAnswers(a => ({ ...a, supplies: { ...a.supplies, [k]: { ...a.supplies[k], [field]: v } } }));

  const submit = async () => {
    if (answered < items.length && !window.confirm(`Quedan ${items.length - answered} ítems sin marcar. ¿Guardar igual?`)) return;
    setSaving(true);
    await onSave({ date, responsible, answers, observations }, form.fields.length ? data : null);
    setSaving(false);
  };

  const renderItem = (it) => (
    <div key={it.k} className={`py-2.5 ${form.scale.find(s => s.k === answers[it.k])?.kind === 'bad' ? 'bg-red-50/60 -mx-3 px-3' : ''}`}>
      <p className="text-[13px] text-slate-800">{it.label}{it.qty ? <span className="text-[11px] text-slate-400"> · cant. {it.qty}</span> : ''}</p>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {form.scale.map(s => (
          <button key={s.k} onClick={() => setA(it.k, s.k)} title={s.name}
            className={`min-w-[48px] text-xs font-bold py-2 px-2.5 rounded-lg border active:scale-95 ${answers[it.k] === s.k ? KIND_ON[s.kind] : 'bg-white text-slate-600 border-slate-300'}`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <button onClick={onCancel} className="flex items-center gap-1 text-sm font-semibold text-slate-600 px-1"><ArrowLeft className="w-4 h-4" /> Volver</button>
      <section className={`${card} p-4 space-y-3`}>
        <div>
          <h2 className="text-base font-bold text-slate-800">{form.icon} Control · {form.singular} {el.code}</h2>
          <p className="text-[11px] text-slate-500">{form.code} · Base {el.base}{el.location ? ` · ${el.location}` : ''}{last ? ` · Último control: ${fmtDate(last.control_date)}` : ''}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><span className={label}>Fecha de control</span><input type="date" className={input} value={date} onChange={e => setDate(e.target.value || todayISO())} /></div>
          <div><span className={label}>Responsable</span><input className={input} value={responsible} onChange={e => setResponsible(e.target.value)} /></div>
        </div>
        {form.fields.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Datos del equipo (si cambió algo, por ej. una recarga, actualizalo acá)</p>
            <div className="grid grid-cols-2 gap-2">
              {form.fields.map(f => (
                <div key={f.k}>
                  <span className="block text-[10px] font-semibold text-slate-500 mb-0.5">{f.label}</span>
                  <input className={`${input} py-1.5`} type={f.input === 'month' ? 'month' : f.input === 'date' ? 'date' : f.input === 'number' ? 'number' : 'text'}
                    value={data[f.k] || ''} onChange={e => setData(d => ({ ...d, [f.k]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {form.supplies && (
        <section className={`${card} p-4`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-800">Descripción de los elementos</h3>
            <button onClick={() => setAnswers(a => ({ ...a, supplies: Object.fromEntries(form.supplies.map(s => [s.k, { ...a.supplies[s.k], ce: a.supplies[s.k]?.ce === '' || a.supplies[s.k]?.ce === undefined ? s.qty : a.supplies[s.k].ce }])) }))}
              className="text-[11px] font-semibold border border-emerald-300 text-emerald-800 bg-emerald-50 rounded-full px-2.5 py-1 shrink-0">Resto completo</button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">CE: cantidad existente · FV: fecha de vencimiento (si corresponde).</p>
          <div className="divide-y divide-slate-100">
            {form.supplies.map(s => {
              const a = answers.supplies[s.k] || {};
              const low = a.ce !== '' && a.ce !== undefined && Number(a.ce) < parseFloat(s.qty);
              return (
                <div key={s.k} className={`py-2 ${low ? 'bg-red-50/60 -mx-3 px-3' : ''}`}>
                  <p className="text-[13px] text-slate-800">{s.label} <span className="text-[11px] text-slate-400">· requerido {s.qty}</span></p>
                  <div className="grid grid-cols-[80px_1fr] gap-2 mt-1">
                    <input type="number" min="0" inputMode="numeric" className={`${input} py-1.5`} placeholder="CE" value={a.ce ?? ''} onChange={e => setSupply(s.k, 'ce', e.target.value)} />
                    <input type="date" className={`${input} py-1.5`} value={a.fv || ''} onChange={e => setSupply(s.k, 'fv', e.target.value)} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(form.checks.length > 0 || form.groups) && (
        <section className={`${card} p-4`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-800">Control y revisión <span className="text-[11px] font-normal text-slate-400">{answered}/{items.length}</span></h3>
            <button onClick={() => setAnswers(a => ({ ...a, ...Object.fromEntries(items.filter(i => !a[i.k]).map(i => [i.k, okKey])) }))}
              className="text-[11px] font-semibold border border-emerald-300 text-emerald-800 bg-emerald-50 rounded-full px-2.5 py-1">Resto en {form.scale[0].label}</button>
          </div>
          <div className="divide-y divide-slate-100">
            {form.checks.map(it => (it.input === 'date' ? (
              <div key={it.k} className="py-2.5">
                <p className="text-[13px] text-slate-800">{it.label}</p>
                <input type="date" className={`${input} mt-1.5 py-1.5`} value={answers[it.k] || ''} onChange={e => setAnswers(a => ({ ...a, [it.k]: e.target.value }))} />
              </div>
            ) : renderItem(it)))}
          </div>
          {(form.groups || []).map(g => (
            <div key={g.title} className="mt-3">
              <p className="text-[11px] font-bold text-white bg-slate-800 rounded px-2 py-1 uppercase">{g.title}</p>
              <div className="divide-y divide-slate-100">{g.items.map(renderItem)}</div>
            </div>
          ))}
        </section>
      )}

      <section className={`${card} p-4`}>
        <span className={label}>Observaciones</span>
        <textarea className={input} rows={3} maxLength={1000} placeholder={form.obsHint || 'Detalle de lo observado, reemplazos gestionados, etc.'}
          value={observations} onChange={e => setObservations(e.target.value)} />
      </section>

      <button onClick={submit} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-base py-3 rounded-xl">
        {saving ? 'Guardando…' : 'Guardar control'}
      </button>
    </div>
  );
}

// ======================= Usuarios de base (admin) =======================
function UsersPanel({ supabase, profiles, onChanged, card, input }) {
  const [saving, setSaving] = useState('');
  const update = async (p, role, base) => {
    setSaving(p.id);
    const { error } = await supabase.from('profiles').update({ role, base: role === 'base' ? base : null }).eq('id', p.id);
    setSaving('');
    if (error) alert('No se pudo actualizar: ' + error.message);
    else onChanged && onChanged();
  };
  const list = (profiles || []).filter(p => p.role !== 'admin');
  return (
    <section className={`${card} p-4`}>
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Users className="w-4 h-4" /> Usuarios de base</h3>
      <p className="text-[11px] text-slate-500 mb-3">El usuario se registra normalmente en la app; acá le asignás la base. Un usuario de base solo ve el apartado de su base.</p>
      <div className="divide-y divide-slate-100">
        {list.map(p => (
          <div key={p.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">{p.full_name || p.email}</span>
              <span className="text-[11px] text-slate-500">{p.email} · {p.role === 'base' ? `Base ${p.base || '—'}` : (p.role || 'inspector')}</span>
            </span>
            <select className={`${input} w-auto py-1.5`} disabled={saving === p.id}
              value={p.role === 'base' ? `base:${p.base || ''}` : 'inspector'}
              onChange={e => { const v = e.target.value; if (v === 'inspector') update(p, 'inspector', null); else update(p, 'base', v.split(':')[1]); }}>
              <option value="inspector">Inspector (equipos)</option>
              {BASES.map(b => <option key={b} value={`base:${b}`}>Usuario de base · {b}</option>)}
            </select>
          </div>
        ))}
        {!list.length && <p className="text-sm text-slate-400 italic">No hay usuarios.</p>}
      </div>
    </section>
  );
}

