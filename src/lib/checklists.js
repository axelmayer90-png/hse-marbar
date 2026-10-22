// Checklists de inspección SSA (generado a partir de las planillas Excel de MARBAR).
// RG.SSA.06.AR Fluidos (rev 02) y RG.SSA.07.AR Control de Sólidos (rev 01).

export const CHECKLISTS = {
  FLUIDOS: {
    type: 'FLUIDOS',
    code: 'RG.SSA.06.AR',
    title: 'Inspección SSA Servicio de Fluidos',
    short: 'Fluidos',
    rev: 'Rev: 02 - Fecha: 15/11/2025',
    scale: [
      { k: 'C', label: 'C', name: 'Conforme', kind: 'ok' },
      { k: 'NC', label: 'NC', name: 'No conforme', kind: 'bad' },
      { k: 'NA', label: 'N/A', name: 'No aplica', kind: 'na' },
    ],
    references: 'C: CONFORME     NC: NO CONFORME     N/A: NO APLICA',
    commentLabel: 'Comentarios',
    headerFields: [
      { k: 'sede', label: 'Sede' },
      { k: 'operadora', label: 'Operadora' },
      { k: 'supervisor', label: 'Supervisor' },
      { k: 'personal', label: 'Inyeccionista/s' },
    ],
    extras: [
      { k: 'charla', label: 'Charla / difusión' },
      { k: 'mejoras', label: 'Oportunidades de mejora' },
    ],
    sections: [
  {
    "id": "f1",
    "label": "Montaje de trailer y sistema antivuelco",
    "block": "Trailer vivienda",
    "items": [
      "1.Estacas",
      "2. Tensores",
      "3. Sujetacables",
      "4. Cáncamos",
      "5. Estabilizadores (Extensión, manivelas y seguros)",
      "6. Cuñas",
      "7. Delimitación de senda peatonal"
    ]
  },
  {
    "id": "f2",
    "label": "Señalización de tránsito",
    "block": "Trailer vivienda",
    "items": [
      "8.Cintas reflectivas laterales",
      "9. Cintas reflectivas traseras"
    ]
  },
  {
    "id": "f3",
    "label": "Iluminación exterior",
    "block": "Trailer vivienda",
    "items": [
      "10. Luces reglamentarias",
      "11. Reflectores"
    ]
  },
  {
    "id": "f4",
    "label": "Ruedas",
    "block": "Trailer vivienda",
    "items": [
      "12. Neumáticos (dibujo; inflado)",
      "13. Esparragos y tuercas (al menos 3 filetes)"
    ]
  },
  {
    "id": "f5",
    "label": "Sistema de remolque",
    "block": "Trailer vivienda",
    "items": [
      "14. Lanza (manijas de agarre seguro color verde)",
      "15. Resorte",
      "16. Enganche (color rojo)",
      "17. Ficha de acople de aire",
      "18. Ficha de acople de luces (7 pines)"
    ]
  },
  {
    "id": "f6",
    "label": "Escalera de ingreso",
    "block": "Trailer vivienda",
    "items": [
      "19. Peldaños",
      "20. Pasamanos",
      "21. Rodapies",
      "22. Baranda intermedia",
      "23. Tinteros",
      "24. Pernos de vinculación de barandas",
      "25. Piso de descanso",
      "26. Sistema rebatible"
    ]
  },
  {
    "id": "f7",
    "label": "Sistema puesta a tierra",
    "block": "Trailer vivienda",
    "items": [
      "27. Jabalina (Suelo firme, estado)",
      "28. Morseto",
      "29. Terminal",
      "30. Cable",
      "31. Ajuste de terminal"
    ]
  },
  {
    "id": "f8",
    "label": "Sistema de antena",
    "block": "Trailer vivienda",
    "items": [
      "32. Canastilla de acceso",
      "33. Mástil telescopico (pasadores, seguros)"
    ]
  },
  {
    "id": "f9",
    "label": "Tanque de agua en campamento",
    "block": "Trailer vivienda",
    "items": [
      "34. Estado de tanque de pvc y estructura de metal",
      "35.Cáncamos para izaje (estado/certificacion)",
      "36. Conexiones (caños PVC, uniones, perdidas)",
      "37. Cartel de indicacion de agua almacenada; contencion y peso para izaje"
    ]
  },
  {
    "id": "f10",
    "label": "Sistema cloacal",
    "block": "Trailer vivienda",
    "items": [
      "38. Conexiones (caños PVC, uniones, perdidas)",
      "39. Delimitación de pozo septico (cadenas, pies de estacas)"
    ]
  },
  {
    "id": "f11",
    "label": "Residuos",
    "block": "Trailer vivienda",
    "items": [
      "40. Reciepientes según clasificación (estado)",
      "41. Bolsas según clasificacion (colores, estado)",
      "42. Tapas de los recipientes (estado, sujeción)",
      "43.Cartelería de clasificación de residuos",
      "44. Verificación de la clasificación el momento de la inspección"
    ]
  },
  {
    "id": "f12",
    "label": "Sistema eléctrico",
    "block": "Trailer vivienda",
    "items": [
      "45. Carteleria de indentificación de riesgo electrico en tableros",
      "46. Consigna de tablero electrico (candado; etiqueta)",
      "47. Protección contra contactos directos (acrilico; rotulado)",
      "48. Pllano unifilar en el interior del tablero",
      "49. Estado de conectores y enchufes",
      "50. Estado de termicas",
      "51. Disyuntor diferencial",
      "52. Contunidad de PAT en tapa de tablero"
    ]
  },
  {
    "id": "f13",
    "label": "Cartelería seguridad",
    "block": "Trailer vivienda",
    "items": [
      "53. Riesgo alta temperatura en Anafe",
      "54. Riesgo eléctrico",
      "55. Agua no apta para consumo humano en canillas"
    ]
  },
  {
    "id": "f14",
    "label": "Elementos de respuesta a la emergencia",
    "block": "Trailer vivienda",
    "items": [
      "56. Plano evacuación de tráiler",
      "57. Rol de llamadas MARBAR",
      "58/. Rol de llamadas Cliente",
      "59. Botiquín de primeros auxilios (señalización, registrol de control actualizado, elementos vigentes)",
      "60. Extintor interior ABC 5kg (señalización, registro de control, estado)",
      "61. Extintor exterior ABC 10kg (señalización, registro de control, estado)",
      "62. Detectores de humo (funcionamiento)",
      "63. Luces de emergencia (funcionamiento)",
      "64. Martillos de emergencia (en cada ventana,soporte)",
      "65. Escalera de emergencia (seguros)"
    ]
  },
  {
    "id": "f15",
    "label": "Iluminación interior",
    "block": "Trailer vivienda",
    "items": [
      "66. Luminarias (estado, funcionamiento)"
    ]
  },
  {
    "id": "f16",
    "label": "Documentación",
    "block": "Trailer vivienda",
    "items": [
      "67. Plano unifilar electrico",
      "68. Verificación de disyuntores",
      "68. Medición y registro de PAT (por pozo)",
      "69. Analisis bacteriologico de agua envasada",
      "70. Analisis fisicoquímico de agua envasada",
      "71. Estudio de estabilidad de trailer",
      "72. Estudio de medición de iluminación vigente (anual)",
      "73. Estudio de medición de ruido vigente (anual)",
      "74. Estudio de carga de fuego de trailer vigente (anual)",
      "75. VTV de trailer (vigencia)",
      "76. Seguro de trailer (vigencia)",
      "77. Certificado RUTA",
      "78. FDS de productos quimicos",
      "79. Politicas MARBAR exhibidas (SSA, Detención de tareas, Alcohol y Drogas)",
      "80. Politicas CLIENTE (acordar con cada operadora)",
      "81. Checklist de verificacion de estado de trailer (de pozo inspeccionado/firmado)",
      "82. Checklist de instalacion de estado de trailer (de pozo inspeccionado/firmado)"
    ]
  },
  {
    "id": "f17",
    "label": "Difusiones",
    "block": "Trailer vivienda",
    "items": [
      "83. Difusiones SSA MARBAR (ultimas en buzon de seguridad)",
      "84. Difusiones SSA CLIENTE (ultimas en buzon de seguridad)"
    ]
  },
  {
    "id": "f18",
    "label": "Cartelería obligatoria",
    "items": [
      "85.Politicas MARBAR (3) - CLIENTE - Estado / Vigencia -¿El personal conoce el contenido?",
      "86. Rol de llamadas MARBAR- CLIENTE -Estado / Vigencia -¿El personal conoce el contenido?",
      "87. ART -Estado / Vigencia -¿El personal conoce el contenido?",
      "88. SGA -Estado / Vigencia -¿El personal conoce el contenido?",
      "89. Puntos Ciegos -Estado / Vigencia -¿El personal conoce el contenido?",
      "90. Reglas de Vida/ Reglas de Oro.",
      "91. SOP - Estado / Vigencia -¿El personal conoce su contenido? Chequear el cumplimiento de la cantidad solicitada por inyeccionista",
      "92. Lay Out Rutas de evacuación.",
      "93. Diagrama de Alarma de Evacuación del Equipo perforador.",
      "94. Lay Out de areas clasificadas.",
      "95. Buzon de alertas - Ultima difusión MARBAR y CLIENTE - Se encuentra RG.SGI.01.G de difusión?"
    ]
  },
  {
    "id": "f19",
    "label": "Documentación auditable",
    "items": [
      "96. ATS/ IPCR/ IPER- Se encuentra registro diario? Desarrolle contenido.",
      "97. PERMISO DE TRABAJO - Chequear confección- cierre y detallar registros asociados de los ultimos 3.",
      "98. Simulacros- RG.SGI.15.G - Fecha de realización y temática.",
      "99. Protocolo de Medicion de puesta a tierra y verificación de disyuntores.",
      "100. Carga de Fuego de trailer/cabina/equipo.",
      "101. Calculo de vuelco de trailer/cabina.",
      "102. Medición de Ruido.",
      "103. Analisis bactereologico/fisico quimico.",
      "104. Medición de Iluminación.",
      "105. Registros de SSA (Extintores/lavaojos/botiquin/ducha de emergencia/kit de derrame/estación de bloqueo/estación de contigencia/ hidrolavadora/inspección de herramientas/manipulador telescopico, etc).",
      "106. RG.SSA.05.AR- RG.SSA.17.G de trailer vivienda-¿Se encuentran realizados al inicio de Pozo?",
      "107. El personal conoce como ingresar al Sistema de Gestión - Portal Web?",
      "108. El personal conoce rutas de acceso a los Procedimientos Operativos del servicio de SFP? Desarrollar contenido."
    ]
  },
  {
    "id": "f21",
    "label": "Instalación y equipamiento",
    "block": "Laboratorio",
    "items": [
      "109. FDS Reactivos de laboratorio",
      "110. Etiquetado SGA de Reactivos de laboratorio",
      "111. Campana de extraccion (estado general)",
      "112. Cerramiento hermetico de campana de extracción",
      "113. Señalización altas temperaturas en campana de extracción",
      "114. eñalización emision de vapores en campana de extracción",
      "115. Señalización uso de EPP",
      "116. Kit para la contencion de derrames",
      "117. Control del kit de contencion de derrames",
      "118. Calibración de instrumentos de laboratorio",
      "119. Clasificación de residuos peligrosos",
      "120. Contención de efluentes de laboratorio (estado, identificación)",
      "121. Detector de humo (funcionamiento)",
      "122. Extintor ABC 5kg (señalización, registro de control, estado)",
      "123. Lavaojos (señalización, registro de control, estado)",
      "124. Luces de emergencia (funcionamiento)",
      "125. Tomacorrientes y enchufes (estado)",
      "126. Luminarias (estado)",
      "127. Orden y limpieza"
    ]
  },
  {
    "id": "f22",
    "label": "Detección de sulfhídrico",
    "block": "Laboratorio",
    "items": [
      "128. Detector monogas (según cantidad de personal operativo)",
      "129. Certificado de calibración de detector monogas",
      "130. Capacitacion de uso de detector monogas",
      "131. Manga de viento (estado)"
    ]
  },
  {
    "id": "f24",
    "label": "Espacio físico de almacenamiento",
    "block": "Almacenamiento de productos químicos",
    "items": [
      "132. Delimitación de área",
      "133. Nylon de aislación",
      "134. Orden y limpieza",
      "135. Recipiente de acopio de soda caustica (estado, limpieza). Carteleria SGA",
      "136. Recipiente de acopio de MARFLO (estado, limpieza). Carteleria SGA"
    ]
  },
  {
    "id": "f25",
    "label": "Contención de derrames",
    "block": "Almacenamiento de productos químicos",
    "items": [
      "137. Kit para contención de derrames",
      "138. Recipiente de contención de productos líquidos en bidones (certificación de cáncamos, estado, identificación de capacidad y peso)",
      "139. Recipiente de contención de productos líquidos en cubitanques (certificación de cáncamos, estado, identificación de capacidad y peso)"
    ]
  },
  {
    "id": "f26",
    "label": "Residuos",
    "block": "Almacenamiento de productos químicos",
    "items": [
      "140. Recipiente de acopio de envases vaiós de productos minerales (estado, identificación)",
      "141. Tapa del recipiente de acopio de envases vacíos de productos minerales",
      "142. Recipiente de acopio de residuos cáusticos (estado, identificación, bolsa roja)",
      "143. Tapa del recipiente de acopio de residuos cáusticos",
      "144. Recipientes de acopio de residuos peligrosos (estado, identificación según corriente",
      "145. Tapa de recipientes de acopio de residuos peligrosos"
    ]
  },
  {
    "id": "f27",
    "label": "Comunicación de riesgos",
    "block": "Almacenamiento de productos químicos",
    "items": [
      "146. Cartelería de identificación de riesgos de productos químicos",
      "147. Cartel de compatibilidades",
      "148. Etiquetado SGA de cada producto químico",
      "149. FDS de productos químicos en sitio de adición",
      "150. FDS de productos químicos en sitio de acopio"
    ]
  }
],
  },
  CDS: {
    type: 'CDS',
    code: 'RG.SSA.07.AR',
    title: 'Inspección de equipamiento de Control de Sólidos',
    short: 'Control de Sólidos',
    rev: 'Rev: 01 - Fecha: 03/11/25',
    scale: [
      { k: 'B', label: 'B', name: 'Bien', kind: 'ok' },
      { k: 'NA', label: 'N/A', name: 'No aplica', kind: 'na' },
      { k: 'OBS', label: 'OBS', name: 'Observación', kind: 'bad' },
    ],
    references: 'B: BIEN     N/A: NO APLICA     OBS: DETALLE DE OBSERVACIÓN',
    commentLabel: 'Detalle de observación',
    headerFields: [
      { k: 'operadora', label: 'Operadora' },
      { k: 'supervisor', label: 'Supervisor' },
      { k: 'personal', label: 'Operadores' },
    ],
    extras: [],
    sections: [
  {
    "id": "s1_1",
    "label": "1.1 Montaje",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Montaje de trailer vivienda- Sistema antivuelco (Estacas- tensores - sujetacables - cáncamos).",
      "b) Sistema antivuelco (Extensión de Estabilizadores- Base de estabilizadores- manibelas, seguros y cuñas).",
      "c) Delimitación de senda peatonal."
    ]
  },
  {
    "id": "s1_2",
    "label": "1.2 Iluminación exterior",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Luces y reflectores exteriores."
    ]
  },
  {
    "id": "s1_3",
    "label": "1.3 Ruedas",
    "block": "1. Trailer vivienda",
    "items": [
      "b) Estado Gral de Neumaticos (correcta - esparragos y tuercas)"
    ]
  },
  {
    "id": "s1_4",
    "label": "1.4 Sistema de remolque",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Estado Gral de sistema de remolque ( lanza- resorte - ficha de de aire - ficha de luces- soporte de lanza y ojal de engache).",
      "b) ¿Posse manijas de agarre seguro en lanza ? ¿Estan pintadas de color verde?"
    ]
  },
  {
    "id": "s1_5",
    "label": "1.5 Elementos de respuesta ante emergencias",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Plano de evacuación de Trailer vivienda.",
      "b) Botiquin de primeros auxilios.",
      "c) Extintor interno/externo de 5/10 KG ABC.",
      "d) Detector de humo /Alarma luminica y sonara.",
      "e) Luces de emergencia",
      "f) Martillo de emergencia.",
      "g) Escalera de emergencia (Seguros R)."
    ]
  },
  {
    "id": "s1_6",
    "label": "1.6 Escalera de ingreso",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Estado Gral. De Escalera de ngreso (peldaños, pasamanos, baranda intermedia, tinteros, pernos de vinculación de barandas - piso descanso- sistema rebatible ).",
      "b) Estado Gral. De Pisaderas (vinculadas o sueltas).",
      "c) SISTEMA PAT Estado Gral. De Puesta a Tierra (Suelo firme- jabalina- morceto- terminal- bulon y cable)."
    ]
  },
  {
    "id": "s1_7",
    "label": "1.7 Residuos",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Estado Gral de Recipientes de clasificación de residuos (Integridad del recipiente- Carteleria de clafisificación - Tapas- Bolsas según clasificación).",
      "b) ¿La verficación de clasificación de residuos es adecuada?"
    ]
  },
  {
    "id": "s1_8",
    "label": "1.8 Sistema eléctrico",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Estado gral de tablero eléctrico Externo (puertas- visagras - cerraduras - carteleria de riesgo y sistema de consigna)",
      "b) Estado gral de tablero eléctrico Interno (Conectores y enchufes - Protección de contactos directos- termicas /disyuntores).",
      "c) Conexión a PAT (estado de terminal, bulón y cable)."
    ]
  },
  {
    "id": "s1_9",
    "label": "1.9 Sistema de antenas",
    "block": "1. Trailer vivienda",
    "items": [
      "a) Estado gral. de Antenas (Mástil telescopico- Fijación y eslinga de sujeción)."
    ]
  },
  {
    "id": "s1_10",
    "label": "1.10 Sistema cloacal",
    "block": "1. Trailer vivienda",
    "items": [
      "a) ¿Se encuentra conectado y delimitado?"
    ]
  },
  {
    "id": "s2",
    "label": "2 Cabina control de sólidos",
    "items": [
      "a) Identificación de cabina (inventario)",
      "b) Identificacion de peso de cabina.",
      "c) Ingreso a cabina (pisaderas)",
      "d) Conexión a PAT (estado de terminal, bulón y cable).",
      "e) Fijacion de antena.",
      "f) Estado general (piso - paredes- puertas- cerraduras antipanico - barral)",
      "g) Detector de humo /Alarma luminica y sonara.",
      "h) Extintor ABC 5/10 KG.",
      "i) Luz de emergencia.",
      "j) Tablero electrico - Estado gral (barrera de protección- rotulado- carteleria de identificación - pare de emergencia - plano unifilar).",
      "K) Silla ergonómica"
    ]
  },
  {
    "id": "s2_1",
    "label": "2.1 Laboratorio",
    "items": [
      "a) FDS de reactivos quimicos de laboratorio.",
      "b) Etiquetado de reactivos quimicos.",
      "c) Campana de extracción (Cerramiento - carteleria de emisión de vapores, altas temperaturas y uso de EPP).)",
      "d) Funcionamiento de extractor.",
      "e) Protector contra altas temperaturas para celdas de retortas.",
      "f) Kit para la contención de derrames.",
      "g) Estado de instrumentos de laboratorio.",
      "h) Calibración de instrumentos de laboratorio.",
      "i) Contención de efluentes de laboratorio.",
      "j) DETECTOR MONOGAS SH2 (según cantidad de personal operativo) ¿Se encuentran las certificaciones de calibración?",
      "k) ¿ Se encuentran los registros de capacitación de uso de detectores?"
    ]
  },
  {
    "id": "s2_2",
    "label": "2.2 Cartelería obligatoria",
    "items": [
      "a) Politicas MARBAR (3) - CLIENTE - Estado / Vigencia -¿El personal conoce el contenido?",
      "b) Rol de llamadas MARBAR- CLIENTE -Estado / Vigencia -¿El personal conoce el contenido?",
      "c) ART -Estado / Vigencia -¿El personal conoce el contenido?",
      "d) SGA -Estado / Vigencia -¿El personal conoce el contenido?",
      "e) Puntos Ciegos -Estado / Vigencia -¿El personal conoce el contenido?",
      "f) Reglas de Vida/ Reglas de Oro.",
      "g) SOP - Estado / Vigencia -¿El personal conoce su contenido? Chequear el cumplimiento de la cantidad solicitada por operador.",
      "h) Lay Out Rutas de evacuación.",
      "i) Diagrama de Alarma de Evacuación del Equipo perforador.",
      "j) Lay Out de areas clasificadas.",
      "k) Buzon de alertas - Ultima difusión MARBAR y CLIENTE - Se encuentra RG.SGI.01.G de difusión?"
    ]
  },
  {
    "id": "s2_3",
    "label": "2.3 Documentación auditable",
    "items": [
      "a) ATS/ IPCR/ IPER- Se encuentra registro diario? Desarrolle contenido.",
      "b) PERMISO DE TRABAJO - Chequear confección- cierre y detallar registros asociados de los ultimos 3.",
      "c) Simulacros- RG.SGI.15.G - Fecha de realización y temática.",
      "d) Protocolo de Medicion de puesta a tierra y verificación de disyuntores.",
      "e) Carga de Fuego de trailer/cabina/equipo.",
      "f) Lay out de extintores - ¿Se respeta ubicación?",
      "g) Calculo de vuelco de trailer/cabina.",
      "h) Medición de Ruido.",
      "i) Analisis bactereologico/fisico quimico.",
      "j) Medición de Iluminación.",
      "k) Registros de SSA (Extintores/lavaojos/botiquin/ducha de emergencia/kit de derrame/estación de bloqueo/estación de contigencia/ hidrolavadora/inspección de herramientas/manipulador telescopico, etc).",
      "l) RG.SSA.05.AR- RG.SSA.17.G de trailer vivienda-¿Se encuentran realizados al inicio de Pozo?",
      "m) Fichas de seguridad de Productos quimicos.",
      "n) El personal conoce como ingresar al Sistema de Gestión - Portal Web?",
      "ñ) El personal conoce rutas de acceso a los Procedimientos Operativos del servicio de CDS ? Desarrollar contenido.",
      "o) Lay Out de bloqueo y etiquetado."
    ]
  },
  {
    "id": "s3",
    "label": "3 Pileta preparadora",
    "items": [
      "a) Número de pileta y capacidad de almacenamiento (m3).",
      "b) Estado de escaleras de ingreso (peldaños- material antideslizante- pernos y seguros de vinculación).",
      "c) Estado Gral. de BARANDAS (fijación,vinculación,rodapies, pernos y seguros R).",
      "c) Estado Gral. de PISO SUPERIOR (material desplegable/desniveles ).",
      "d) TAPAS ¿Se encuentran pintadas de color amarillo con franjeado alrededor del contorno real de 10 cm. Aprox.?",
      "e) ¿Los puntos de agarre (manijas) se encuentran identificadas de color verde?",
      "f) Desniveles identificados o con protección.",
      "g) Sistema de consignación (bloqueo)",
      "h) Estado de bisagras y pernos.",
      "i) Extintor ABC 10 KG.",
      "j) Orden y limpieza Gral."
    ]
  },
  {
    "id": "s3_1",
    "label": "3.1 Luminarias",
    "items": [
      "a) Estado general de sistema rebatible, perno y seguros.",
      "b) Conexión a PAT (estado de terminal, bulón y cable).",
      "c) Estado de flexibles de conexión electrica? (APE)",
      "d) Buloneria (total o parcial).",
      "e) ¿Posee Eslinga de sujecion/retención y ojales en su estructura?"
    ]
  },
  {
    "id": "s3_2",
    "label": "3.2 Removedores",
    "items": [
      "a) Partes moviles identificadas.",
      "b) Conexión a PAT (estado de terminal, bulón y cable).",
      "c) Se observan perdidas de fluidos?",
      "d) Estado Gral. de cable de alimentación eléctrica y prensa cable.",
      "e) Estado y material de flexible de conexión electrica.",
      "f) Cancamos de izaje.",
      "g) Buloneria (total o parcial).",
      "h) Tablero eléctrico (carteleria de identificación de riesgo- botenera encendido/apagado- sistema de bloqueo)."
    ]
  },
  {
    "id": "s3_3",
    "label": "3.3 Mesón toma muestras",
    "items": [
      "a) Posee barrera de contención en su contorno para evitar la caida de objetos en altura?",
      "b) Posee sistema de descarga de fluidos.",
      "c) Se encuentra vinculado a la estructura de la pileta?"
    ]
  },
  {
    "id": "s3_4",
    "label": "3.4 Embudo",
    "items": [
      "a) Zona de acceso - Estado gral de escaleras-/pisaderas.",
      "b) Estado de mesa de apoyo para agregado de productos quimicos."
    ]
  },
  {
    "id": "s3_5",
    "label": "3.5 Tablero eléctrico (piletas)",
    "items": [
      "a) Tablero eléctrico (carteleria de identificación de riesgo- botenera encendido/apagado- sistema de bloqueo).",
      "b) Fijacion de tablero.",
      "c) Buloneria (completa o parcial)",
      "d) Estado Gral. de cable de alimentación eléctrica y prensa cable.",
      "e) Conexión a PAT (estado de terminal, bulón y cable).",
      "f) Punto de bloqueo.",
      "g) Estado de fichas/conexiones."
    ]
  },
  {
    "id": "s4",
    "label": "4 Tanque de combustible",
    "items": [
      "a) Identificación cubicación del tk y Peso de carga. Identificación del propietario.",
      "b) Identificación de cubicación de bandeja de contención de tanque de combustible.",
      "c) Estado gral. De mangueras, espigas y acoples.",
      "d) Prueba de estanqueidad - Certificación",
      "e) Estado gral. De Bandeja de contención y capacidad (110% del total).",
      "f) Escala númerica de nivel y estado de manguera.",
      "g) Extintor ABC 10 kg.",
      "h) Estado Gral. de Tablero Antiexplosivo (Botonera/pulsadores ,rotulado sistema de bloqueo y pare de emergencia).",
      "i) Estado gral. De cable de alimentación y prensa cable.",
      "j) Conexión a PAT (estado de terminal, bulón y cable).",
      "k) Sistema de bloqueo - Punto de bloqueo.",
      "l) Caudalímetro - Certificación.",
      "m) Electro bomba sutidora de combustible - Posee bandeja de contención?",
      "n) Estado de pistola , punto de apoyo y sistema de consignación?",
      "ñ) Carteleria de Riesgo , SGA y recomendaciones de carga .",
      "o) Sistema de izaje (Cáncamos /Sobre patín).",
      "p) Estado Gral. de Escalera de acceso ( Barandas, fijación,vinculación,rodapies, pernos y seguros R)."
    ]
  },
  {
    "id": "s5",
    "label": "5 Tanque de cloruro",
    "items": [
      "a) Identificacion de peso.",
      "b) Prueba de estanqueidad - Certificación",
      "c) Bomba de trasvase de fluido- Posee bandeja de contención?",
      "d) Escala númerica de nivel y estado de manguera.",
      "e) Escalera de ingreso (Apta para su uso /bloqueada para su uso).",
      "f) Estado de conexiones (total de esparragos- 3 filetes por lado).",
      "g) Carteleria de Riesgo , SGA, EPP- capacidad de almacenamiento.",
      "h) Lavaojos portatil"
    ]
  },
  {
    "id": "s6",
    "label": "6 Generador",
    "items": [
      "a) Identificacion de peso.",
      "b) Estado gral. De Cabina modular inzonara de grupo electrogeno (puertas, visagras, cerraduras, rejillas de escape y arrestrallama).",
      "c) Estado gral. De Bandeja de contención (cancamos de izaje).",
      "d) Estado gral. De Berma de contención (tamaño adecuado).",
      "e) Conexión a PAT (estado de terminal, bulón y cable).",
      "f) Sistema de anclaje de cabina modular inzonara de grupo electrogeno ¿Cuenta con buloneria completa y certificación de IND?",
      "g) Sistema de izaje (Cáncamos /Sobre patín).",
      "h) Estado de conexión a bornera y proteccion de goma anticontacto.",
      "i) Extintor ABC 10 kg.",
      "j) ¿Posee perdidas de lubricantes?",
      "k) Carteleria (pare de emergencia y riesgo electrico /Rotulado)",
      "l) Orden y limpieza Gral."
    ]
  },
  {
    "id": "s7",
    "label": "7 Torres de iluminación",
    "items": [
      "a) Estado gral. De la cabina del motor (puertas, visagras, cerraduras, rejillas de escape y arrestrallama).",
      "b) Panel de comandos (Botonera/pulsadores de encendido / apagado y pare de emergencia).",
      "c) Conexión a PAT (jabalina, estado de terminal, bulón y cable).",
      "d) Mástil retráctil (sistema de malacate, pernos y seguros).",
      "e) Luminarias poseen sujeción y eslingas de retención.",
      "f) Sistema de anclaje (patas estabilizadoras, total de buloneria , pernos y seguros).",
      "g) Sistema de remolque (lanza, cubiertas, buloneria, pernos y seguros).",
      "h ¿Se encuentran ubicadas a una Distancia de seguridad de 3 mts de fuentes inflamables?",
      "i) ¿Se encuentra extintor en zona ?",
      "j) ¿Posee perdidas de lubricantes?",
      "k) Carteleria de Riesgo.",
      "l) Orden y limpieza Gral."
    ]
  },
  {
    "id": "s8",
    "label": "8 Bombas",
    "repeat": {
      "label": "Bomba",
      "max": 7
    },
    "items": [
      "a) Tablero eléctrico (carteleria de identificación de riesgo- Pulsadores encendido/apagado- Rotulado - Sistema de bloqueo- Pare de emergencia).",
      "b) Conexión a PAT (jabalina, estado de terminal, bulón y cable).",
      "c) Estado de cable de alimentación eléctrica (FICHA STECK ; PRENSA CABLE)",
      "d) Protección de partes móviles (completa/parcial).",
      "e) Protección de partes móviles, ¿Se encuentran pintadas de color amarillo?",
      "f) Buloneria /Tuercas/Arandelas (total /parcial)",
      "g) Esparragos - 3 filetes por lado.",
      "h) Estado Gral. De Bandeja de contención- Inspección visual de soldaduras.",
      "i) ¿Posee cancamos de izaje? ¿Se encuentran certificados (END)?",
      "j) Anclaje de fijación - Inspección visual de soldaduras - Buloneria (completa/parcial)",
      "k) ¿En la lineas se identifica el sentido flujo?",
      "l) ¿Posee eslingas de retención en expulsión?",
      "m) ¿Se observan perdidas de fluidos (aceite)?",
      "n) Estado Gral. de válvulas (manijas - esparragos y sellos).",
      "ñ) Estado de válvulas ¿PERMITE LA APERTURA Y CIERRE TOTAL?",
      "o) Estado de acoples de manguerotes (precinto- orejas - seguro \"R\", union a golpe).",
      "p) Carteleria de riesgo.",
      "q) Orden y Limpieza."
    ]
  },
  {
    "id": "s9",
    "label": "9 Zarandas",
    "items": [
      "a) Estado de escaleras de acceso (peldaños- material antideslizante- pernos y seguros de vinculación).",
      "b) Estado Gral. de Tablero Electrico (Botonera/pulsadores ,rotulado sistema de bloqueo y pare de emergencia).",
      "c) Conexión a PAT (jabalina, estado de terminal, bulón y cable).",
      "d) ¿Posee cancamos de izaje? ¿Se encuentran certificados (END)?",
      "e) Estado Gral. De Bandeja de contención- Inspección visual de soldaduras.",
      "f) Anclaje de fijación - Inspección visual de soldaduras - Buloneria (completa/parcial)",
      "g) Estado de válvulas ¿PERMITE LA APERTURA Y CIERRE TOTAL?",
      "h) Esparragos - 3 filetes por lado.",
      "i) Estado gral. De manguerotes.",
      "j) Estado de acoples de manguerotes (precinto- orejas - seguro \"R\", union a golpe).",
      "k) Estado gral. De cable de alimentación y prensa cable.",
      "l) Conexión a PAT (estado de terminal, bulón y cable).",
      "m) Sistema de bloqueo - Punto de bloqueo."
    ]
  },
  {
    "id": "s10",
    "label": "10 Unidad CDS",
    "items": [
      "a) PILETINES (estado general indicaciones de corrosión, filtraciones, superficies puntiagudas o cortantes)",
      "Estado de agitadores.",
      "b) Tapas de piletines.",
      "c) Estado de pisaderas/plataformas para agregado de producto.",
      "d) Bomba dosificadora (CONEXIONES / PROTECCIONES)",
      "e) Estado Gral. de válvulas (manijas - esparragos y sellos).",
      "f) Estado de válvulas ¿PERMITE LA APERTURA Y CIERRE TOTAL?",
      "g) Estado gral de manguerotes.",
      "h) Estado de acoples (precinto- orejas - ajuste).",
      "i) Estado gral de cañerias.",
      "j) Esparragos - 3 filetes por lado.",
      "k) Sistema de elevación de unidad (pernos y seguros pasadores)",
      "l) Comandos hidraulicos ¿Se observa perdida de aceite?",
      "m) Protección de comandos hidráulicos (partes móviles)",
      "n) Inspección visual de soldaduras.",
      "ñ) Estado gral. De bandejas pasa cables.",
      "o) Estado de cubiertas",
      "p) Estado de sistema hidraúlico",
      "q) Estado de sistema de iluminacion para circular.",
      "r) Carteleria de riesgo.",
      "s) Orden y Limpieza."
    ]
  },
  {
    "id": "s10_1",
    "label": "10.1 Luminarias",
    "items": [
      "a) Estado de luminarias.",
      "b) ¿Poseen eslingas anticaida?",
      "c) Sistema revatible (SOPORTE; FIJACIÓN; SEGURO",
      "d) Conexión de PAT (estado de terminal, bulón y cable).",
      "e) Linea APEX (Conexiones completas)."
    ]
  },
  {
    "id": "s10_2",
    "label": "10.2 Unidad CDS - Entrepiso / medio stand",
    "items": [
      "a) Estado General",
      "b) Inspección visual de soldaduras.",
      "c) Conexionado de pistones hidráulicos.",
      "d) Pérdida de fluidos en empaquetaduras por cilindro.",
      "e) Estado de Piso desplegable.",
      "f) Compuertas de piletas (Estado de pernos, visagras y seguros).",
      "g) Estado Gral. de BARANDAS ( fijación,vinculación,rodapies, pernos y seguros R).",
      "h) DESCARGAS SOLIDAS (sujeción - perno pasador y seguro)",
      "i) DESCARGAS LIQUIDAS (sujeción - perno pasador y seguro)",
      "j) Las descargas SOLIDAS/LIQUIDAS ¿Poseen sistema de sujeción fijos/eslingas o cadenas?",
      "k) ¿Los PVC son los adecuados, según procedimiento?",
      "l) Estado de canaletas.",
      "m) ¿Los soportes telescopicos se encuentran ubicados a no más de 3 mts de distancia?"
    ]
  },
  {
    "id": "s11",
    "label": "11 Decanters",
    "repeat": {
      "label": "Decanter",
      "max": 4
    },
    "items": [
      "a) Protección de partes móviles (completa/parcial).",
      "b) Protección de partes móviles, ¿Se encuentran pintadas de color amarillo?",
      "c) Anclaje de fijación - Inspección visual de soldaduras.",
      "d) ¿Posee cancamos de izaje? ¿Se encuentran certificados (END)?",
      "e) Buloneria.",
      "f) Estado de cable de alimentación y prensa.",
      "g) Pare de emergencia.",
      "h) Conexión a PAT (estado de terminal, bulón y cable).",
      "i) ¿Se observan pérdidas de fluidos?",
      "j) Feed tube (buloneria- conexiones -seguros).",
      "k) Eslingas de retención en manguerotes.",
      "l) Estado de Piso (material desplegable).",
      "m) ¿Se observan desniveles identificados y pintados?",
      "n) Carteleria de riesgo.",
      "o) Orden y Limpieza."
    ]
  },
  {
    "id": "s12",
    "label": "12 Fracktank",
    "repeat": {
      "label": "Fracktank",
      "max": 4
    },
    "items": [
      "a) Número de pileta y capacidad de almacenamiento (m3).",
      "b) Tablero eléctrico (carteleria de identificación de riesgo- pulsadores encendido/apagado- sistema de bloqueo).",
      "c) Conexión a PAT (estado de terminal, bulón y cable).",
      "d) Estado de escaleras de ingreso (peldaños- material antideslizante- pernos y seguros de vinculación).",
      "e) Estado Gral. de BARANDAS ( fijación,vinculación,rodapies, pernos y seguros R).",
      "f) Estado Gral. de PISO SUPERIOR (material desplegable/desniveles ).",
      "g) ¿Se encuentran pintadas de color amarillo con franjeado alrededor del contorno real de 10 cm. Aprox.?",
      "h) ¿Los puntos de agarre (manijas) se encuentran identificadas de color verde?",
      "i) Desniveles identificados o con protección.",
      "j) Sistema de consigna.",
      "k) Estado de bisagras y pernos.",
      "l) Estado gral. De Luminarias.",
      "m) Estado gral. De Removedores.",
      "n) Estado de cubiertas",
      "ñ) Estado de sistema hidraúlico",
      "o) Estado de sistema de iluminacion para circular.",
      "p) Extintor ABC 10 KG.",
      "q) Orden y limpieza."
    ]
  },
  {
    "id": "s13",
    "label": "13 Piletas de contingencia",
    "repeat": {
      "label": "Pileta de contingencia",
      "max": 2
    },
    "items": [
      "a) Número de pileta y capacidad de almacenamiento (m3).",
      "b) Tablero eléctrico (carteleria de identificación de riesgo- pulsadores encendido/apagado- sistema de bloqueo).",
      "c) Conexión a PAT (estado de terminal, bulón y cable).",
      "d) Estado de escaleras de ingreso (peldaños- material antideslizante- pernos y seguros de vinculación).",
      "e) Estado Gral. de BARANDAS ( fijación,vinculación,rodapies, pernos y seguros R).",
      "f) Estado Gral. de PISO SUPERIOR (material desplegable/desniveles ).",
      "g) ¿Se encuentran pintadas de color amarillo con franjeado alrededor del contorno real de 10 cm. Aprox.?",
      "h) ¿Los puntos de agarre (manijas) se encuentran identificadas de color verde?",
      "i) Desniveles identificados o con protección.",
      "j) Sistema de consigna.",
      "k) Estado de bisagras y pernos.",
      "l) Estado gral. De Luminarias.",
      "m) Estado gral. De Removedores.",
      "n) Extintor ABC 10 KG.",
      "o) Orden y limpieza."
    ]
  },
  {
    "id": "s14",
    "label": "14 Piletas auxiliares",
    "repeat": {
      "label": "Pileta auxiliar",
      "max": 7
    },
    "items": [
      "a) Número de pileta y capacidad de almacenamiento (m3).",
      "b) Tablero eléctrico (carteleria de identificación de riesgo- pulsadores encendido/apagado- sistema de bloqueo).",
      "c) Conexión a PAT (estado de terminal, bulón y cable).",
      "d) Estado de escaleras de ingreso (peldaños- material antideslizante- pernos y seguros de vinculación).",
      "e) Estado Gral. de BARANDAS ( fijación,vinculación,rodapies, pernos y seguros R).",
      "f) Estado Gral. de PISO SUPERIOR (material desplegable/desniveles ).",
      "g) ¿Se encuentran pintadas de color amarillo con franjeado alrededor del contorno real de 10 cm. Aprox.?",
      "h) ¿Los puntos de agarre (manijas) se encuentran identificadas de color verde?",
      "i) Desniveles identificados o con protección.",
      "j) Sistema de consigna.",
      "k) Estado de bisagras y pernos.",
      "l) Estado gral. De Luminarias.",
      "m) Estado gral. De Removedores.",
      "n) Extintor ABC 10 KG.",
      "o) Orden y limpieza."
    ]
  },
  {
    "id": "s15",
    "label": "15 Manifold",
    "repeat": {
      "label": "Manifold",
      "max": 2,
      "defaults": [
        "Piletas auxiliares",
        "Bajo zarandas"
      ]
    },
    "items": [
      "a) Estado Gral. de válvulas (manijas - esparragos y sellos).",
      "b) Estado de válvulas ¿PERMITE LA APERTURA Y CIERRE TOTAL?",
      "c) Estado de acoples de manguerotes (precinto- orejas - seguro \"R\", unión a golpe).",
      "d) Estado gral de manguerotes.",
      "e) Eslingas de retención en lineas de expulsión?",
      "f) Estado gral de cañerias y soporteria.",
      "g) Esparragos - 3 filetes por lado.",
      "h) ¿En la lineas se identifica el sentido flujo?",
      "i) ¿Se dispone de bandejas de contención de fluidos?"
    ]
  },
  {
    "id": "s16",
    "label": "16 Silos",
    "repeat": {
      "label": "Silo",
      "max": 2
    },
    "items": [
      "a) Estado de manguerotes.",
      "b) Estado de conexiones y soporteria.",
      "c) Esparragos - 3 filetes por lado.",
      "d) ESTADO DE VÁLVULAS DE SEGURIDAD (certificación y dirección de descarga)",
      "e) Estado de válvulas ¿PERMITE LA APERTURA Y CIERRE TOTAL?",
      "f) Manómetros (certificación vigente)",
      "g) Escalera de ingreso (Apta para su uso /bloqueada para su uso).",
      "h) Sistema anticaida (estado de linea de vida, acable acerado y T3)",
      "i) Estado Gral. De Carteleria.",
      "j) Certificaciones de Silo (Certificación de válvulas de seguridad, manguerotes, balanzas, END en uniones soldadas)",
      "k)Estado de soldaduras principales ¿Se encuentran certificados (END)?",
      "l) Estado de pisaderas/plataformas de trabajo."
    ]
  },
  {
    "id": "s16_1",
    "label": "16.1 Compresor y manifold",
    "repeat": {
      "label": "Compresor y manifold",
      "max": 2
    },
    "items": [
      "a) Estado de Valvulas ( reguladora, chequear si se encuentra a 2,5 )",
      "b) Pulmón - ¿La certificación de PH y Manómetros, se encuentran vigentes?",
      "c) Sistema eléctrico (carteleria de identificación de riesgo- Pulsadores encendido/apagado- rotulado - Sistema de bloqueo- Pare de emergencia).",
      "d) Conexión a PAT (jabalina, estado de terminal, bulón y cable).",
      "e) Sistema de bloqueo - Punto de bloqueo.",
      "f) Estado gral. De cable de alimentación, fichas y prensa cable.",
      "g) Estado gral. De mangueras y eslingas de retención.",
      "h) Estado gral. De cable acoples.",
      "i) Certificación de compresor.",
      "j) ¿se encuentra anclado/vinculado al patín?"
    ]
  },
  {
    "id": "s16_2",
    "label": "16.2 Manga de venteo",
    "items": [
      "a) Estado Gral. De estructura de Manga ( material desplegable y cerrojos).",
      "b) Estado de filtro de retencion de material particulado y abrazaderas.",
      "c) Carteleria de Emisión de barita pulverizada."
    ]
  },
  {
    "id": "s16_3",
    "label": "16.3 Cabina de silo",
    "items": [
      "a) Calculo de estabilidad.",
      "b) Carga de fuego.",
      "c) Tablero eléctrico (carteleria de identificación de riesgo- pulsadores encendido/apagado- sistema de bloqueo-Acrilico y rotulado - Pat.).",
      "d) Detector de Humo.",
      "e) Botiquin de primeros auxilios.",
      "f) Extintor ABC 10 KG.",
      "g) Iluminación/exterior.",
      "h) Estado de Arnes de sguridad, ¿Se encuentra confeccionado el check list?",
      "i) Orden y limpieza."
    ]
  },
  {
    "id": "s17",
    "label": "17 Respuesta ante emergencias - primeros auxilios",
    "items": [
      "a) Estación de contigencia (camilla, inmovilizador, collarin, botiquin, extintor (10 kg ABC), camilla, fajas (7) y ferulas)."
    ]
  },
  {
    "id": "s18",
    "label": "18 Herramientas manuales",
    "items": [
      "a) Estado gral. De Herramientas.",
      "b) Señalización del Área de acopio de herramientas.",
      "c) Consigna de herramientas manuales. (stilson)"
    ]
  },
  {
    "id": "s19",
    "label": "19 Hidrolavadora",
    "items": [
      "a) ¿Se encuentran confeccionados el ATS- Permiso de trabajo Y RGSSA37 ?",
      "b) Conexión a PAT (estado de terminal, bulón y cable).",
      "c) Manómetro (funcionamiento y certificación)",
      "d) Estado de lanza y mangueras.",
      "e) Sistema de bloqueo y consigna.",
      "f) Estado de v{alvula reguladora",
      "g) En caso de utilizacion de la misma, verificar que la presión de trabajo no supero los 1500 psi -103,4 bar"
    ]
  },
  {
    "id": "s20",
    "label": "20 Residuos general",
    "items": [
      "a) Estado de recipientes de clasificación (Tapas, visagras/manijas y bolsa en su interior).",
      "b) Carteleria de identificación.",
      "c) Verificicación de clasificación al momento de la inspección."
    ]
  },
  {
    "id": "s21",
    "label": "21 Dueño de zona",
    "items": [
      "a) Estado Gral de Atril. (Registro de planillas).",
      "b) Delimitación de zona (pie de cadena y cadenas)."
    ]
  }
],
  },
};
