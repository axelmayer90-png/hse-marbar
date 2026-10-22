import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Trash2, Camera, Image as ImageIcon, ArrowLeft, ArrowUp, ArrowDown,
  FileDown, Eye, Share2, CheckCircle2, AlertTriangle, WifiOff, Wifi, Cloud, CloudOff, X, Maximize, Minimize,
} from 'lucide-react';
import {
  listReports, getReport, saveReport, deleteReport, savePhoto, getPhoto, deletePhoto, newId,
} from '../lib/informeStore';
import { prepareSourcePhoto, renderFramedPhoto, blobToDataURL } from '../lib/imageTools';
import { buildInformeVisita } from '../lib/informePdf';

// ---------- Configuración ----------
const TIPOS = {
  DTM: {
    label: 'DTM',
    objetivo: (eq) => `Asistir, supervisar y controlar las actividades de DTM del equipo ${eq || '…'}, asegurando el cumplimiento de los requisitos de Seguridad, Salud y Ambiente, la correcta gestión y verificación de la documentación asociada, y la aplicación efectiva de los procedimientos y estándares establecidos por el cliente y la compañía.`,
  },
  RELEVAMIENTO: {
    label: 'Relevamiento técnico',
    objetivo: () => 'El presente informe tiene como objetivo establecer recomendaciones técnicas para llevar adelante mejoras sobre el equipamiento.',
  },
  INSPECCION: {
    label: 'Inspección',
    objetivo: (eq, sector) => `Verificar las condiciones de Seguridad, Salud y Ambiente del sector ${sector || '…'} del equipo ${eq || '…'}, identificando desvíos y oportunidades de mejora.`,
  },
  OTRO: { label: 'Otro', objetivo: () => '' },
};
const SECTORES = ['Control de Sólidos', 'Fluidos / Inyección', 'Locación general'];
const MAX_FOTOS = 4;

const todayDDMMYYYY = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const isoToDDMMYYYY = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
// Sin tildes en el nombre del archivo: algunos navegadores/celulares los descartan al descargar
const safeName = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();

const emptyObs = (aspecto = 'SSA') => ({
  id: newId(), aspecto, estado: 'CONFORME', texto: '', accion: '', accionResp: '', accionFecha: '', fotos: [],
});

const buildPlan = (r) => [
  ...(r.observaciones || [])
    .filter(o => o.estado === 'DESVIO' && (o.accion || '').trim())
    .map(o => ({ accion: o.accion.trim(), responsable: o.accionResp || '', fecha: isoToDDMMYYYY(o.accionFecha) })),
  ...(r.planExtra || [])
    .filter(p => (p.accion || '').trim())
    .map(p => ({ accion: p.accion.trim(), responsable: p.responsable || '', fecha: isoToDDMMYYYY(p.fecha) })),
];

