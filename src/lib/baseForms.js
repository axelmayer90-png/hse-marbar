// Formularios de control de elementos en bases (planillas RG.SSA de MARBAR)

export const BASES = ['Neuquén', 'Rincón de los Sauces', 'Añelo'];

const NO_CONTROLADA = 'EL IMPRESO FORMATO PAPEL O DIGITAL ES COPIA "NO CONTROLADA"';
const PORTAL = 'Verifica la versión controlada en la biblioteca del portal marbar.com.ar/portal';

const SCALE_BMF = [
  { k: 'B', label: 'B', name: 'Bien', kind: 'ok' },
  { k: 'M', label: 'M', name: 'Mal / recambio', kind: 'bad' },
  { k: 'F', label: 'F', name: 'Falta', kind: 'bad' },
  { k: 'NA', label: 'N/A', name: 'No aplica', kind: 'na' },
];

export const BASE_FORMS = {
  EXTINTOR: {
    type: 'EXTINTOR',
    code: 'RG-SSA-24',
    title: 'Control y Revisión de Extintores',
    plural: 'Extintores',
    singular: 'Extintor',
    icon: '🧯',
    layout: 'monthlyTable',
    orientation: 'l',
    codeLabel: 'N° extintor',
    locationLabel: 'Ubicación física',
    fields: [
      { k: 'puesto', label: 'N° puesto' },
      { k: 'tipo', label: 'Tipo', placeholder: 'PQS / CO2 / HCFC…' },
      { k: 'clase', label: 'Clase', placeholder: 'ABC / BC…' },
      { k: 'capacidad', label: 'Capacidad (kg)', input: 'number' },
      { k: 'vto_ph', label: 'Vto. prueba hidráulica', input: 'month', expiry: true },
      { k: 'vto_carga', label: 'Vto. carga', input: 'month', expiry: true },
    ],
    checks: [
      { k: 'manometro', label: 'Manómetro' },
      { k: 'etiqueta', label: 'Etiqueta' },
      { k: 'manguera', label: 'Manguera' },
      { k: 'seguro', label: 'Seguro / precinto' },
    ],
    scale: [
      { k: 'B', label: 'Bien', name: 'Bien', kind: 'ok' },
      { k: 'M', label: 'Mal', name: 'Mal estado (gestionar el reemplazo)', kind: 'bad' },
    ],
    ref: 'B: BIEN     M: MAL ESTADO (GESTIONAR EL REEMPLAZO)',
    note: 'EL PRESENTE CONTROL DE EXTINTORES SE DEBE REALIZAR EN FORMA MENSUAL Y DEBE ESTAR DISPONIBLE EN LA INSTALACIÓN.',
    footer: { confecciono: ['Carmen Gatti', 'Marbar S.R.L.'], reviso: ['SGI', 'Marbar S.R.L.'], aprobo: ['Daniel I. Farroni', 'Marbar S.R.L.'], fecha: '01/07/2022', rev: '01', legend: NO_CONTROLADA },
  },

  LAVAOJOS: {
    type: 'LAVAOJOS',
    code: 'RG.SSA.25.AR',
    title: 'Control y Revisión de Lava Ojos Portátil',
    plural: 'Lavaojos portátiles',
    singular: 'Lavaojos portátil',
    icon: '👁️',
    layout: 'columnsByDate',
    orientation: 'l',
    maxColumns: 15,
    codeLabel: 'Identificación',
    locationLabel: 'Ubicación',
    fields: [],
    checks: [
      { k: 'limpieza', label: 'Limpieza exterior adecuada' },
      { k: 'opera', label: 'Opera correctamente' },
      { k: 'acceso', label: 'Acceso a lavaojos libre de obstáculos' },
      { k: 'recambio', label: 'Recambio de agua' },
    ],
    scale: [
      { k: 'S', label: 'S', name: 'Sí', kind: 'ok' },
      { k: 'N', label: 'N', name: 'No', kind: 'bad' },
    ],
    ref: 'S: SI     N: NO',
    note: 'MENSUALMENTE SE DEBE REALIZAR EL RECAMBIO DE AGUA DE LAS BOTELLAS DE LA ESTACIÓN LAVAOJOS.',
    obsHint: 'En el caso de ítems que requieran acción correctiva, especificar en qué botella se identificó.',
    footer: { confecciono: ['SSA'], reviso: ['SGI'], aprobo: ['GERENCIA'], fecha: '04/09/2026', rev: '02', legend: PORTAL },
    chileLogo: true,
  },

  BOTIQUIN: {
    type: 'BOTIQUIN',
    code: 'RG.SSA.26.G',
    title: 'Control y Revisión de Botiquín de Primeros Auxilios',
    plural: 'Botiquines',
    singular: 'Botiquín',
    icon: '🩹',
    layout: 'botiquin',
    orientation: 'l',
    maxColumns: 12,
    codeLabel: 'Identificación',
    locationLabel: 'Ubicación',
    fields: [],
    supplies: [
      { k: 'gasa', label: 'Sobres de gasa hidrófila', qty: '10' },
      { k: 'venda5', label: 'Venda tipo cambric x 5 cm', qty: '3' },
      { k: 'venda7', label: 'Venda tipo cambric x 7 cm', qty: '3' },
      { k: 'apositos10', label: 'Caja de apósitos - protector adhesivos (x 10)', qty: '1' },
      { k: 'sulfadiazina', label: 'Crema sulfadiazina de plata', qty: '1' },
      { k: 'agua_oxigenada', label: 'Agua oxigenada x 100cc', qty: '1' },
      { k: 'bano_ocular', label: 'Baño ocular 80 ml (descongestivo)', qty: '1' },
      { k: 'tela', label: 'Tela adhesiva 25mm x 4m', qty: '1' },
      { k: 'apositos20', label: 'Apósitos estériles 20 x 20 cm (x3)', qty: '1' },
      { k: 'tijera', label: 'Tijera punta roma', qty: '1' },
      { k: 'solucion_fisio', label: 'Solución fisiológica 100 ml', qty: '1' },
      { k: 'guantes', label: 'Pares de guantes látex exploración', qty: '1' },
      { k: 'yodada', label: 'Solución yodada (Pervinox u otros)', qty: '1' },
      { k: 'manta', label: 'Manta térmica (x1 u.)', qty: '1' },
    ],
    groups: [
      { title: 'Otros elementos', items: [
        { k: 'camilla', label: 'Camilla espinal' },
        { k: 'collar', label: 'Collar cervical' },
        { k: 'ferulas', label: 'Set de férulas rígidas' },
      ] },
      { title: 'Acceso botiquín primeros auxilios', items: [
        { k: 'visibilidad', label: 'Visibilidad del botiquín' },
        { k: 'senalizacion', label: 'Señalización' },
        { k: 'obstaculos', label: 'Libre de obstáculos' },
      ] },
    ],
    checks: [],
    scale: SCALE_BMF,
    ref: 'B: BIEN   M: MAL / RECAMBIO   F: FALTA   N/A: NO APLICA   CE: CANTIDAD EXISTENTE   FV: FECHA DE VENCIMIENTO',
    note: 'EN CASO DE UTILIZACIÓN DE ALGÚN ELEMENTO DEL BOTIQUÍN, PROCEDA CON LA REPOSICIÓN DEL MISMO.',
    footer: { confecciono: ['JEFE SSA', 'Marbar S.A.'], reviso: ['SGI', 'Marbar S.A.'], aprobo: ['GERENCIA', 'Marbar S.A.'], fecha: '11/6/2026', rev: '03', legend: PORTAL },
    chileLogo: true,
  },

  DUCHA: {
    type: 'DUCHA',
    code: 'RG-SSA-27',
    title: 'Control y Revisión de Estación Ducha y Lavaojos de Emergencia',
    plural: 'Duchas y lavaojos de emergencia',
    singular: 'Estación ducha y lavaojos',
    icon: '🚿',
    layout: 'single',
    orientation: 'p',
    codeLabel: 'Identificación',
    locationLabel: 'Ubicación',
    fields: [],
    checks: [
      { k: 'c1', label: '¿Se encuentra la estación de ducha y lavaojos en condiciones limpias y adecuadamente equipada?' },
      { k: 'c2', label: '¿Se encuentra la estación de ducha y lavaojos correctamente señalizada?' },
      { k: 'c3', label: '¿El acceso a la estación de ducha y lavaojos se encuentra libre de obstáculos?' },
      { k: 'c4', label: '¿Las placas/palancas de accionamiento se encuentran firmemente ajustadas, sin torceduras ni daños?' },
      { k: 'c5', label: '¿Las placas/palancas de accionamiento actúan en forma rápida y repetida? Funcionan correctamente' },
      { k: 'c6', label: '¿La presión de agua es suficiente para desplazar los capuchones protectores?' },
      { k: 'c7', label: '¿El caudal de agua garantiza un flujo continuo superior a 15 minutos?' },
      { k: 'c8', label: '¿La alimentación de agua de la estación es independiente de la línea (red de agua)?' },
      { k: 'c9', label: 'Indicar fecha de recarga de cisterna (si posee alimentación individual). La cisterna debe permanecer llena en su máxima capacidad.', input: 'date' },
    ],
    scale: [
      { k: 'SI', label: 'SI', name: 'Sí', kind: 'ok' },
      { k: 'NO', label: 'NO', name: 'No', kind: 'bad' },
      { k: 'NA', label: 'N/A', name: 'No aplica', kind: 'na' },
    ],
    footer: { confecciono: ['Carmen Gatti', 'Marbar S.R.L.'], reviso: ['SGI', 'Marbar S.R.L.'], aprobo: ['Daniel I. Farroni', 'Marbar S.R.L.'], fecha: '01/07/2022', rev: '01', legend: NO_CONTROLADA },
  },

  KIT_DERRAMES: {
    type: 'KIT_DERRAMES',
    code: 'RG-SSA-29',
    title: 'Control y Revisión de Kit para contención de derrames',
    plural: 'Kits de contención de derrames',
    singular: 'Kit de derrames',
    icon: '🛢️',
    layout: 'columnsByDate',
    orientation: 'l',
    maxColumns: 12,
    codeLabel: 'Identificación',
    locationLabel: 'Instalación / unidad móvil',
    fields: [],
    groups: [
      { title: 'Descripción de los elementos', items: [
        { k: 'cordones', label: 'Cordones absorbentes', qty: '4' },
        { k: 'panos', label: 'Paños absorbentes', qty: '5' },
        { k: 'polvo', label: 'Absorbente en polvo', qty: '1 (20 kg)' },
        { k: 'bolsas', label: 'Bolsa para residuos', qty: '5' },
        { k: 'pala', label: 'Pala', qty: '1' },
        { k: 'picota', label: 'Picota', qty: '-' },
      ] },
      { title: 'Elementos de protección personal', items: [
        { k: 'semimascara', label: 'Semimáscara con filtro', qty: '1' },
        { k: 'mameluco', label: 'Mameluco desechable', qty: '1' },
        { k: 'guantes', label: 'Guantes de nitrilo (pares)', qty: '1' },
      ] },
      { title: 'Acceso kit de contención', items: [
        { k: 'visibilidad', label: 'Visibilidad de kit', qty: '-' },
        { k: 'senalizacion', label: 'Señalización', qty: '1' },
        { k: 'obstaculos', label: 'Libre de obstáculos', qty: '-' },
      ] },
    ],
    checks: [],
    scale: SCALE_BMF,
    ref: 'B: BIEN     M: MAL / RECAMBIO     F: FALTA     N/A: NO APLICA',
    note: 'EN CASO DE UTILIZACIÓN DE ALGÚN ELEMENTO DEL KIT DE CONTENCIÓN, PROCEDA CON LA REPOSICIÓN DEL MISMO.',
    footer: { confecciono: ['Carmen Gatti', 'Marbar S.R.L.'], reviso: ['SGI', 'Marbar S.R.L.'], aprobo: ['Daniel I. Farroni', 'Marbar S.R.L.'], fecha: '01/07/2023', rev: '01', legend: NO_CONTROLADA },
  },

  DEA: {
    type: 'DEA',
    code: 'RG.SSA.63',
    title: 'Control y Revisión de Desfibrilador Externo Automático (DEA)',
    plural: 'Desfibriladores (DEA)',
    singular: 'DEA',
    icon: '❤️',
    layout: 'rowsByDate',
    orientation: 'l',
    codeLabel: 'Identificación',
    locationLabel: 'Ubicación',
    fields: [
      { k: 'marca', label: 'Marca' },
      { k: 'modelo', label: 'Modelo' },
      { k: 'serie', label: 'N° serie' },
      { k: 'vto_bateria', label: 'Vto. batería', input: 'date', expiry: true },
      { k: 'vto_parches', label: 'Vto. parches', input: 'date', expiry: true },
    ],
    checks: [
      { k: 'pilas', label: 'Estado de pilas 9V' },
      { k: 'tijera', label: 'Tijera antitrauma' },
      { k: 'rasuradora', label: 'Rasuradora' },
      { k: 'boquilla', label: 'Boquilla' },
    ],
    scale: [
      { k: 'B', label: 'B', name: 'Bien', kind: 'ok' },
      { k: 'M', label: 'M', name: 'Mal', kind: 'bad' },
      { k: 'F', label: 'F', name: 'Falta', kind: 'bad' },
    ],
    ref: 'B: BIEN     M: MAL     F: FALTA',
    footer: { confecciono: ['SSA'], reviso: ['SGI'], aprobo: ['GERENCIA'], fecha: '', rev: '01', legend: PORTAL },
  },
};

