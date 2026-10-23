// Planos de evacuación y elementos de emergencia por base.
// Los símbolos se detectaron automáticamente del plano original (PDF de Illustrator)
// y sirven de guía para ubicar cada elemento cargado en la app.
// x / y: posición relativa (0 a 1) sobre la imagen.

export const BASE_PLANS = {
  'Neuquén': {
    title: 'Plano de Evacuación y Elementos de Emergencia · Base Regional Neuquén',
    image: '/planos/neuquen.webp',
    width: 1400,
    height: 3806,
    symbols: [
      {id: "nqn-E01", type: "EXTINTOR", label: "E1", x: 0.2754, y: 0.1233, cap: "5"},
      {id: "nqn-E02", type: "EXTINTOR", label: "E2", x: 0.4454, y: 0.1233, cap: "5"},
      {id: "nqn-E03", type: "EXTINTOR", label: "E3", x: 0.5019, y: 0.1441, cap: "5"},
      {id: "nqn-E04", type: "EXTINTOR", label: "E4", x: 0.5019, y: 0.1907, cap: "5"},
      {id: "nqn-E05", type: "EXTINTOR", label: "E5", x: 0.2732, y: 0.2202, cap: "5"},
      {id: "nqn-E06", type: "EXTINTOR", label: "E6", x: 0.3169, y: 0.2202, cap: "5"},
      {id: "nqn-E07", type: "EXTINTOR", label: "E7", x: 0.4594, y: 0.2202, cap: "5"},
      {id: "nqn-L01", type: "LAVAOJOS", label: "L1", x: 0.2839, y: 0.2388},
      {id: "nqn-E08", type: "EXTINTOR", label: "E8", x: 0.3833, y: 0.2585, cap: "5"},
      {id: "nqn-E09", type: "EXTINTOR", label: "E9", x: 0.3836, y: 0.2735, cap: "5"},
      {id: "nqn-K01", type: "KIT_DERRAMES", label: "K1", x: 0.2565, y: 0.2947},
      {id: "nqn-E10", type: "EXTINTOR", label: "E10", x: 0.3449, y: 0.2935, cap: "5"},
      {id: "nqn-E11", type: "EXTINTOR", label: "E11", x: 0.1974, y: 0.3417, cap: "5"},
      {id: "nqn-E12", type: "EXTINTOR", label: "E12", x: 0.5184, y: 0.3522, cap: "5"},
      {id: "nqn-E13", type: "EXTINTOR", label: "E13", x: 0.612, y: 0.3672, cap: "5"},
      {id: "nqn-L02", type: "LAVAOJOS", label: "L2", x: 0.1971, y: 0.3747},
      {id: "nqn-L03", type: "LAVAOJOS", label: "L3", x: 0.6966, y: 0.3916},
      {id: "nqn-E14", type: "EXTINTOR", label: "E14", x: 0.8007, y: 0.3868, cap: "5"},
      {id: "nqn-B01", type: "BOTIQUIN", label: "B1", x: 0.6955, y: 0.4043},
      {id: "nqn-E15", type: "EXTINTOR", label: "E15", x: 0.5725, y: 0.4247, cap: "5"},
      {id: "nqn-E16", type: "EXTINTOR", label: "E16", x: 0.1982, y: 0.4503, cap: "5"},
      {id: "nqn-E17", type: "EXTINTOR", label: "E17", x: 0.5184, y: 0.4503, cap: "5"},
      {id: "nqn-E18", type: "EXTINTOR", label: "E18", x: 0.8007, y: 0.4575, cap: "5"},
      {id: "nqn-E19", type: "EXTINTOR", label: "E19", x: 0.1642, y: 0.4894, cap: "5"},
      {id: "nqn-E20", type: "EXTINTOR", label: "E20", x: 0.5774, y: 0.501, cap: "10"},
      {id: "nqn-E21", type: "EXTINTOR", label: "E21", x: 0.1941, y: 0.5338, cap: "5"},
      {id: "nqn-E22", type: "EXTINTOR", label: "E22", x: 0.5178, y: 0.5328, cap: "5"},
      {id: "nqn-E23", type: "EXTINTOR", label: "E23", x: 0.5772, y: 0.5375, cap: "10"},
      {id: "nqn-E24", type: "EXTINTOR", label: "E24", x: 0.198, y: 0.6214, cap: "5"},
      {id: "nqn-E25", type: "EXTINTOR", label: "E25", x: 0.5154, y: 0.6214, cap: "5"},
      {id: "nqn-E26", type: "EXTINTOR", label: "E26", x: 0.4094, y: 0.6433, cap: "5"},
      {id: "nqn-L04", type: "LAVAOJOS", label: "L4", x: 0.4473, y: 0.6436},
      {id: "nqn-E27", type: "EXTINTOR", label: "E27", x: 0.3248, y: 0.6494, cap: "5"},
      {id: "nqn-E28", type: "EXTINTOR", label: "E28", x: 0.3677, y: 0.6692, cap: "5"},
      {id: "nqn-B02", type: "BOTIQUIN", label: "B2", x: 0.2567, y: 0.6787},
      {id: "nqn-E29", type: "EXTINTOR", label: "E29", x: 0.3641, y: 0.6924, cap: "5"},
      {id: "nqn-D01", type: "DUCHA", label: "D1", x: 0.4003, y: 0.6929},
      {id: "nqn-E30", type: "EXTINTOR", label: "E30", x: 0.4948, y: 0.6877, cap: "10"},
      {id: "nqn-E31", type: "EXTINTOR", label: "E31", x: 0.0972, y: 0.7206, cap: "10"},
      {id: "nqn-E32", type: "EXTINTOR", label: "E32", x: 0.1936, y: 0.741, cap: "5"},
      {id: "nqn-L05", type: "LAVAOJOS", label: "L5", x: 0.1966, y: 0.7542},
      {id: "nqn-E33", type: "EXTINTOR", label: "E33", x: 0.5365, y: 0.7538, cap: "5"},
      {id: "nqn-E34", type: "EXTINTOR", label: "E34", x: 0.5697, y: 0.7466, cap: "5"},
      {id: "nqn-E35", type: "EXTINTOR", label: "E35", x: 0.1936, y: 0.8196, cap: "5"},
      {id: "nqn-E36", type: "EXTINTOR", label: "E36", x: 0.5365, y: 0.8196, cap: "5"},
      {id: "nqn-L06", type: "LAVAOJOS", label: "L6", x: 0.4226, y: 0.8437},
      {id: "nqn-E37", type: "EXTINTOR", label: "E37", x: 0.4561, y: 0.8433, cap: "5"},
      {id: "nqn-E38", type: "EXTINTOR", label: "E38", x: 0.2004, y: 0.8641, cap: "5"},
      {id: "nqn-D02", type: "DUCHA", label: "D2", x: 0.514, y: 0.8558},
      {id: "nqn-E39", type: "EXTINTOR", label: "E39", x: 0.0972, y: 0.8699, cap: "10"},
      {id: "nqn-B03", type: "BOTIQUIN", label: "B3", x: 0.4874, y: 0.8777},
      {id: "nqn-E40", type: "EXTINTOR", label: "E40", x: 0.5178, y: 0.8778, cap: "CO2"},
      {id: "nqn-E41", type: "EXTINTOR", label: "E41", x: 0.3913, y: 0.9009, cap: "5"},
      {id: "nqn-E42", type: "EXTINTOR", label: "E42", x: 0.2644, y: 0.913, cap: "5"},
      {id: "nqn-B04", type: "BOTIQUIN", label: "B4", x: 0.2996, y: 0.9124},
      {id: "nqn-E43", type: "EXTINTOR", label: "E43", x: 0.5228, y: 0.909, cap: "5"},
    ],
  },
};

// Datos sugeridos al dar de alta un elemento desde un símbolo del plano
export const symbolDefaults = (sym) => {
  if (sym.type === 'EXTINTOR') {
    if (sym.cap === 'CO2') return { tipo: 'CO2', clase: 'BC', capacidad: '' };
    return { tipo: 'PQS', clase: 'ABC', capacidad: sym.cap || '' };
  }
  return {};
};