const fileNameFor = (r) => {
  const tipo = r.tipo === 'DTM' ? 'DTM ' : '';
  const d = (r.info.fecha || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  const f = d ? `${d[1].padStart(2, '0')}-${d[2].padStart(2, '0')}-${d[3].slice(-2)}` : '';
  return safeName(`RG.SGI.27 Informe de visita técnica - ${tipo}${r.info.equipo || ''}${f ? ' - ' + f : ''}`) + '.pdf';
};

const ConnChip = ({ online }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
    {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
    {online ? 'Con conexión' : 'Sin conexión'}
  </span>
);

// ---------- Componente principal ----------
export default function InformesModule({ supabase, session, currentUserProfile, rigs, activeLocationMap, selectedRig, isBaseRig }) {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [reports, setReports] = useState([]);
  const [remote, setRemote] = useState(null); // null = no disponible
  const [editing, setEditing] = useState(null); // informe abierto
  const [thumbs, setThumbs] = useState({}); // photoId -> objectURL
  const [saveState, setSaveState] = useState('saved');
  const [busy, setBusy] = useState('');
  const [pdfResult, setPdfResult] = useState(null); // { url, file, name }
  const saveTimer = useRef(null);

  const userName = currentUserProfile?.full_name || session?.user?.email || '';

  // Estado de conexión
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    // Pedir al navegador que no borre los borradores por falta de espacio
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const refreshList = useCallback(async () => setReports(await listReports()), []);

  // Sincronizar (solo texto) los informes generados cuando hay señal
  const syncPending = useCallback(async () => {
    if (!navigator.onLine || !session) return;
    const all = await listReports();
    for (const r of all.filter(x => x.status === 'generado' && !x.synced)) {
      const plan = buildPlan(r);
      const payload = {
        id: r.id,
        report_code: 'RG.SGI.27',
        report_type: r.tipo,
        rig_id: r.info.rigId || null,
        location_id: r.info.locationId || null,
        equipo: r.info.equipo,
        locacion: r.info.locacion,
        pozo: r.info.pozo,
        visit_date_text: r.info.fecha,
        sector: r.info.sector,
        responsable: r.info.responsable,
        participantes: r.info.participantes,
        resumen: r.resumen,
        observaciones: (r.observaciones || []).map(o => ({
          aspecto: o.aspecto, estado: o.estado, texto: o.texto, accion: o.accion,
          fotos: (o.fotos || []).map(f => f.caption || ''),
        })),
        plan_acciones: plan,
        desvios_count: (r.observaciones || []).filter(o => o.estado === 'DESVIO').length,
        photos_count: (r.observaciones || []).reduce((n, o) => n + (o.fotos || []).length, 0),
        file_name: r.fileName,
        created_by: session.user.id,
        created_by_name: userName,
        generated_at: new Date(r.generatedAt || Date.now()).toISOString(),
      };
      const { error } = await supabase.from('visit_reports').upsert(payload);
      if (!error) await saveReport({ ...r, synced: true });
      else break; // tabla inexistente o sin señal: se reintenta más tarde
    }
    await refreshList();
  }, [session, supabase, userName, refreshList]);

  const loadRemote = useCallback(async () => {
    if (!navigator.onLine) return;
    const { data, error } = await supabase
      .from('visit_reports')
      .select('id, report_type, equipo, locacion, visit_date_text, responsable, desvios_count, photos_count, file_name, generated_at')
      .order('generated_at', { ascending: false })
      .limit(40);
    setRemote(error ? null : (data || []));
  }, [supabase]);

  useEffect(() => { refreshList(); syncPending().then(loadRemote); }, [refreshList, syncPending, loadRemote]);
  useEffect(() => { if (online) syncPending().then(loadRemote); }, [online, syncPending, loadRemote]);

  // Miniaturas
  const loadThumbs = async (r) => {
    const map = {};
    for (const o of r.observaciones || []) {
      for (const f of o.fotos || []) {
        const b = await getPhoto(f.id);
        if (b) map[f.id] = URL.createObjectURL(b);
      }
    }
    setThumbs(prev => { Object.values(prev).forEach(u => URL.revokeObjectURL(u)); return map; });
  };

  // Autoguardado
  const update = (fn) => {
    setEditing(prev => {
      const next = fn(structuredClone(prev));
      if (next.status === 'generado') { next.status = 'borrador'; next.synced = false; }
      setSaveState('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => { await saveReport(next); setSaveState('saved'); }, 500);
      return next;
    });
  };

  // ---------- Acciones ----------
  const createReport = async () => {
    const rigId = selectedRig && selectedRig !== 'ALL' ? selectedRig : '';
    const rig = (rigs || []).find(r => r.id === rigId);
    const loc = rig ? activeLocationMap[rig.id] : null;
    const r = {
      id: newId(), status: 'borrador', synced: false, createdAt: Date.now(), authorId: session?.user?.id,
      tipo: 'INSPECCION',
      info: {
        rigId: rig?.id || '', equipo: rig?.name || '', locationId: loc?.id || '', locacion: loc?.location_name || '',
        pozo: '', fecha: todayDDMMYYYY(), sector: 'Control de Sólidos', responsable: userName, participantes: '',
      },
      resumen: { objetivo: '', hallazgos: '', acciones: '', pendientes: '' },
      observaciones: [emptyObs('SSA')],
      planExtra: [],
    };
    r.resumen.objetivo = TIPOS[r.tipo].objetivo(r.info.equipo, r.info.sector);
    await saveReport(r);
    setThumbs({});
    setEditing(r);
    setSaveState('saved');
    window.scrollTo({ top: 0 });
  };

  const openReport = async (id) => {
    const r = await getReport(id);
    if (!r) return;
    await loadThumbs(r);
    setEditing(r);
    setSaveState('saved');
    window.scrollTo({ top: 0 });
  };

  const closeEditor = async () => {
    clearTimeout(saveTimer.current);
    if (editing) await saveReport(editing);
    Object.values(thumbs).forEach(u => URL.revokeObjectURL(u));
    setThumbs({});
    setEditing(null);
    if (pdfResult?.url) URL.revokeObjectURL(pdfResult.url);
    setPdfResult(null);
    refreshList();
  };

  const removeReport = async (r) => {
    if (!window.confirm(`¿Eliminar el informe de ${r.info.equipo || 'sin equipo'} (${r.info.fecha}) de este dispositivo? Se borran también sus fotos.`)) return;
    await deleteReport(r);
    refreshList();
  };

  const setRig = (rigId) => update(r => {
    const rig = (rigs || []).find(x => x.id === rigId);
    const loc = rig ? activeLocationMap[rig.id] : null;
    const oldTpl = TIPOS[r.tipo].objetivo(r.info.equipo, r.info.sector);
    r.info.rigId = rigId;
    r.info.equipo = rig?.name || '';
    r.info.locationId = loc?.id || '';
    r.info.locacion = loc?.location_name || '';
    if (!r.resumen.objetivo || r.resumen.objetivo === oldTpl) r.resumen.objetivo = TIPOS[r.tipo].objetivo(r.info.equipo, r.info.sector);
    return r;
  });

  const setTipo = (tipo) => update(r => {
    const oldTpl = TIPOS[r.tipo].objetivo(r.info.equipo, r.info.sector);
    r.tipo = tipo;
    if (!r.resumen.objetivo || r.resumen.objetivo === oldTpl) r.resumen.objetivo = TIPOS[tipo].objetivo(r.info.equipo, r.info.sector);
    return r;
  });

  const setSector = (sector) => update(r => {
    const oldTpl = TIPOS[r.tipo].objetivo(r.info.equipo, r.info.sector);
    r.info.sector = sector;
    if (!r.resumen.objetivo || r.resumen.objetivo === oldTpl) r.resumen.objetivo = TIPOS[r.tipo].objetivo(r.info.equipo, sector);
    return r;
  });

  const addPhotos = async (obsId, fileList) => {
    const obs = editing.observaciones.find(o => o.id === obsId);
    const room = MAX_FOTOS - (obs?.fotos?.length || 0);
    const files = Array.from(fileList || []).slice(0, room);
    if (!files.length) return;
    setBusy('Procesando fotos…');
    try {
      const added = [];
      for (const file of files) {
        const blob = await prepareSourcePhoto(file);
        const id = newId();
        await savePhoto(id, blob);
        added.push({ id, caption: '', mode: 'contain' });
        setThumbs(t => ({ ...t, [id]: URL.createObjectURL(blob) }));
      }
      update(r => { r.observaciones.find(o => o.id === obsId).fotos.push(...added); return r; });
    } catch (e) {
      alert('No se pudo procesar la foto: ' + (e?.message || e));
    } finally {
      setBusy('');
    }
  };

  const removePhoto = async (obsId, photoId) => {
    await deletePhoto(photoId);
    update(r => { const o = r.observaciones.find(x => x.id === obsId); o.fotos = o.fotos.filter(f => f.id !== photoId); return r; });
  };

  const removeObs = async (obsId) => {
    const o = editing.observaciones.find(x => x.id === obsId);
    if ((o.texto || o.fotos.length) && !window.confirm('¿Eliminar esta observación y sus fotos?')) return;
    for (const f of o.fotos) await deletePhoto(f.id);
    update(r => { r.observaciones = r.observaciones.filter(x => x.id !== obsId); return r; });
  };

  const moveObs = (idx, dir) => update(r => {
    const j = idx + dir;
    if (j < 0 || j >= r.observaciones.length) return r;
    [r.observaciones[idx], r.observaciones[j]] = [r.observaciones[j], r.observaciones[idx]];
    return r;
  });

  const movePhoto = (obsId, idx, dir) => update(r => {
    const o = r.observaciones.find(x => x.id === obsId);
    const j = idx + dir;
    if (j < 0 || j >= o.fotos.length) return r;
    [o.fotos[idx], o.fotos[j]] = [o.fotos[j], o.fotos[idx]];
    return r;
  });

  // ---------- Validación y PDF ----------
  const problems = (r) => {
    const p = [];
    if (!r.info.equipo) p.push('Falta el equipo.');
    if (!r.info.fecha) p.push('Falta la fecha de la visita.');
    if (!r.info.responsable) p.push('Falta el responsable del informe.');
    if (!r.observaciones.length) p.push('Agregá al menos una observación.');
    r.observaciones.forEach((o, i) => {
      if (!o.texto.trim()) p.push(`La observación ${i + 1} no tiene descripción.`);
    });
    return p;
  };

  const generatePdf = async () => {
    const r = editing;
    const p = problems(r);
    if (p.length && !window.confirm(`Revisá antes de generar:\n\n• ${p.join('\n• ')}\n\n¿Generar igual?`)) return;
    setBusy('Generando PDF…');
    try {
      let logo = null;
      try { logo = await blobToDataURL(await (await fetch('/marbar-logo.jpg')).blob()); } catch { /* sin logo */ }

      // Numeración por aspecto igual que en el PDF (Calidad primero, luego SSA)
      const observaciones = [];
      for (const key of ['CALIDAD', 'SSA']) {
        for (const o of r.observaciones.filter(x => x.aspecto === key)) {
          const fotos = [];
          for (const f of o.fotos) {
            const b = await getPhoto(f.id);
            if (b) fotos.push({ src: await renderFramedPhoto(b, f.mode), caption: f.caption });
          }
          observaciones.push({
            aspecto: o.aspecto, estado: o.estado, texto: o.texto.trim(),
            accion: o.estado === 'DESVIO' ? o.accion.trim() : '', fotos,
          });
        }
      }
      const na = (t) => (t || '').trim() || 'N/A';
      const doc = buildInformeVisita({
        logo,
        info: { ...r.info },
        resumen: { objetivo: na(r.resumen.objetivo), hallazgos: na(r.resumen.hallazgos), acciones: na(r.resumen.acciones), pendientes: na(r.resumen.pendientes) },
        observaciones,
        plan: buildPlan(r),
      });
      const name = fileNameFor(r);
      const blob = doc.output('blob');
      const file = new File([blob], name, { type: 'application/pdf' });
      if (pdfResult?.url) URL.revokeObjectURL(pdfResult.url);
      setPdfResult({ url: URL.createObjectURL(blob), file, name });

      const saved = { ...r, status: 'generado', synced: false, generatedAt: Date.now(), fileName: name };
      clearTimeout(saveTimer.current);
      await saveReport(saved);
      setEditing(saved);
      setSaveState('saved');
      syncPending();
    } catch (e) {
      alert('No se pudo generar el PDF: ' + (e?.message || e));
    } finally {
      setBusy('');
    }
  };

  const downloadPdf = () => {
    const a = document.createElement('a');
    a.href = pdfResult.url; a.download = pdfResult.name;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const canShare = pdfResult && navigator.canShare && navigator.canShare({ files: [pdfResult.file] });
  const sharePdf = async () => {
    try { await navigator.share({ files: [pdfResult.file], title: pdfResult.name }); } catch { /* cancelado */ }
  };

  // ---------- UI ----------
  const card = 'bg-white rounded-xl shadow-sm border border-slate-200';
  const input = 'w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none';
  const label = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1';

  const statusBadge = (r) => {
    if (r.status !== 'generado') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Borrador</span>;
    if (!r.synced) return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"><CloudOff className="w-3 h-3" />PDF generado · sin sincronizar</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"><Cloud className="w-3 h-3" />PDF generado · registrado</span>;
  };

  // ======= LISTA =======
  if (!editing) {
    return (
      <div className="space-y-4">
        <section className={`${card} p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Informes de visita técnica
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">RG.SGI.27.G · Las fotos quedan solo en este dispositivo y se arman dentro del PDF.</p>
            </div>
            <ConnChip online={online} />
          </div>
          <button
            onClick={createReport}
            className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nuevo informe
          </button>
        </section>

        <section className={`${card} p-4`}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">En este dispositivo</h3>
          {!reports.length && <p className="text-sm text-slate-400 italic">Todavía no hay informes cargados en este dispositivo.</p>}
          <div className="divide-y divide-slate-100">
            {reports.map(r => {
              const nObs = (r.observaciones || []).length;
              const nFotos = (r.observaciones || []).reduce((n, o) => n + (o.fotos || []).length, 0);
              const nDev = (r.observaciones || []).filter(o => o.estado === 'DESVIO').length;
              return (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                  <button onClick={() => openReport(r.id)} className="text-left min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">🚜 {r.info.equipo || 'Sin equipo'}</span>
                      <span className="text-[11px] text-slate-500">{TIPOS[r.tipo]?.label} · {r.info.fecha}</span>
                      {statusBadge(r)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {r.info.locacion ? `📍 ${r.info.locacion} · ` : ''}{nObs} obs. · {nFotos} fotos{nDev ? ` · ${nDev} desvío${nDev > 1 ? 's' : ''}` : ''}
                    </div>
                  </button>
                  <button onClick={() => removeReport(r)} className="p-2 text-slate-300 hover:text-red-600" title="Eliminar del dispositivo">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {remote && (
          <section className={`${card} p-4`}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Historial registrado (todos los inspectores)</h3>
            {!remote.length && <p className="text-sm text-slate-400 italic">Sin informes registrados todavía.</p>}
            <div className="divide-y divide-slate-100">
              {remote.map(x => (
                <div key={x.id} className="py-2 text-sm flex flex-wrap items-center justify-between gap-1">
                  <span className="font-semibold text-slate-700">🚜 {x.equipo} <span className="text-[11px] font-normal text-slate-500">· {TIPOS[x.report_type]?.label || x.report_type} · {x.visit_date_text}</span></span>
                  <span className="text-[11px] text-slate-500">
                    {x.responsable} · {x.photos_count} fotos
                    {x.desvios_count ? <span className="ml-1 font-bold text-red-700">· {x.desvios_count} desvío{x.desvios_count > 1 ? 's' : ''}</span> : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ======= EDITOR =======
  const r = editing;
  const plan = buildPlan(r);
  const obsNumber = (o) => {
    const order = [...r.observaciones.filter(x => x.aspecto === 'CALIDAD'), ...r.observaciones.filter(x => x.aspecto === 'SSA')];
    return order.indexOf(o) + 1;
  };

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="sticky top-[60px] sm:top-[72px] z-10 bg-slate-100/95 backdrop-blur py-2 -mx-1 px-1">
        <div className={`${card} p-2 flex flex-wrap items-center justify-between gap-2`}>
          <button onClick={closeEditor} className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5">
            <ArrowLeft className="w-4 h-4" /> Informes
          </button>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ConnChip online={online} />
            <span className="hidden sm:inline">{saveState === 'saving' ? 'Guardando…' : '✓ Guardado en este dispositivo'}</span>
          </div>
          <button
            onClick={generatePdf}
            disabled={!!busy}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-sm py-2 px-3 rounded-lg transition active:scale-95"
          >
            <FileDown className="w-4 h-4" /> Generar PDF
          </button>
        </div>
      </div>

      {busy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center">
          <div className="bg-white rounded-xl px-5 py-4 text-sm font-semibold shadow-lg">{busy}</div>
        </div>
      )}

      {pdfResult && (
        <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">PDF listo</p>
                <p className="text-xs text-emerald-800 break-all">{pdfResult.name}</p>
                {!online && <p className="text-[11px] text-emerald-800 mt-1">Sin conexión: queda guardado y se registra en el historial cuando vuelva la señal.</p>}
              </div>
            </div>
            <button onClick={() => setPdfResult(null)} className="text-emerald-700 p-1"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href={pdfResult.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 font-semibold text-sm py-2 px-3 rounded-lg">
              <Eye className="w-4 h-4" /> Ver
            </a>
            <button onClick={downloadPdf} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 px-3 rounded-lg">
              <FileDown className="w-4 h-4" /> Descargar
            </button>
            {canShare && (
              <button onClick={sharePdf} className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 font-semibold text-sm py-2 px-3 rounded-lg">
                <Share2 className="w-4 h-4" /> Compartir (mail, WhatsApp…)
              </button>
            )}
          </div>
        </section>
      )}

      {/* 1. Información general */}
      <section className={`${card} p-4 space-y-3`}>
        <h3 className="text-sm font-bold text-white bg-[#6aae3e] -mx-4 -mt-4 px-4 py-2 rounded-t-xl">1. Información general</h3>
        <div>
          <span className={label}>Tipo de visita</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TIPOS).map(([k, t]) => (
              <button key={k} onClick={() => setTipo(k)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${r.tipo === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Equipo</span>
            <select className={input} value={r.info.rigId} onChange={e => setRig(e.target.value)}>
              <option value="">— Elegir equipo —</option>
              {(rigs || []).filter(x => !isBaseRig(x)).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Fecha de la visita</span>
            <input className={input} value={r.info.fecha} placeholder="dd/mm/aaaa o '10 al 12 de octubre 2026'"
              onChange={e => update(x => { x.info.fecha = e.target.value; return x; })} />
          </div>
          <div>
            <span className={label}>Ubicación / Locación</span>
            <input className={input} value={r.info.locacion} onChange={e => update(x => { x.info.locacion = e.target.value; return x; })} />
          </div>
          <div>
            <span className={label}>Pozo</span>
            <input className={input} value={r.info.pozo} onChange={e => update(x => { x.info.pozo = e.target.value; return x; })} />
          </div>
          <div>
            <span className={label}>Sector / Área</span>
            <input className={input} list="sectores-informe" value={r.info.sector} onChange={e => setSector(e.target.value)} />
            <datalist id="sectores-informe">{SECTORES.map(s => <option key={s} value={s} />)}</datalist>
          </div>
          <div>
            <span className={label}>Responsable del informe</span>
            <input className={input} value={r.info.responsable} onChange={e => update(x => { x.info.responsable = e.target.value; return x; })} />
          </div>
          <div className="sm:col-span-2">
            <span className={label}>Otros participantes</span>
            <input className={input} value={r.info.participantes} onChange={e => update(x => { x.info.participantes = e.target.value; return x; })} />
          </div>
        </div>
      </section>

      {/* 2. Resumen ejecutivo */}
      <section className={`${card} p-4 space-y-3`}>
        <h3 className="text-sm font-bold text-white bg-[#6aae3e] -mx-4 -mt-4 px-4 py-2 rounded-t-xl">2. Resumen ejecutivo</h3>
        {[
          ['objetivo', 'Objetivo de la visita', 'Se completa solo según el tipo de visita; podés editarlo.'],
          ['hallazgos', 'Principales hallazgos', 'Vacío = N/A'],
          ['acciones', 'Acciones inmediatas implementadas', 'Vacío = N/A'],
          ['pendientes', 'Acciones pendientes', 'Vacío = N/A'],
        ].map(([k, l, ph]) => (
          <div key={k}>
            <span className={label}>{l}</span>
            <textarea className={input} rows={k === 'hallazgos' ? 4 : 3} placeholder={ph} maxLength={2500}
              value={r.resumen[k]} onChange={e => update(x => { x.resumen[k] = e.target.value; return x; })} />
          </div>
        ))}
      </section>

      {/* 3. Desarrollo */}
      <section className="space-y-3">
        <div className={`${card} overflow-hidden`}>
          <h3 className="text-sm font-bold text-white bg-[#6aae3e] px-4 py-2">3. Desarrollo · Observaciones</h3>
          <p className="text-xs text-slate-500 px-4 py-2">Cada observación lleva su descripción y hasta {MAX_FOTOS} fotos. En el PDF se ordenan: Calidad primero, después SSA.</p>
        </div>

        {r.observaciones.map((o, idx) => (
          <div key={o.id} className={`${card} p-4 space-y-3 border-l-4 ${o.estado === 'DESVIO' ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-800">Obs. {obsNumber(o)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveObs(idx, -1)} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30" title="Subir"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => moveObs(idx, 1)} disabled={idx === r.observaciones.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30" title="Bajar"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => removeObs(o.id)} className="p-1.5 text-slate-300 hover:text-red-600" title="Eliminar observación"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-xs font-semibold">
                {[['CALIDAD', 'Calidad'], ['SSA', 'Seguridad, Higiene y Ambiente']].map(([k, l]) => (
                  <button key={k} onClick={() => update(x => { x.observaciones[idx].aspecto = k; return x; })}
                    className={`px-3 py-1.5 ${o.aspecto === k ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{l}</button>
                ))}
              </div>
              <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-xs font-bold">
                <button onClick={() => update(x => { x.observaciones[idx].estado = 'CONFORME'; return x; })}
                  className={`px-3 py-1.5 ${o.estado === 'CONFORME' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>Conforme</button>
                <button onClick={() => update(x => { x.observaciones[idx].estado = 'DESVIO'; return x; })}
                  className={`px-3 py-1.5 ${o.estado === 'DESVIO' ? 'bg-red-600 text-white' : 'bg-white text-slate-600'}`}>Desvío</button>
              </div>
            </div>

            <div>
              <span className={label}>Descripción / observación</span>
              <textarea className={input} rows={4} maxLength={1500} placeholder="Qué se observó, dónde y en qué condición."
                value={o.texto} onChange={e => update(x => { x.observaciones[idx].texto = e.target.value; return x; })} />
            </div>

            {o.estado === 'DESVIO' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-bold text-red-800 uppercase flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Acción recomendada <span className="normal-case font-semibold">(opcional · si se completa, pasa al Plan de acciones)</span></span>
                <textarea className={input} rows={2} maxLength={800} placeholder="Dejar vacío si la acción la define Operaciones."
                  value={o.accion} onChange={e => update(x => { x.observaciones[idx].accion = e.target.value; return x; })} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={input} placeholder="Responsable" value={o.accionResp}
                    onChange={e => update(x => { x.observaciones[idx].accionResp = e.target.value; return x; })} />
                  <input type="date" className={input} value={o.accionFecha}
                    onChange={e => update(x => { x.observaciones[idx].accionFecha = e.target.value; return x; })} />
                </div>
              </div>
            )}

            {/* Fotos */}
            <div>
              <span className={label}>Evidencia ({o.fotos.length}/{MAX_FOTOS})</span>
              <div className="grid grid-cols-2 gap-2">
                {o.fotos.map((f, fi) => (
                  <div key={f.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {thumbs[f.id] && (
                        <img src={thumbs[f.id]} alt="" className={`absolute inset-0 w-full h-full ${f.mode === 'cover' ? 'object-cover' : 'object-contain'}`} />
                      )}
                      <span className="absolute top-1 left-1 text-[10px] font-bold bg-slate-900/70 text-white px-1.5 py-0.5 rounded">Foto {obsNumber(o)}.{fi + 1}</span>
                      <button onClick={() => removePhoto(o.id, f.id)} className="absolute top-1 right-1 bg-white/90 text-red-600 rounded p-1" title="Quitar foto"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="p-1.5 space-y-1.5">
                      <input className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white" placeholder="Epígrafe (opcional)" maxLength={60}
                        value={f.caption} onChange={e => update(x => { x.observaciones[idx].fotos[fi].caption = e.target.value; return x; })} />
                      <div className="flex items-center justify-between gap-1">
                        <button onClick={() => update(x => { const p = x.observaciones[idx].fotos[fi]; p.mode = p.mode === 'cover' ? 'contain' : 'cover'; return x; })}
                          className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 border border-slate-300 rounded px-1.5 py-1 bg-white"
                          title="Completa: se ve toda la foto. Llenar marco: recorta los bordes.">
                          {f.mode === 'cover' ? <><Minimize className="w-3 h-3" /> Ver completa</> : <><Maximize className="w-3 h-3" /> Llenar marco</>}
                        </button>
                        <div className="flex">
                          <button onClick={() => movePhoto(o.id, fi, -1)} disabled={fi === 0} className="p-1 text-slate-400 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5 -rotate-90" /></button>
                          <button onClick={() => movePhoto(o.id, fi, 1)} disabled={fi === o.fotos.length - 1} className="p-1 text-slate-400 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5 -rotate-90" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {o.fotos.length < MAX_FOTOS && (
                <div className="flex gap-2 mt-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer active:scale-95">
                    <Camera className="w-4 h-4" /> Cámara
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => { addPhotos(o.id, e.target.files); e.target.value = ''; }} />
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold py-2.5 rounded-lg cursor-pointer active:scale-95">
                    <ImageIcon className="w-4 h-4" /> Galería
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { addPhotos(o.id, e.target.files); e.target.value = ''; }} />
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={() => update(x => { x.observaciones.push(emptyObs(x.observaciones.at(-1)?.aspecto || 'SSA')); return x; })}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700 font-semibold text-sm py-3 rounded-xl transition">
          <Plus className="w-4 h-4" /> Agregar observación
        </button>
      </section>

      {/* 4. Plan de acciones */}
      <section className={`${card} p-4 space-y-3`}>
        <h3 className="text-sm font-bold text-white bg-[#6aae3e] -mx-4 -mt-4 px-4 py-2 rounded-t-xl">4. Plan de acciones</h3>
        {plan.length === 0 && <p className="text-sm text-slate-400 italic">Sin acciones. Las acciones de los desvíos aparecen acá automáticamente.</p>}
        {r.observaciones.filter(o => o.estado === 'DESVIO' && o.accion.trim()).map(o => (
          <div key={o.id} className="text-sm bg-red-50 border border-red-100 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-red-700 uppercase">Desde Obs. {obsNumber(o)}</span>
            <p className="text-slate-800">{o.accion}</p>
            <p className="text-[11px] text-slate-500">{o.accionResp || 'Sin responsable'} · {o.accionFecha ? isoToDDMMYYYY(o.accionFecha) : 'sin fecha'}</p>
          </div>
        ))}
        {(r.planExtra || []).map((p, i) => (
          <div key={p.id} className="border border-slate-200 rounded-lg p-2.5 space-y-2">
            <div className="flex items-start gap-2">
              <textarea className={input} rows={2} maxLength={800} placeholder="Acción" value={p.accion}
                onChange={e => update(x => { x.planExtra[i].accion = e.target.value; return x; })} />
              <button onClick={() => update(x => { x.planExtra.splice(i, 1); return x; })} className="p-1.5 text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={input} placeholder="Responsable" value={p.responsable} onChange={e => update(x => { x.planExtra[i].responsable = e.target.value; return x; })} />
              <input type="date" className={input} value={p.fecha} onChange={e => update(x => { x.planExtra[i].fecha = e.target.value; return x; })} />
            </div>
          </div>
        ))}
        <button onClick={() => update(x => { x.planExtra = [...(x.planExtra || []), { id: newId(), accion: '', responsable: '', fecha: '' }]; return x; })}
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800">
          <Plus className="w-4 h-4" /> Agregar acción general
        </button>
      </section>

      <button
        onClick={generatePdf}
        disabled={!!busy}
        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-base py-3 rounded-xl transition active:scale-95"
      >
        <FileDown className="w-5 h-5" /> Generar PDF
      </button>
    </div>
  );
}