export const FORM_ORDER = ['EXTINTOR', 'BOTIQUIN', 'LAVAOJOS', 'DUCHA', 'KIT_DERRAMES', 'DEA'];

// Todos los ítems con escala de un formulario (checks + grupos)
export const scaleItems = (form) => [
  ...form.checks.filter(c => !c.input),
  ...(form.groups || []).flatMap(g => g.items),
];

// Cantidad de ítems en mal estado / falta / no en un control
export const countIssues = (form, answers) => {
  const bad = new Set(form.scale.filter(s => s.kind === 'bad').map(s => s.k));
  let n = scaleItems(form).filter(i => bad.has(answers?.[i.k])).length;
  if (form.supplies) {
    n += form.supplies.filter(s => {
      const a = answers?.supplies?.[s.k] || {};
      const qty = parseFloat(s.qty);
      return (a.ce !== undefined && a.ce !== '' && !isNaN(qty) && Number(a.ce) < qty);
    }).length;
  }
  return n;
};

// Fecha de vencimiento → Date (acepta 'YYYY-MM' tomando el último día del mes)
export const expiryDate = (v) => {
  if (!v) return null;
  if (/^\d{4}-\d{2}$/.test(v)) {
    const [y, m] = v.split('-').map(Number);
    return new Date(y, m, 0);
  }
  const d = new Date(`${v}T00:00:00`);
  return isNaN(d) ? null : d;
};

export const daysUntil = (v) => {
  const d = expiryDate(v);
  if (!d) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
};

export const fmtDate = (iso) => {
  if (!iso) return '';
  if (/^\d{4}-\d{2}$/.test(iso)) { const [y, m] = iso.split('-'); return `${m}/${y}`; }
  const [y, m, d] = String(iso).split('T')[0].split('-');
  return d ? `${d}/${m}/${y}` : iso;
};

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
