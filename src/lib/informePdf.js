import { jsPDF } from 'jspdf';
// Generador RG.SGI.27.G - Informe de visita técnica (jsPDF, sin dependencias de servidor)
// data: { info:{...}, resumen:{objetivo, hallazgos, acciones, pendientes}, observaciones:[{aspecto, estado, texto, fotos:[{src, caption}] , accion?}], plan:[{accion, responsable, fecha}] , logo }

const GREEN = [106, 174, 62];
const GREEN_DARK = [74, 134, 40];
const GREY_BG = [242, 242, 242];
const GREY_LINE = [190, 190, 190];
const TEXT = [30, 30, 30];

export function buildInformeVisita(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210, PH = 297, ML = 18, MR = 18, CW = PW - ML - MR;
  const TOP = 30, BOTTOM = PH - 34; // área útil
  let y = TOP;

  const setText = (size, style = 'normal', color = TEXT) => {
    doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color);
  };
  const lines = (txt, w) => doc.splitTextToSize(txt || '', w);
  const LH = (size) => size * 0.3528 * 1.35; // alto de línea en mm

  const newPage = () => { doc.addPage(); y = TOP; };
  const ensure = (h) => { if (y + h > BOTTOM) newPage(); };

  const sectionBar = (title) => {
    ensure(14);
    doc.setFillColor(...GREEN); doc.rect(ML, y, CW * 0.6, 6.5, 'F');
    setText(10, 'bold', [255, 255, 255]); doc.text(title, ML + 3, y + 4.6);
    y += 10;
  };
  const subTitle = (t) => {
    ensure(10);
    setText(9.5, 'bold'); doc.text('•  ' + t, ML + 3, y + 3.5); y += 7;
  };
  const paragraph = (t, size = 9.5) => {
    setText(size);
    const ls = lines(t || 'N/A', CW - 6);
    for (const l of ls) { ensure(LH(size)); doc.text(l, ML + 3, y + 3.2); y += LH(size); }
    y += 3;
  };

  // ---------- PORTADA / 1. INFORMACIÓN GENERAL ----------
  setText(9, 'bold', GREEN_DARK); doc.text('RG.SGI.27.G', ML, y + 3);
  setText(16, 'bold'); doc.text('Informe de visita técnica', ML, y + 10);
  y += 17;
  sectionBar('1.  INFORMACIÓN GENERAL');
  const info = [
    ['Fecha de la Visita:', data.info.fecha],
    ['Sector / Área:', data.info.sector],
    ['Equipo:', data.info.equipo],
    ['Ubicación / Locación:', data.info.locacion],
    ['Pozo:', data.info.pozo],
    ['Responsable del Informe:', data.info.responsable],
    ['Otros Participantes:', data.info.participantes],
  ];
  const lw = 52, rh = 6.2;
  info.forEach(([k, v]) => {
    doc.setFillColor(...GREEN); doc.rect(ML, y, lw, rh, 'F');
    doc.setFillColor(...GREY_BG); doc.rect(ML + lw, y, CW - lw, rh, 'F');
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.4); doc.line(ML, y + rh, ML + CW, y + rh);
    setText(8.5, 'normal', [255, 255, 255]); doc.text(k, ML + 2, y + 4.2);
    setText(9, 'bold'); doc.text(v || '', ML + lw + 3, y + 4.2);
    y += rh;
  });
  y += 7;

  // ---------- 2. RESUMEN EJECUTIVO ----------
  sectionBar('2.  RESUMEN EJECUTIVO');
  subTitle('Objetivo de la visita'); paragraph(data.resumen.objetivo);
  subTitle('Principales hallazgos'); paragraph(data.resumen.hallazgos);
  subTitle('Acciones inmediatas implementadas'); paragraph(data.resumen.acciones);
  subTitle('Acciones pendientes'); paragraph(data.resumen.pendientes);

  // ---------- 3. DESARROLLO ----------
  newPage();
  sectionBar('3.  DESARROLLO');

  const LCOL = 62, RCOL = CW - LCOL, PAD = 3;
  const GAP = 3, PHW = (RCOL - PAD * 2 - GAP) / 2, PHH = PHW * 0.75, CAP = 7.5;
  const tableHeader = () => {
    doc.setFillColor(...GREY_BG); doc.setDrawColor(...GREY_LINE); doc.setLineWidth(0.2);
    doc.rect(ML, y, LCOL, 7, 'FD'); doc.setFillColor(...GREY_BG); doc.rect(ML + LCOL, y, RCOL, 7, 'FD');
    setText(8.5, 'bold'); doc.text('Descripción / Observaciones', ML + LCOL / 2, y + 4.7, { align: 'center' });
    doc.text('Evidencia', ML + LCOL + RCOL / 2, y + 4.7, { align: 'center' });
    y += 7;
  };

  const aspectos = [
    ['CALIDAD', 'ASPECTOS DE CALIDAD'],
    ['SSA', 'ASPECTOS DE SEGURIDAD E HIGIENE Y AMBIENTE'],
  ];
  let obsN = 0;
  for (const [key, title] of aspectos) {
    const obs = data.observaciones.filter(o => o.aspecto === key);
    ensure(12);
    setText(9, 'bold'); doc.text(title, ML, y + 3.5);
    doc.setDrawColor(...TEXT); doc.setLineWidth(0.2); doc.line(ML, y + 4.3, ML + doc.getTextWidth(title), y + 4.3);
    y += 8;
    if (!obs.length) { setText(9, 'italic', [110, 110, 110]); doc.text('Sin observaciones para este aspecto.', ML + 3, y + 2); y += 9; continue; }

    let headerDrawn = false;
    for (const o of obs) {
      obsN++;
      setText(9);
      const desc = lines(o.texto, LCOL - PAD * 2);
      setText(8, 'bold');
      const accL = o.accion ? lines('Acción: ' + o.accion, LCOL - PAD * 2) : [];
      const textH = 13 + desc.length * LH(9) + (o.accion ? 6 + accL.length * LH(8) : 0);
      const rows = Math.max(1, Math.ceil((o.fotos || []).length / 2));
      const photosH = (o.fotos || []).length ? rows * (PHH + CAP) + PAD : 0;
      const rowH = Math.max(textH, photosH) + 2;

      if (y + rowH + (headerDrawn ? 0 : 7) > BOTTOM) { newPage(); headerDrawn = false; }
      if (!headerDrawn) { tableHeader(); headerDrawn = true; }

      doc.setDrawColor(...GREY_LINE); doc.setLineWidth(0.2);
      doc.rect(ML, y, LCOL, rowH); doc.rect(ML + LCOL, y, RCOL, rowH);

      // badge
      const isDev = o.estado === 'DESVIO';
      const bTxt = isDev ? 'DESVÍO' : 'CONFORME';
      doc.setFillColor(...(isDev ? [254, 226, 226] : [220, 240, 210]));
      setText(7, 'bold', isDev ? [185, 28, 28] : GREEN_DARK);
      const bw = doc.getTextWidth(bTxt) + 4;
      setText(8.5, 'bold'); doc.text(`Obs. ${obsN}`, ML + PAD, y + 5.5);
      doc.setFillColor(...(isDev ? [254, 226, 226] : [220, 240, 210]));
      doc.roundedRect(ML + LCOL - PAD - bw, y + 2.3, bw, 4.4, 1, 1, 'F');
      setText(7, 'bold', isDev ? [185, 28, 28] : GREEN_DARK);
      doc.text(bTxt, ML + LCOL - PAD - bw / 2, y + 5.4, { align: 'center' });

      let ty = y + 11;
      setText(9);
      desc.forEach(l => { doc.text(l, ML + PAD, ty); ty += LH(9); });
      if (o.accion) {
        ty += 2;
        setText(8, 'bold', [185, 28, 28]);
        accL.forEach(l => { doc.text(l, ML + PAD, ty); ty += LH(8); });
      }

      // fotos 2 por fila; si es una sola, centrada
      (o.fotos || []).forEach((f, i) => {
        const r = Math.floor(i / 2), c = i % 2;
        const single = o.fotos.length === 1 || (i === o.fotos.length - 1 && o.fotos.length % 2 === 1);
        const x = ML + LCOL + PAD + (single ? (RCOL - PAD * 2 - PHW) / 2 : c * (PHW + GAP));
        const py = y + PAD + r * (PHH + CAP);
        doc.addImage(f.src, 'JPEG', x, py, PHW, PHH, undefined, 'FAST');
        doc.setDrawColor(...GREY_LINE); doc.rect(x, py, PHW, PHH);
        setText(7, 'bold', [80, 80, 80]);
        const cap = `Foto ${obsN}.${i + 1}` + (f.caption ? ` – ${f.caption}` : '');
        doc.text(doc.splitTextToSize(cap, PHW)[0], x, py + PHH + 3.6);
      });
      y += rowH;
    }
    y += 6;
  }

  // ---------- 4. PLAN DE ACCIONES ----------
  ensure(30);
  sectionBar('4.  PLAN DE ACCIONES');
  const cA = CW * 0.58, cR = CW * 0.25, cF = CW - cA - cR;
  const ph = () => {
    doc.setFillColor(...GREY_BG); doc.setDrawColor(...GREY_LINE);
    [[ML, cA, 'ACCIONES'], [ML + cA, cR, 'RESPONSABLE'], [ML + cA + cR, cF, 'FECHA']].forEach(([x, w, t]) => {
      doc.setFillColor(...GREY_BG); doc.rect(x, y, w, 7, 'FD'); setText(8.5, 'bold'); doc.text(t, x + w / 2, y + 4.7, { align: 'center' });
    });
    y += 7;
  };
  ph();
  (data.plan.length ? data.plan : [{ accion: 'Sin acciones pendientes.', responsable: '', fecha: '' }]).forEach((p, i) => {
    const la = lines(`${i + 1}. ${p.accion}`, cA - 6), lr = lines(p.responsable, cR - 6);
    const h = Math.max(la.length, lr.length, 1) * LH(9) + 5;
    if (y + h > BOTTOM) { newPage(); ph(); }
    doc.setDrawColor(...GREY_LINE);
    doc.rect(ML, y, cA, h); doc.rect(ML + cA, y, cR, h); doc.rect(ML + cA + cR, y, cF, h);
    setText(9);
    la.forEach((l, k) => doc.text(l, ML + 3, y + 4.5 + k * LH(9)));
    lr.forEach((l, k) => doc.text(l, ML + cA + 3, y + 4.5 + k * LH(9)));
    doc.text(p.fecha || '', ML + cA + cR + cF / 2, y + 4.5, { align: 'center' });
    y += h;
  });

  // ---------- ENCABEZADO Y PIE EN TODAS LAS PÁGINAS ----------
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setText(7, 'bold'); doc.text('RG.SGI.27.G - INFORME DE VISITA TÉCNICA', ML, 16);
    if (data.logo) doc.addImage(data.logo, 'JPEG', PW - MR - 30, 8, 30, 9.2);
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.8); doc.line(ML, 19, PW - MR, 19);

    const fy = PH - 28;
    doc.setLineWidth(0.8); doc.line(ML, fy, PW - MR, fy);
    const cols = [['CONFECCIONÓ', 'SGI'], ['REVISÓ', 'SSA'], ['APROBÓ', 'GERENCIA']];
    const cw = 30;
    cols.forEach(([h, v], i) => {
      const x = ML + i * (cw + 2);
      doc.setFillColor(40, 40, 40); doc.rect(x, fy + 2, cw, 4, 'F');
      setText(6.5, 'bold', [255, 255, 255]); doc.text(h, x + cw / 2, fy + 4.9, { align: 'center' });
      setText(7); doc.text(v, x + 1.5, fy + 9.5);
    });
    setText(7, 'bold'); doc.text('FECHA: 25/08/25', ML + 98, fy + 5); doc.text('REVISIÓN: 04', ML + 98, fy + 8.6);
    doc.setDrawColor(...GREY_LINE); doc.setLineWidth(0.2); doc.line(ML + 128, fy + 2, ML + 128, fy + 12);
    setText(6.5); doc.text(['Verifica la versión controlada en la', 'biblioteca del portal', 'marbar.com.ar/portal'], ML + 131, fy + 4.5);
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.5); doc.line(ML, fy + 14, PW - MR, fy + 14);
    setText(7.5); doc.text(`Página ${p} de ${total}`, PW - MR, fy + 19, { align: 'right' });
  }
  return doc;
}
