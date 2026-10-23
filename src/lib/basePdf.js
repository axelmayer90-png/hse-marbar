import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MONTHS, fmtDate } from './baseForms.js';

const GREEN = [106, 174, 62];
const GREY_LABEL = [118, 118, 118];
const GREY_LINE = [170, 170, 170];
const TEXT = [30, 30, 30];

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

// PDF de controles de base con el formato de cada registro RG.SSA
// opts: { form, base, period: { year, month? }, elements, controls, logo }
export function buildBasePdf({ form, base, period, elements, controls, logo }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: form.orientation === 'p' ? 'portrait' : 'landscape' });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 12, MR = 12, CW = PW - ML - MR;
  const TOP = 40, BOTTOM_MARGIN = 34;
  let first = true;

  const setText = (size, style = 'normal', color = TEXT) => { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color); };
  const newPage = () => { if (!first) doc.addPage(); first = false; };

  const titleBlock = () => {
    setText(14, 'normal'); doc.text(form.code, ML, 24);
    const w = doc.getTextWidth(form.code + ' ');
    setText(14, 'bold'); doc.text(form.title, ML + w, 24);
  };

  // Línea de datos tipo "INSTALACIÓN: ______"
  const infoRow = (pairs, y) => {
    const colW = CW / pairs.length;
    pairs.forEach(([k, v], i) => {
      const x = ML + i * colW;
      setText(6.5, 'bold'); doc.text(`${k}:`, x, y);
      const lw = doc.getTextWidth(`${k}: `);
      setText(8, 'normal'); doc.text(doc.splitTextToSize(v || '', colW - lw - 3)[0] || '', x + lw, y);
      doc.setDrawColor(150, 150, 150); doc.setLineDashPattern([0.6, 0.6], 0); doc.setLineWidth(0.2);
      doc.line(x + lw, y + 1, x + colW - 3, y + 1);
      doc.setLineDashPattern([], 0);
    });
  };

  const tableStyles = {
    theme: 'grid',
    margin: { left: ML, right: MR, top: TOP, bottom: BOTTOM_MARGIN },
    styles: { fontSize: 7, cellPadding: 1.2, lineColor: GREY_LINE, lineWidth: 0.15, textColor: TEXT, valign: 'middle' },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  };

  const labelCell = (content, extra = {}) => ({ content, styles: { fillColor: GREY_LABEL, textColor: [255, 255, 255], fontStyle: 'bold', ...extra } });
  const darkRow = (content, colSpan) => ({ content, colSpan, styles: { fillColor: [45, 45, 45], textColor: [255, 255, 255], fontStyle: 'bold' } });
  const mark = (v) => {
    const s = form.scale.find(x => x.k === v);
    if (!s) return '';
    return { content: s.label, styles: { halign: 'center', fontStyle: 'bold', textColor: s.kind === 'bad' ? [185, 28, 28] : TEXT } };
  };

  const refAndNote = (y) => {
    if (form.ref) { setText(6.5, 'bold'); doc.text('REF:', ML, y); setText(6.5); doc.text(form.ref, ML + 8, y); }
    if (form.note) {
      setText(6.5, 'bold', [200, 30, 30]); doc.text('NOTA:', PW - MR - 110, y);
      setText(6.5); doc.text(doc.splitTextToSize(form.note, 100), PW - MR - 101, y);
    }
  };

  const obsBlock = (y, lines) => {
    if (y > PH - BOTTOM_MARGIN - 14) return;
    doc.setFillColor(...GREEN); doc.rect(ML, y, CW, 5, 'F');
    setText(7.5, 'bold', [255, 255, 255]); doc.text('OBSERVACIONES', ML + 2, y + 3.5);
    if (form.obsHint) { setText(6.5, 'normal', [255, 255, 255]); doc.text(`(${form.obsHint})`, ML + 28, y + 3.5); }
    setText(7.5); let yy = y + 9;
    (lines.length ? lines : ['']).forEach(l => {
      doc.splitTextToSize(l, CW).forEach(t => {
        if (yy > PH - BOTTOM_MARGIN - 2) return;
        doc.text(t, ML, yy); yy += 3.8;
      });
    });
    doc.setDrawColor(150, 150, 150); doc.setLineDashPattern([0.6, 0.6], 0);
    for (let k = 0; k < 3 && yy + k * 5 < PH - BOTTOM_MARGIN; k++) doc.line(ML, yy + k * 5 - 2.5, ML + CW, yy + k * 5 - 2.5);
    doc.setLineDashPattern([], 0);
  };

  const periodLabel = period.month ? `${MONTHS[period.month - 1]} ${period.year}` : `Año ${period.year}`;
  const byDate = (a, b) => (a.control_date || '').localeCompare(b.control_date || '');

  // ======================= LAYOUTS =======================
  if (form.layout === 'monthlyTable') {
    // RG-SSA-24: una fila por extintor, último control del mes
    newPage(); titleBlock();
    const latest = {};
    controls.slice().sort(byDate).forEach(c => { latest[c.element_id] = c; });
    const used = Object.values(latest);
    infoRow([
      ['INSTALACIÓN', `Base ${base}`], ['MES', periodLabel],
      ['RESPONSABLE DE CONTROL', uniq(used.map(c => c.responsible)).join(', ')],
      ['FECHA DE CONTROL', uniq(used.map(c => fmtDate(c.control_date))).join(', ')],
    ], 33);
    const els = elements.slice().sort((a, b) => (Number(a.data?.puesto) || 999) - (Number(b.data?.puesto) || 999) || String(a.code).localeCompare(String(b.code)));
    const body = els.map((e, i) => {
      const c = latest[e.id];
      const d = { ...(e.data || {}), ...(c?.element_snapshot?.data || {}) };
      const cells = [
        { content: d.puesto || String(i + 1), styles: { fontStyle: 'bold', halign: 'center' } },
        e.code || '', e.location || '', d.tipo || '', d.clase || '', d.capacidad || '',
        fmtDate(d.vto_ph), fmtDate(d.vto_carga),
      ];
      form.checks.forEach(ch => {
        const v = c?.answers?.[ch.k];
        cells.push(v === 'B' ? mark('B') : '', v === 'M' ? mark('M') : '');
      });
      cells.push(c ? (c.observations || '') : 'Sin control en el mes');
      return cells;
    });
    while (body.length < 15) body.push([{ content: String(body.length + 1), styles: { fontStyle: 'bold', halign: 'center' } }, ...Array(8 + form.checks.length * 2 + 1 - 1).fill('')]);
    autoTable(doc, {
      ...tableStyles, startY: 38,
      head: [
        [
          { content: 'N°\nPUESTO', rowSpan: 2 }, { content: 'N°\nEXTINTOR', rowSpan: 2 }, { content: 'UBICACIÓN FÍSICA', rowSpan: 2 },
          { content: 'TIPO', rowSpan: 2 }, { content: 'CLASE', rowSpan: 2 }, { content: 'CAPACIDAD\n(KG)', rowSpan: 2 },
          { content: 'VENCIMIENTO\nPRUEBA HIDRÁULICA\n(MES - AÑO)', rowSpan: 2 }, { content: 'VENCIMIENTO\nCARGA\n(MES - AÑO)', rowSpan: 2 },
          ...form.checks.map(ch => ({ content: `ESTADO\n${ch.label.toUpperCase()}`, colSpan: 2 })),
          { content: 'OBSERVACIONES', rowSpan: 2 },
        ],
        form.checks.flatMap(() => [
          { content: 'BIEN', styles: { fillColor: GREY_LABEL, fontSize: 5.5 } },
          { content: 'MAL', styles: { fillColor: GREY_LABEL, fontSize: 5.5 } },
        ]),
      ],
      body,
      headStyles: { ...tableStyles.headStyles, fontSize: 5.8 },
      columnStyles: {
        0: { cellWidth: 11 }, 1: { cellWidth: 13 }, 2: { cellWidth: 40 }, 3: { cellWidth: 11 }, 4: { cellWidth: 11 }, 5: { cellWidth: 17 },
        6: { cellWidth: 21, halign: 'center' }, 7: { cellWidth: 18, halign: 'center' },
        ...Object.fromEntries(Array.from({ length: form.checks.length * 2 }, (_, i) => [8 + i, { cellWidth: 9, halign: 'center' }])),
      },
    });
    refAndNote(doc.lastAutoTable.finalY + 5);
  }

  if (form.layout === 'columnsByDate' || form.layout === 'botiquin') {
    // RG.SSA.25 / RG-SSA-29 / RG.SSA.26: una hoja por elemento, columnas por fecha de control
    elements.forEach(e => {
      const cs = controls.filter(c => c.element_id === e.id).sort(byDate).slice(-form.maxColumns);
      newPage(); titleBlock();
      infoRow([
        [form.type === 'KIT_DERRAMES' ? 'INSTALACIÓN / UNIDAD MÓVIL' : 'INSTALACIÓN', `Base ${base} – ${[e.code, e.location].filter(Boolean).join(' · ')}`],
        ['RESPONSABLE DE CONTROL', uniq(cs.map(c => c.responsible)).join(', ')],
        ['FRECUENCIA', `Mensual · ${periodLabel}`],
      ], 33);
      const n = form.maxColumns;
      const cols = Array.from({ length: n }, (_, i) => cs[i] || null);
      const hasQty = form.layout === 'botiquin' || (form.groups || []).some(g => g.items.some(i => i.qty));
      const perDate = form.layout === 'botiquin' ? 2 : 1;
      const totalCols = 1 + (hasQty ? 1 : 0) + n * perDate;
      const body = [];
      // Fila de fechas
      body.push([labelCell(form.layout === 'botiquin' ? 'FECHA DE CONTROL' : 'FECHA'), ...(hasQty ? [labelCell('')] : []),
        ...cols.map(c => ({ content: c ? fmtDate(c.control_date).slice(0, 5) + '/' + fmtDate(c.control_date).slice(8) : '', colSpan: perDate, styles: { halign: 'center', fontStyle: 'bold', fontSize: 6.3 } }))]);
      if (form.layout === 'botiquin') {
        body.push([{ content: 'DESCRIPCIÓN DE LOS ELEMENTOS', styles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'CANT.', styles: { fillColor: GREY_LABEL, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } },
          ...cols.flatMap(() => ['CE', 'FV'].map(t => ({ content: t, styles: { fillColor: [45, 45, 45], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 6 } })))]);
        form.supplies.forEach(s => {
          body.push([labelCell(s.label.toUpperCase(), { fontSize: 6.3 }), { content: s.qty, styles: { halign: 'center' } },
            ...cols.flatMap(c => {
              const a = c?.answers?.supplies?.[s.k] || {};
              const low = a.ce !== undefined && a.ce !== '' && Number(a.ce) < parseFloat(s.qty);
              return [
                { content: a.ce ?? '', styles: { halign: 'center', textColor: low ? [185, 28, 28] : TEXT, fontStyle: low ? 'bold' : 'normal' } },
                { content: a.fv ? `${a.fv.slice(5, 7)}/${a.fv.slice(2, 4)}` : '', styles: { halign: 'center', fontSize: 5.8 } },
              ];
            })]);
        });
      }
      const green = (content, { colSpan, ...extra } = {}) => ({ content, ...(colSpan ? { colSpan } : {}), styles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold', ...extra } });
      const grey = (content) => ({ content, styles: { fillColor: GREY_LABEL, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } });
      const groups = form.groups ? form.groups : [{ title: 'CONTROL Y REVISIÓN', items: form.checks }];
      groups.forEach((g, gi) => {
        if (gi === 0) {
          if (form.layout === 'botiquin') body.push([darkRow(g.title.toUpperCase(), 2), green('ESTADO', { colSpan: n * perDate, halign: 'center' })]);
          else body.push([green(g.title.toUpperCase(), hasQty ? {} : { halign: 'center' }), ...(hasQty ? [grey('CANT.')] : []), green('ESTADO', { colSpan: n, halign: 'center' })]);
        } else {
          body.push([darkRow(g.title.toUpperCase(), totalCols)]);
        }
        g.items.forEach(it => {
          body.push([labelCell(it.label.toUpperCase(), { fontSize: 6.3 }), ...(hasQty ? [{ content: it.qty || '', styles: { halign: 'center' } }] : []),
            ...cols.map(c => ({ ...(mark(c?.answers?.[it.k]) || { content: '' }), colSpan: perDate }))]);
        });
      });
      const labelW = form.layout === 'botiquin' ? 62 : 70;
      const qtyW = hasQty ? 14 : 0;
      const dateW = (CW - labelW - qtyW) / (n * perDate);
      autoTable(doc, {
        ...tableStyles, startY: 38, body, alternateRowStyles: {},
        styles: { ...tableStyles.styles, fontSize: 6.5, minCellHeight: 5.2 },
        columnStyles: {
          0: { cellWidth: labelW }, ...(hasQty ? { 1: { cellWidth: qtyW } } : {}),
          ...Object.fromEntries(Array.from({ length: n * perDate }, (_, i) => [i + 1 + (hasQty ? 1 : 0), { cellWidth: dateW }])),
        },
      });
      const yEnd = doc.lastAutoTable.finalY + 5;
      refAndNote(yEnd);
      obsBlock(yEnd + 9, cs.filter(c => c.observations).map(c => `${fmtDate(c.control_date)}: ${c.observations}`));
    });
  }

  if (form.layout === 'single') {
    // RG-SSA-27: una hoja por control
    const list = controls.slice().sort(byDate);
    list.forEach(c => {
      const e = elements.find(x => x.id === c.element_id) || {};
      newPage(); titleBlock();
      infoRow([['INSTALACIÓN', `Base ${base} – ${[e.code, e.location].filter(Boolean).join(' · ')}`], ['RESPONSABLE DE CONTROL', c.responsible]], 36);
      infoRow([['MES', `${MONTHS[Number(c.control_date.slice(5, 7)) - 1]} ${c.control_date.slice(0, 4)}`], ['FECHA DE CONTROL', fmtDate(c.control_date)]], 43);
      const body = form.checks.map((ch, i) => {
        const num = { content: String(i + 1), styles: { fontStyle: 'bold', halign: 'center', fontSize: 9 } };
        if (ch.input === 'date') {
          const v = c.answers?.[ch.k];
          return [num, ch.label, { content: v ? fmtDate(v) : '', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } }];
        }
        const v = c.answers?.[ch.k];
        return [num, ch.label, ...form.scale.map(s => (v === s.k ? mark(s.k) : ''))];
      });
      autoTable(doc, {
        ...tableStyles, startY: 52, margin: { ...tableStyles.margin, top: 30 },
        head: [['', 'CONDICIONES A INSPECCIONAR', ...form.scale.map(s => s.label)]],
        body,
        headStyles: { ...tableStyles.headStyles, fillColor: GREEN },
        columnStyles: { 0: { cellWidth: 9 }, 1: { cellWidth: CW - 9 - 48 }, 2: { cellWidth: 16 }, 3: { cellWidth: 16 }, 4: { cellWidth: 16 } },
        styles: { ...tableStyles.styles, fontSize: 7.5, minCellHeight: 8 },
      });
      obsBlock(doc.lastAutoTable.finalY + 8, c.observations ? [c.observations] : []);
    });
    if (!list.length) { newPage(); titleBlock(); setText(10, 'italic', [120, 120, 120]); doc.text(`Sin controles registrados en ${periodLabel}.`, ML, 50); }
  }

  if (form.layout === 'rowsByDate') {
    // RG.SSA.63 DEA: una hoja por equipo, una fila por control
    elements.forEach(e => {
      const cs = controls.filter(c => c.element_id === e.id).sort(byDate);
      newPage(); titleBlock();
      infoRow([['SEDE', `Base ${base} – ${[e.code, e.location].filter(Boolean).join(' · ')}`], ['FRECUENCIA', `Mensual · ${periodLabel}`], ['RESPONSABLE DE CONTROL', uniq(cs.map(c => c.responsible)).join(', ')]], 33);
      const body = cs.map(c => {
        const d = { ...(e.data || {}), ...(c.element_snapshot?.data || {}) };
        return [fmtDate(c.control_date), d.marca || '', d.modelo || '', d.serie || '', fmtDate(d.vto_bateria), fmtDate(d.vto_parches),
          ...form.checks.map(ch => mark(c.answers?.[ch.k]) || ''), c.observations || ''];
      });
      while (body.length < 12) body.push(Array(6 + form.checks.length + 1).fill(''));
      autoTable(doc, {
        ...tableStyles, startY: 38,
        head: [
          [{ content: 'INFORMACIÓN Y ESTADO DEL EQUIPO', colSpan: 6 + form.checks.length + 1 }],
          ['FECHA DE CONTROL', 'MARCA', 'MODELO', 'N° SERIE', 'FECHA VTO BATERÍA', 'FECHA VTO PARCHES', ...form.checks.map(ch => ch.label.toUpperCase()), 'OBSERVACIONES'],
        ],
        body,
        headStyles: { ...tableStyles.headStyles, fontSize: 6.3 },
        styles: { ...tableStyles.styles, minCellHeight: 6.5 },
        columnStyles: { 0: { cellWidth: 20, halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' } },
      });
      refAndNote(doc.lastAutoTable.finalY + 5);
    });
  }

  if (first) { newPage(); titleBlock(); setText(10, 'italic', [120, 120, 120]); doc.text('Sin elementos cargados para este registro.', ML, 50); }

  // ======================= ENCABEZADO Y PIE =======================
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    if (logo) {
      const LW = 22, LHh = LW / 3.32;
      if (form.chileLogo) {
        const xR = PW - MR - LW, xL = xR - LW - 8;
        doc.addImage(logo, 'JPEG', xL, 7, LW, LHh, 'base-logo', 'FAST');
        doc.addImage(logo, 'JPEG', xR, 7, LW, LHh, 'base-logo', 'FAST');
        const bx = xL + LW + 1.5;
        doc.setLineWidth(0.45);
        doc.setDrawColor(0, 57, 166); doc.line(bx, 10.5, bx, 12.3);
        doc.setDrawColor(213, 43, 30); doc.line(bx, 12.3, bx, 14.1);
        setText(7, 'normal', [40, 40, 40]); doc.text('CHILE', bx + 1.3, 13.4);
      } else {
        doc.addImage(logo, 'JPEG', PW - MR - LW, 7, LW, LHh, 'base-logo', 'FAST');
      }
    }
    doc.setDrawColor(40, 40, 40); doc.setLineWidth(0.3); doc.line(ML, 16.5, PW - MR, 16.5);

    const fy = PH - 26;
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.7); doc.line(ML, fy, PW - MR, fy);
    const f = form.footer;
    [['CONFECCIONÓ', f.confecciono], ['REVISÓ', f.reviso], ['APROBÓ', f.aprobo]].forEach(([h, v], i) => {
      const x = ML + i * 30;
      doc.setFillColor(30, 30, 30); doc.rect(x, fy + 2.5, 28, 3.6, 'F');
      setText(6, 'bold', [255, 255, 255]); doc.text(h, x + 1.5, fy + 5.2);
      setText(6.2); doc.text(v, x + 1.5, fy + 9);
    });
    doc.setDrawColor(...GREY_LINE); doc.setLineWidth(0.2);
    doc.line(ML + 91, fy + 2.5, ML + 91, fy + 13); doc.line(ML + 125, fy + 2.5, ML + 125, fy + 13);
    setText(7); doc.text(`FECHA: ${f.fecha || '—'}`, ML + 93, fy + 5.5); doc.text(`REVISIÓN: ${f.rev}`, ML + 93, fy + 9);
    setText(6.3, 'bold'); doc.text(doc.splitTextToSize(f.legend, 50), ML + 127, fy + 5);
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.4); doc.line(ML, fy + 15, PW - MR, fy + 15);
    setText(7); doc.text(`Página ${p} de ${total}`, PW - MR, fy + 20, { align: 'right' });
    setText(6, 'normal', [140, 140, 140]); doc.text(`Generado desde HSE MARBAR · Base ${base}`, ML, fy + 20);
  }
  return doc;
}
