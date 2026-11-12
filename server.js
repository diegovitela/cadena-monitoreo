// Polyfill para Node.js 18 — 'File' es global desde Node 20
if (typeof File === 'undefined') {
  const { File: NodeFile } = require('buffer');
  global.File = NodeFile;
}

const express   = require('express');
const axios     = require('axios');
const cheerio   = require('cheerio');
const xml2js    = require('xml2js');
const puppeteer = require('puppeteer-core');
const path      = require('path');

const CHROME_PATH = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const app  = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Cache ────────────────────────────────────────────────────────
const cache = new Map();
function getCached(key) {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < 300000) return e.data;
  return null;
}
function setCache(key, data) { cache.set(key, { data, ts: Date.now() }); }

// ─── Datos de estados (fuentes oficiales) ─────────────────────────
const ESTADOS = [
  { no:  1, nombre: 'AGUASCALIENTES',    fb: 'https://www.facebook.com/proteccioncivilags',                        x: 'CEPCAGS' },
  { no:  2, nombre: 'BAJA CALIFORNIA',   fb: 'https://www.facebook.com/proteccivilbc',                             x: null },
  { no:  3, nombre: 'BAJA CALIFORNIA SUR', fb: 'https://www.facebook.com/profile.php?id=100067605695867',          x: null },
  { no:  4, nombre: 'CAMPECHE',           fb: 'https://www.facebook.com/SEPROCICAMP',                              x: 'SEPROCICAMP' },
  { no:  5, nombre: 'CHIAPAS',            fb: 'https://www.facebook.com/pcivilchiapas.chiapas',                   x: 'pcivilchiapas' },
  { no:  6, nombre: 'CHIHUAHUA',          fb: 'https://www.facebook.com/CEPC.Chihuahua',                          x: 'CEPC_Chih' },
  { no:  7, nombre: 'CIUDAD DE MÉXICO',   fb: 'https://www.facebook.com/SGIRPCCDMX',                              x: 'SGIRPC_CDMX' },
  { no:  8, nombre: 'COAHUILA',           fb: 'https://www.facebook.com/PCcoahuila',                              x: 'PCcoahuila' },
  { no:  9, nombre: 'COLIMA',             fb: 'https://www.facebook.com/pccolima',                                x: 'PC_Colima' },
  { no: 10, nombre: 'DURANGO',            fb: 'https://www.facebook.com/CEPCDurango',                             x: 'CEPCDurango' },
  { no: 11, nombre: 'ESTADO DE MÉXICO',   fb: 'https://www.facebook.com/pciviledomex',                            x: 'pciviledomex' },
  { no: 12, nombre: 'GUANAJUATO',         fb: null,                                                               x: 'PC_GTO' },
  { no: 13, nombre: 'GUERRERO',           fb: 'https://www.facebook.com/SGIRPCGro',                               x: 'PC_Guerrero' },
  { no: 14, nombre: 'HIDALGO',            fb: 'https://www.facebook.com/DGPCyGRHgo',                              x: 'SSPCyGRHgo' },
  { no: 15, nombre: 'JALISCO',            fb: 'https://www.facebook.com/PCJalisco19',                             x: 'PCJalisco' },
  { no: 16, nombre: 'MICHOACÁN',          fb: 'https://www.facebook.com/pcmichoacan',                             x: 'pcmichoacan' },
  { no: 17, nombre: 'MORELOS',            fb: 'https://www.facebook.com/CoordinacionEstatalProteccionCivilMorelos', x: 'PC_Morelos' },
  { no: 18, nombre: 'NAYARIT',            fb: 'https://www.facebook.com/proteccioncivilnay',                      x: null },
  { no: 19, nombre: 'NUEVO LEÓN',         fb: 'https://www.facebook.com/proteccioncivilnuevoleon',                x: 'PC_NuevoLeon' },
  { no: 20, nombre: 'OAXACA',             fb: 'https://www.facebook.com/CEPCYGRGobOax',                           x: 'PCMunOax' },
  { no: 21, nombre: 'PUEBLA',             fb: 'https://www.facebook.com/PCGobPue',                                x: 'PC_Estatal' },
  { no: 22, nombre: 'QUERÉTARO',          fb: 'https://www.facebook.com/pcivilqro',                               x: 'PCIVILQRO' },
  { no: 23, nombre: 'QUINTANA ROO',       fb: 'https://www.facebook.com/CoeprocQRoo',                             x: 'ProtCivil_QRoo' },
  { no: 24, nombre: 'SAN LUIS POTOSÍ',    fb: 'https://www.facebook.com/proteccioncivil.slp',                     x: 'PC_SLP' },
  { no: 25, nombre: 'SINALOA',            fb: 'https://www.facebook.com/pcsinaloa',                               x: 'PC_Sinaloa' },
  { no: 26, nombre: 'SONORA',             fb: 'https://www.facebook.com/proteccioncivilsonora',                   x: 'cepcsonora' },
  { no: 27, nombre: 'TABASCO',            fb: 'https://www.facebook.com/Prociviltabasco',                         x: 'ProcivilTabasco' },
  { no: 28, nombre: 'TAMAULIPAS',         fb: 'https://www.facebook.com/ProteccionCivildeTamaulipas',             x: 'PCTamaulipas' },
  { no: 29, nombre: 'TLAXCALA',           fb: 'https://www.facebook.com/profile.php?id=100094578994135',          x: 'GobTlaxcala' },
  { no: 30, nombre: 'VERACRUZ',           fb: 'https://www.facebook.com/secretaria.deproteccioncivil',            x: 'PCEstatalVer' },
  { no: 31, nombre: 'YUCATÁN',            fb: 'https://www.facebook.com/procivy',                                 x: 'procivy' },
  { no: 32, nombre: 'ZACATECAS',          fb: 'https://www.facebook.com/PCEstatalZac',                            x: 'PCEstatalZac' },
];

const DEPENDENCIAS = [
  { no: 1, nombre: 'COORDINACIÓN NACIONAL DE PROTECCIÓN CIVIL', fb: 'https://www.facebook.com/CNPCmx',           x: 'CNPC_MX'    },
  { no: 2, nombre: 'CONAGUA',                                   fb: 'https://www.facebook.com/conaguamx',         x: 'conagua_mx' },
  { no: 3, nombre: 'CONAFOR',                                   fb: 'https://www.facebook.com/CONAFOR.Central',   x: 'CONAFOR'    },
  { no: 4, nombre: 'SERVICIO SISMOLÓGICO NACIONAL',             fb: 'https://www.facebook.com/SismologicoMX',     x: 'SismologicoMX' },
];

// ─── Medios de comunicación (misma lógica de scraping que estados) ─
const NOTICIAS_FUENTES = [
  { id: 'milenio',   nombre: 'MILENIO',             fb: 'https://www.facebook.com/MilenioDiario',       x: null },
  { id: 'universal', nombre: 'EL UNIVERSAL',         fb: 'https://www.facebook.com/groups/eluniversalmx', x: null },
  { id: 'aristegui', nombre: 'ARISTEGUI NOTICIAS',   fb: 'https://www.facebook.com/aristeguicnn',        x: null },
  { id: 'excelsior', nombre: 'EXCÉLSIOR',            fb: 'https://www.facebook.com/ExcelsiorMex',        x: null },
  { id: 'animalpol', nombre: 'ANIMAL POLÍTICO',      fb: 'https://www.facebook.com/pajaropolitico',      x: null },
  { id: 'latinus',   nombre: 'LATINUS',              fb: 'https://www.facebook.com/Latinus',             x: null },
];

// ─── Límites geográficos para mapeo de sismos ─────────────────────
const ESTADOS_BOUNDS = {
  'AGUASCALIENTES': [21.6,22.6,-103.0,-101.7], 'BAJA CALIFORNIA': [28.0,32.7,-117.2,-113.8],
  'BAJA CALIFORNIA SUR': [22.8,28.1,-115.1,-109.4], 'CAMPECHE': [17.8,20.9,-92.6,-89.1],
  'CHIAPAS': [14.5,17.9,-94.3,-90.3], 'CHIHUAHUA': [26.0,31.9,-109.1,-103.1],
  'CIUDAD DE MÉXICO': [19.1,19.6,-99.4,-98.9], 'COAHUILA': [24.4,29.9,-103.0,-99.7],
  'COLIMA': [18.6,19.6,-104.7,-103.4], 'DURANGO': [22.2,26.9,-107.2,-103.0],
  'ESTADO DE MÉXICO': [18.6,20.4,-100.7,-98.5], 'GUANAJUATO': [19.9,21.8,-102.1,-99.5],
  'GUERRERO': [16.2,18.9,-101.8,-97.9], 'HIDALGO': [19.5,21.5,-99.9,-97.8],
  'JALISCO': [18.9,22.9,-105.8,-101.4], 'MICHOACÁN': [17.9,20.5,-103.9,-100.0],
  'MORELOS': [18.1,19.2,-99.7,-98.5], 'NAYARIT': [20.5,23.2,-106.0,-103.6],
  'NUEVO LEÓN': [23.1,27.9,-101.3,-98.3], 'OAXACA': [15.6,18.8,-98.8,-93.5],
  'PUEBLA': [17.8,21.0,-98.8,-96.6], 'QUERÉTARO': [19.9,21.8,-100.6,-98.9],
  'QUINTANA ROO': [17.8,21.8,-89.1,-86.6], 'SAN LUIS POTOSÍ': [21.1,24.6,-102.4,-98.2],
  'SINALOA': [22.0,27.1,-109.6,-106.3], 'SONORA': [25.9,32.6,-115.1,-108.4],
  'TABASCO': [17.1,18.8,-94.3,-90.7], 'TAMAULIPAS': [22.1,27.8,-100.3,-97.0],
  'TLAXCALA': [19.1,20.0,-98.9,-97.8], 'VERACRUZ': [17.0,22.6,-98.1,-93.5],
  'YUCATÁN': [19.4,21.8,-90.6,-87.3], 'ZACATECAS': [20.9,25.3,-104.5,-100.9]
};

function getEstadoCoords(lat, lon) {
  const byArea = Object.entries(ESTADOS_BOUNDS).sort((a,b)=>{
    const aA=(a[1][1]-a[1][0])*(a[1][3]-a[1][2]), aB=(b[1][1]-b[1][0])*(b[1][3]-b[1][2]);
    return aA-aB;
  });
  for (const [e,[minLat,maxLat,minLon,maxLon]] of byArea)
    if (lat>=minLat&&lat<=maxLat&&lon>=minLon&&lon<=maxLon) return e;
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════════
//  SCRAPERS
// ═══════════════════════════════════════════════════════════════════

// ─── Detectar fenómeno por palabras clave ─────────────────────────
function detectarFenomeno(texto) {
  const t = texto.toLowerCase();
  // Geológicos
  if (t.match(/sismo|temblor|magnitud|réplica|replica|seísmo|terremoto|actividad sísmica|actividad sismica|sacudida/)) return 'Geológico – Sismo';
  if (t.match(/volcán|volcan|popocatépetl|popocatepetl|popo|don goyo|fumarola|erupción|erupcion|lava|lahar|exhalación|domo volcánico|semáforo volcánico|actividad volcánica/)) return 'Geológico – Volcánico';
  if (t.match(/tsunami|maremoto/)) return 'Geológico – Tsunami';
  if (t.match(/deslave|deslizamiento|derrumbe|desprendimiento|inestabilidad.{0,10}ladera/)) return 'Geológico – Deslave';
  if (t.match(/hundimiento|socavón|socavon/)) return 'Geológico – Hundimiento';
  // Hidrometeorológicos
  if (t.match(/ciclón|ciclon|ciclónico|ciclonico|huracán|huracan|trop[oi]cal|depresión tropical|depresion tropical|tifón|tornado/)) return 'Hidrometeorológico – Ciclón/Tornado';
  if (t.match(/inundación|inundacion|anegamiento|desborda|encharcamiento/)) return 'Hidrometeorológico – Inundación';
  if (t.match(/lluvia torrencial|lluvia intensa|tormenta eléctrica|tormenta electrica|chubascos severos/)) return 'Hidrometeorológico – Tormenta';
  if (t.match(/granizo|granizada/)) return 'Hidrometeorológico – Granizo';
  if (t.match(/tromba|manga de agua/)) return 'Hidrometeorológico – Tromba';
  if (t.match(/helada|nevad|nieve|frío.{0,10}extremo|frío.{0,10}intenso|temperatura.{0,20}bajo cero/)) return 'Hidrometeorológico – Heladas';
  if (t.match(/vendaval|tolvanera/)) return 'Hidrometeorológico – Vientos fuertes';
  if (t.match(/frente frío|frente frio/)) return 'Hidrometeorológico – Frente frío';
  if (t.match(/sequía|sequia/)) return 'Hidrometeorológico – Sequía';
  if (t.match(/lluvia|precipitación|precipitacion|chubascos/)) return 'Hidrometeorológico – Lluvias';
  // Químico-tecnológicos
  if (t.match(/incendio forestal|incendio.{0,15}bosque|incendio.{0,15}selva|incendio.{0,15}pastizal/)) return 'Químico-Tecnológico – Incendio forestal';
  if (t.match(/derrame|fuga de gas|sustancia peligrosa|material peligroso|residuo tóxico|residuo toxico|emergencia química|emergencia quimica/)) return 'Químico-Tecnológico – Emergencia química';
  if (t.match(/explosión|explosion/)) return 'Químico-Tecnológico – Explosión';
  if (t.match(/incendio/)) return 'Químico-Tecnológico – Incendio';
  // Socio-organizativos
  if (t.match(/terrorismo|acto terrorista|atentado/)) return 'Socio-organizativo – Terrorismo';
  if (t.match(/sabotaje/)) return 'Socio-organizativo – Sabotaje';
  if (t.match(/concentración masiva|concentracion masiva|estampida/)) return 'Socio-organizativo – Concentración masiva';
  if (t.match(/accidente ferroviario|accidente aéreo|accidente aereo|accidente vial grave/)) return 'Socio-organizativo – Accidente';
  // Sanitarios-ecológicos
  if (t.match(/epidemia|brote epidémico|brote epidemico|pandemia|emergencia sanitaria/)) return 'Sanitario-ecológico – Epidemia';
  if (t.match(/plaga/)) return 'Sanitario-ecológico – Plaga';
  if (t.match(/contaminación.{0,20}agua|contaminacion.{0,20}agua|contaminación.{0,20}aire|contaminacion.{0,20}aire/)) return 'Sanitario-ecológico – Contaminación';
  // Astronómicos
  if (t.match(/tormenta magnética|tormenta magnetica|tormenta solar|llamarada solar/)) return 'Astronómico – Tormenta magnética';
  if (t.match(/asteroide|cometa|meteorito|lluvia de meteoros/)) return 'Astronómico – Asteroide/Cometa';
  // Sin fenómeno
  if (t.match(/sin novedad|sin event|actividad normal|condiciones normales|sin fenómeno|sin reporte/)) return 'NA';
  return 'Por verificar';
}

// ─── Análisis con IA (Groq) — analiza un lote de posts de una vez ─
async function analizarPostsConIA(posts) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const textos = posts.map((p, i) => `POST ${i + 1}: ${p.texto.slice(0, 350)}`).join('\n\n');

  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: `Eres un analizador de protección civil para México. Para cada POST determina si describe o anuncia un desastre, emergencia, fenómeno natural, aviso meteorológico, vigilancia, alerta preventiva o condición de riesgo que requiera atención (aunque sea preventiva). Incluye: lluvias esperadas, frentes fríos, vigilancia meteorológica, alertas tempranas, sismos recientes, actividad volcánica, inundaciones, incendios, etc. Solo excluye posts claramente irrelevantes (cursos, eventos culturales, noticias pasadas históricas, contenido político sin riesgo).
Responde ÚNICAMENTE con un array JSON, un objeto por POST en orden:
[{"esDesastre": true/false, "fenomeno": "tipo o NA"}]
Tipos válidos: Geológico – Sismo, Geológico – Volcánico, Geológico – Deslave, Hidrometeorológico – Inundación, Hidrometeorológico – Ciclón/Tornado, Hidrometeorológico – Tormenta, Hidrometeorológico – Lluvias, Hidrometeorológico – Heladas, Químico-Tecnológico – Incendio forestal, Químico-Tecnológico – Incendio, Químico-Tecnológico – Explosión, Hidrometeorológico – Vientos fuertes, Hidrometeorológico – Frente frío, Sanitario-ecológico – Epidemia, NA`
          },
          { role: 'user', content: textos }
        ],
        temperature: 0,
        max_tokens: 800
      },
      {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 12000
      }
    );
    const content = data.choices[0].message.content.trim();
    // Limpiar bloques markdown si el modelo los incluyó
    const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) { console.log('[IA] sin JSON array en respuesta limpia:', cleaned.slice(0, 150)); return null; }
    try { return JSON.parse(match[0]); } catch (e) { console.log('[IA] JSON parse error:', e.message); return null; }
  } catch (err) {
    console.log('[IA ERROR]', err.response?.status, err.response?.data?.error?.message || err.message);
    return null; // si falla la IA, usa keywords como respaldo
  }
}

// ─── Palabras clave para detectar si hay desastre/emergencia ─────
const KEYWORDS_DESASTRE = [
  // ── Emojis de emergencia (no cambian con toLowerCase)
  '🚨','⚠️','🆘','🔴','🟠','🔶','🌊','🌋','🌀','⛈','🌪','🌩','🔥',

  // ── Sismos / actividad sísmica
  'sismo','sismos','temblor','temblores','terremoto','terremotos',
  'réplica','replica','replicas','réplicas','magnitud','epicentro',
  'actividad sísmica','actividad sismica','sismo perceptible','sacudida telúrica',
  'alerta sísmica','alerta sismica','sistema de alerta sísmica','sasmex',

  // ── Volcanes
  'volcán','volcan','volcanes','erupción','erupcion','erupciones',
  'popocatépetl','popocatepetl','popo','don goyo',
  'volcán de colima','volcan de colima','volcán colima',
  'fumarola','fumarolas','lava','lahar','lahares',
  'ceniza volcánica','ceniza volcanica','lluvia de ceniza','caída de ceniza',
  'actividad volcánica','actividad volcanica',
  'alerta volcánica','alerta volcanica',
  'semáforo volcánico','semaforo volcanico',
  'exhalación','exhalacion','domo','flujo piroclástico','flujo piroclastico',
  'volcán despertó','volcan desperto','volcán activo','volcan activo',

  // ── Tsunamis / hundimientos / deslaves
  'tsunami','tsunamis','maremoto','hundimiento','socavón','socavon',
  'deslave','deslaves','deslizamiento','deslizamientos',
  'derrumbe','derrumbes','desprendimiento','desprendimientos',
  'talud','grieta','fisura','fractura en suelo',

  // ── Lluvias e inundaciones
  'inundación','inundacion','inundaciones',
  'anegamiento','anegado','anegada','anegados','anegadas',
  'encharcamiento','encharcado','encharcada',
  'desbordamiento','desbordó','desborda','se desbordó','se desbordaron','río desbordado',
  'lluvia','lluvias','lluvia fuerte','lluvias fuertes','lluvia intensa','lluvias intensas',
  'lluvia torrencial','lluvias torrenciales','lluvia extrema','lluvias extremas',
  'precipitación','precipitacion','precipitaciones','chubascos','aguacero','aguaceros',
  'temporal','temporal de lluvia','temporada de lluvias',
  'tormenta','tormentas','tormenta eléctrica','tormenta electrica','tormenta severa',
  'granizo','granizada','granizadas',
  'tromba','trombas','manga de agua',
  'nivel del río','nivel de río','creciente','avenida de agua',

  // ── Ciclones / tornados
  'ciclón','ciclon','ciclones','ciclónico','ciclonico',
  'huracán','huracan','huracanes',
  'tormenta tropical','tormentas tropicales',
  'depresión tropical','depresion tropical',
  'tornado','tornados',
  'tifón','tifon',
  'marejada','marea de tormenta','oleaje fuerte',

  // ── Temperaturas extremas / frentes
  'helada','heladas','nevada','nevadas','nieve',
  'frío extremo','frio extremo','frío intenso','frio intenso','frío polar',
  'ola de calor','onda de calor','onda cálida','onda calida',
  'calor extremo','calor intenso','calor sofocante',
  'altas temperaturas','temperatura extrema','temperatura récord','temperatura record',
  'bajas temperaturas','temperatura bajo cero',
  'frente frío','frente frio','los nortes','el norte frío','el norte frio','onda fría','onda fria',

  // ── Vientos
  'viento fuerte','vientos fuertes','fuertes vientos','rachas fuertes',
  'viento intenso','vientos intensos','racha de viento',
  'vendaval','vendavales','tolvanera','tolvaneras','surada',

  // ── Incendios / fuego
  'incendio','incendios',
  'incendio forestal','incendios forestales',
  'incendio en bosque','incendio en pastizal','incendio en matorral',
  'quema','quemas','fuego fuera de control','fuego activo','combate de incendio',
  'hectáreas quemadas','hectareas quemadas',

  // ── Emergencias químicas / industriales
  'derrame','derrames','fuga de gas','explosión','explosion','explosiones',
  'sustancia peligrosa','material peligroso','residuo tóxico','residuo toxico',
  'emergencia química','emergencia quimica','nube tóxica','nube toxica',

  // ── Accidentes / vialidad
  'choque','choques','colisión','colision','volcadura','volcaduras',
  'atropellamiento','atropello',
  'accidente','accidentes','accidente vial','accidente en carretera','accidente en autopista',
  'carretera cerrada','camino cerrado','vialidad afectada','derrumbe en carretera',

  // ── Palabras clave de EMERGENCIA / urgencia (mayúsculas o no)
  'emergencia','emergencias','urgente','urgencia','urgencias',
  'socorro','auxilio','sos','alerta máxima','alerta maxima',
  'contingencia','contingencias',
  'código rojo','codigo rojo','código naranja','codigo naranja','alerta roja','alerta naranja',

  // ── Operativo de Protección Civil / respuesta
  'alerta','alertas','declaratoria','declaratoria de emergencia','declaratoria de desastre',
  'evacuación','evacuacion','evacuaciones','evacuados','evacuar',
  'rescate','rescatados','rescataron','rescatan','rescatar',
  'afectados','afectaciones','afectación','afectacion',
  'damnificados','damnificadas',
  'víctimas','victimas','heridos','fallecidos','lesionados',
  'atrapados','atrapadas','personas atrapadas',
  'desaparecidos','desaparecidas','personas desaparecidas',
  'daños','daño','daños materiales','pérdidas materiales',
  'riesgo','en riesgo','zona de riesgo','alto riesgo',
  'comunidades afectadas','familias afectadas','personas afectadas',
  'sin luz','sin agua','sin energía','corte de luz','corte de agua',
  'atención a emergencia','atendiendo emergencia',
  'plan dn-iii','dn-iii','plan marina','plan de emergencia',
  'activación del coe','activacion del coe','plan de contingencia',
  'alerta temprana',

  // ── Prevención / pronóstico
  'se esperan lluvias','se esperan vientos','se esperan granizos',
  'se pronostican','se prevén lluvias','se preveen lluvias',
  'alerta por lluvia','alerta por lluvias','alerta por viento','alerta por tormenta',
  'alerta por sismo','alerta por volcán','alerta por ciclón',
  'recomendaciones ante','medidas de prevención','medidas de prevencion',
  'precaución vial','precaucion vial',
  'neblina','niebla','visibilidad reducida',

  // ── Sanitarios / ecológicos
  'epidemia','pandemia','brote','emergencia sanitaria','plaga',
  'contaminación del agua','contaminacion del agua',

  // ── Sequía
  'sequía','sequia',

  // ── Lenguaje informal / coloquial en redes sociales
  'se metió el agua','se metió el río','se salió el río','se salió el agua',
  'bajo el agua','metió agua','entró el agua',
  'alud','aludes','avalancha','avalanchas',
  'colapso','colapsos','colapsó','colapsan',
  'se cayó','se derrumbó','se derrumba','se vino abajo',
  'sin servicios','sin suministro','sin agua potable',
  'cortaron el agua','cortaron la luz','sin energía eléctrica',
  'pérdida total','pérdidas totales',
  'crecida del río','crecida del rio','río crecido','rio crecido',
  'nivel peligroso','nivel crítico','nivel critico',
  'presa al límite','presa al limite','desfogue','desfogues',
  'zona de desastre','zona afectada','zona de peligro',
  'quema de pastizales','quema de matorrales',
  'incendio activo','combatiendo incendio','incendio sin control',
  'lluvia de granizo','fuerte granizada',
  'tromba marina','manga de viento',
  'aguacero fuerte','aguacero torrencial',
  'río desbordado','arroyo desbordado','barranca desbordada',
  'personas rescatadas','personas evacuadas','familias evacuadas',
  'declaratoria de emergencia','declaratoria de desastre',
  'dn-iii','plan dn3','plan dn-iii-e',
  'fuerza de tarea','brigadas de emergencia','brigadas de rescate',
];

function contieneDesastre(texto) {
  // Revisar tanto el texto original (para emojis) como en minúsculas (para keywords)
  const t = texto.toLowerCase();
  return KEYWORDS_DESASTRE.some(kw => {
    // Emojis y símbolos: buscar en texto original
    if (kw.length <= 2) return texto.includes(kw);
    return t.includes(kw);
  });
}

// ─── 1. NITTER — para X/Twitter ───────────────────────────────────
const NITTER_INSTANCIAS = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.lucahammer.com',
  'https://nitter.1d4.us',
  'https://nitter.unixfox.eu',
  'https://nitter.kavin.rocks',
  'https://nitter.net',
  'https://nitter.catsarch.com',
  'https://nitter.rawbit.ninja',
  'https://nitter.moomoo.me'
];

// Devuelve true si la fecha está dentro de las últimas 24 horas, false si es más antigua, null si no se puede determinar.
const MESES_ES = {
  enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,
  julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11
};
function esDentro24h(dateStr) {
  if (!dateStr) return null;
  const LIMITE = 24 * 60 * 60 * 1000;
  const ahora  = Date.now();
  const f = dateStr.toLowerCase().trim();

  // Tiempos relativos en español/inglés
  const mSeg  = f.match(/hace\s+(\d+)\s*segundo/);  if (mSeg)  return true;
  const mMin  = f.match(/hace\s+(\d+)\s*minuto/);   if (mMin)  return true;
  const mHora = f.match(/hace\s+(\d+)\s*hora/);     if (mHora) return parseInt(mHora[1]) < 24;
  if (f.includes('just now') || f.includes('hoy') || f.includes('today')) return true;
  if (f.includes('ayer') || f.includes('yesterday')) return false;
  if (/hace\s+\d+\s*(día|semana|mes|año)/.test(f))  return false;

  // Fecha completa en español: "viernes, 21 de agosto de 2026 a las 14:30"
  // o "21 de agosto de 2026" (sin hora ni día de semana)
  const mEs = f.match(/(\d{1,2})\s+de\s+([a-záéíóúü]+)\s+de\s+(\d{4})(?:\s+a\s+las\s+(\d{1,2}):(\d{2}))?/);
  if (mEs) {
    const mes = MESES_ES[mEs[2]];
    if (mes !== undefined) {
      const d = new Date(parseInt(mEs[3]), mes, parseInt(mEs[1]),
                         parseInt(mEs[4] || '0'), parseInt(mEs[5] || '0'));
      if (!isNaN(d.getTime())) return (ahora - d.getTime()) < LIMITE;
    }
  }

  // Fecha absoluta o ISO (también maneja "Aug 21, 2026 · 3:45 PM UTC")
  const clean = dateStr.split('·')[0].trim();
  const d = new Date(clean.length > 5 ? clean : dateStr);
  if (!isNaN(d.getTime())) return (ahora - d.getTime()) < LIMITE;

  return null;
}

async function scrapeXNitter(username) {
  const hoy = new Date().toISOString().slice(0, 10);

  for (const base of NITTER_INSTANCIAS) {
    try {
      const { data, status } = await axios.get(`${base}/${username}`, {
        timeout: 9000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml;q=0.9',
          'Accept-Language': 'es-MX,es;q=0.9'
        }
      });

      if (status !== 200) continue;

      const $ = cheerio.load(data);

      if ($('.error-panel').length || data.includes('Instance is dead') || data.includes('503')) continue;

      const posts = [];
      $('.timeline-item:not(.show-more)').each((i, el) => {
        const dateAttr = $(el).find('.tweet-date a').attr('title') || '';
        const texto    = $(el).find('.tweet-content').text().trim();
        if (!texto || texto.length < 5) return;
        posts.push({ texto: texto.slice(0, 800), fecha: dateAttr, esHoy: esDentro24h(dateAttr) });
      });

      if (posts.length === 0) continue;

      // Devolver todos los posts con el flag correcto; scrapeEstado filtra por fecha
      return { ok: true, fuente: `X (@${username})`, posts: posts.slice(0, 8), instancia: base };
    } catch (_) { /* siguiente instancia */ }
  }
  return { ok: false };
}

// ─── 2. X.COM con Puppeteer ───────────────────────────────────────
async function scrapeXPuppeteer(username, browser) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
    });

    await page.goto(`https://x.com/${username}`, { waitUntil: 'domcontentloaded', timeout: 22000 });
    await sleep(4000);

    // Intentar cerrar popup de login si aparece
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(600);

    const hace24h = Date.now() - 24 * 60 * 60 * 1000;

    const tweets = await page.evaluate((hace24h) => {
      const arts = [...document.querySelectorAll('article')];
      return arts.slice(0, 8).map(a => {
        const textEl = a.querySelector('[data-testid="tweetText"]');
        const timeEl = a.querySelector('time');
        if (!textEl) return null;
        const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
        const esHoy = datetime ? new Date(datetime).getTime() > hace24h : false;
        return {
          texto: textEl.innerText.trim().slice(0, 800),
          fecha: datetime,
          esHoy
        };
      }).filter(Boolean);
    }, hace24h);

    await page.close();

    if (!tweets.length) return { ok: false, razon: 'Sin tweets visibles' };

    return { ok: true, fuente: `X (@${username})`, posts: tweets };
  } catch (err) {
    await page.close().catch(() => {});
    return { ok: false, razon: err.message.slice(0, 80) };
  }
}

// ─── 3. FACEBOOK mbasic (sin Puppeteer, más rápido) ──────────────
async function scrapeFBMbasic(fbUrl) {
  const pageName = fbUrl.replace(/.*facebook\.com\//, '').split('?')[0];
  try {
    const { data } = await axios.get(`https://mbasic.facebook.com/${pageName}`, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-MX,es;q=0.9'
      }
    });

    const $ = cheerio.load(data);

    // Detectar muro de login: texto explícito O ausencia total de contenido
    const esLoginWall =
      data.includes('Debes iniciar sesión') ||
      data.includes('You must log in') ||
      data.includes('id="loginform"') ||
      data.includes('name="login"') ||
      (data.includes('/login') && $('article, [data-ft]').length === 0);
    if (esLoginWall) return { ok: false, razon: 'Requiere login (mbasic)' };

    const posts = [];

    $('article, div[data-ft]').each((i, el) => {
      // Obtener TODOS los párrafos del post (no solo el primero)
      const parrafos = $(el).find('p').map((_, p) => $(p).text().trim()).get().filter(t => t.length > 3);
      const texto = parrafos.length
        ? parrafos.join(' ')
        : $(el).text().replace(/\s+/g, ' ').trim();

      // La fecha en mbasic puede estar en abbr[title] o en un enlace con timestamp
      const fechaEl = $(el).find('abbr[title]').attr('title')
                   || $(el).find('time').attr('datetime')
                   || '';
      if (texto.length > 20) {
        posts.push({ texto: texto.slice(0, 900), fecha: fechaEl, esHoy: esDentro24h(fechaEl) });
      }
    });

    if (posts.length) return { ok: true, fuente: 'Facebook', posts: posts.slice(0, 10) };
    return { ok: false, razon: 'Sin posts visibles en mbasic' };
  } catch (err) {
    return { ok: false, razon: err.message.slice(0, 80) };
  }
}

// ─── 4. FACEBOOK con Puppeteer ────────────────────────────────────
async function scrapeFBPuppeteer(fbUrl, browser) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
    });

    await page.goto(fbUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(4500);

    // Intentar cerrar el popup de inicio de sesión con múltiples estrategias
    const selectores = [
      '[aria-label="Cerrar"]', '[aria-label="Close"]',
      '[data-testid="royal_close_dialog"]',
      'div[role="dialog"] [role="button"]',
      '[aria-label="Cerrar diálogo"]'
    ];
    for (const sel of selectores) {
      const btn = await page.$(sel).catch(() => null);
      if (btn) { await btn.click().catch(() => {}); await sleep(300); break; }
    }
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(1000);

    const hace24h = Date.now() - 24 * 60 * 60 * 1000;

    const posts = await page.evaluate((hace24h) => {
      const articles = [...document.querySelectorAll('[role="article"]')];
      return articles.slice(0, 10).map(a => {
        // Priorizar el texto principal del post (div[dir="auto"] es el contenedor de texto en FB)
        const textNodes = [...a.querySelectorAll('div[dir="auto"]')]
          .map(n => n.innerText.trim())
          .filter(t => t.length > 10 && t.length < 2000);
        // Deduplicar (FB repite a veces el mismo texto en nodos anidados)
        const seen = new Set();
        const unique = textNodes.filter(t => { if (seen.has(t)) return false; seen.add(t); return true; });
        const texto = unique.join(' ').slice(0, 1000);

        // Buscar timestamp en todos los elementos de tiempo posibles
        const timeEl = a.querySelector('time[datetime], abbr[data-utime], a[role="link"] abbr');
        const fechaISO = timeEl
          ? (timeEl.getAttribute('datetime') || timeEl.getAttribute('data-utime') || timeEl.title || '')
          : '';
        // data-utime es unix timestamp en segundos
        let esHoy = null;
        if (fechaISO) {
          const ts = /^\d+$/.test(fechaISO)
            ? parseInt(fechaISO) * 1000
            : new Date(fechaISO).getTime();
          esHoy = !isNaN(ts) ? ts > hace24h : null;
        }
        return { texto, fecha: fechaISO, esHoy };
      }).filter(p => p.texto.length > 20);
    }, hace24h);

    await page.close();

    if (!posts.length) return { ok: false, razon: 'Requiere login o sin contenido visible' };
    return { ok: true, fuente: 'Facebook', posts };
  } catch (err) {
    await page.close().catch(() => {});
    return { ok: false, razon: err.message.slice(0, 80) };
  }
}

// ─── Función principal por estado ─────────────────────────────────
async function scrapeEstado(estado, browser) {
  const resultados = { x: null, fb: null };

  // X: Nitter primero, luego Puppeteer
  if (estado.x) {
    const nitter = await scrapeXNitter(estado.x);
    if (nitter.ok) {
      resultados.x = nitter;
    } else {
      resultados.x = await scrapeXPuppeteer(estado.x, browser);
    }
  }

  // Facebook: mbasic primero, luego Puppeteer
  if (estado.fb) {
    const mbasic = await scrapeFBMbasic(estado.fb);
    if (mbasic.ok) {
      resultados.fb = mbasic;
    } else {
      resultados.fb = await scrapeFBPuppeteer(estado.fb, browser);
    }
  }

  const hayAcceso = Object.values(resultados).some(r => r && r.ok);

  if (!hayAcceso) {
    const motivos = [];
    if (resultados.x && !resultados.x.ok)  motivos.push(`X: ${resultados.x.razon || 'sin acceso'}`);
    if (resultados.fb && !resultados.fb.ok) motivos.push(`FB: ${resultados.fb.razon || 'sin acceso'}`);
    return {
      ok: false,
      eventos: null,
      fenomeno: null,
      intervencion: null,
      motivo: motivos.join(' | ') || 'Sin fuentes disponibles'
    };
  }

  // Recopilar TODOS los posts relevantes de hoy (no solo el primero)
  const eventosEncontrados = [];
  const fenomenosSet = new Set();

  for (const r of Object.values(resultados)) {
    if (!r || !r.ok) continue;
    const postsHoy = r.posts.filter(p => p.esHoy !== false);
    if (!postsHoy.length) continue;

    // IA analiza el lote completo; si falla usa keywords como respaldo
    const iaResultados = await analizarPostsConIA(postsHoy);
    if (iaResultados) {
      console.log(`[IA] ${estado.nombre || estado.id} — analizó ${postsHoy.length} posts con Groq`);
    } else {
      console.log(`[KEYWORDS] ${estado.nombre || estado.id} — Groq no disponible, usando palabras clave`);
    }

    postsHoy.forEach((post, i) => {
      let esDesastre, fenomeno;
      if (iaResultados && iaResultados[i]) {
        esDesastre = iaResultados[i].esDesastre;
        fenomeno   = iaResultados[i].fenomeno;
      } else {
        esDesastre = contieneDesastre(post.texto);
        fenomeno   = detectarFenomeno(post.texto);
      }
      if (esDesastre) {
        eventosEncontrados.push(`[${r.fuente}]\n${post.texto}`);
        if (fenomeno && fenomeno !== 'NA' && fenomeno !== 'Por verificar') fenomenosSet.add(fenomeno);
      }
    });
  }

  if (eventosEncontrados.length > 0) {
    const fenomeno = fenomenosSet.size > 0 ? [...fenomenosSet].join(' / ') : 'Por verificar';
    return {
      ok: true,
      eventos: eventosEncontrados.join('\n\n───\n\n'),
      fenomeno,
      intervencion: 'Estar en monitoreo',
      fuentes: Object.values(resultados).filter(r => r && r.ok).map(r => r.fuente)
    };
  }

  // Se tuvo acceso pero ningún post de hoy menciona desastre
  const fuentesOk = Object.values(resultados).filter(r => r && r.ok).map(r => r.fuente);
  return {
    ok: true,
    eventos: 'Sin novedad',
    fenomeno: 'NA',
    intervencion: 'No',
    fuentes: fuentesOk
  };
}

// ─── Control de cancelación ────────────────────────────────────────
let scrapingAbortado = false;
app.get('/api/abortar', (_req, res) => {
  scrapingAbortado = true;
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════
//  SSE: Scraping de todos los estados en tiempo real
// ═══════════════════════════════════════════════════════════════════
app.get('/api/scrape-todos', async (req, res) => {
  scrapingAbortado = false;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (_) {}
  };

  const total = ESTADOS.length + DEPENDENCIAS.length + NOTICIAS_FUENTES.length;
  send({ tipo: 'inicio', total });

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: CHROME_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-notifications',
        '--disable-geolocation',
        '--lang=es-MX,es',
        '--window-size=1280,800'
      ],
      defaultViewport: { width: 1280, height: 800 }
    });

    // ── Estados
    for (let i = 0; i < ESTADOS.length; i++) {
      if (scrapingAbortado) break;
      const estado = ESTADOS[i];
      send({ tipo: 'progreso', nombre: estado.nombre, index: i, total });

      const resultado = await scrapeEstado(estado, browser);
      send({ tipo: 'resultado', seccion: 'estado', nombre: estado.nombre, ...resultado });
      await sleep(1200);
    }

    // ── Dependencias federales
    for (let i = 0; i < DEPENDENCIAS.length; i++) {
      if (scrapingAbortado) break;
      const dep = DEPENDENCIAS[i];
      if (!dep.fb && !dep.x) continue;
      send({ tipo: 'progreso', nombre: dep.nombre, index: ESTADOS.length + i, total });

      const resultado = await scrapeEstado(dep, browser);
      send({ tipo: 'resultado', seccion: 'dependencia', nombre: dep.nombre, ...resultado });
      await sleep(1200);
    }
  } catch (err) {
    send({ tipo: 'error', mensaje: err.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  // ── Medios de comunicación (usan el mismo scraper de FB, sin Puppeteer extra)
  let browser2 = null;
  try {
    browser2 = await puppeteer.launch({
      headless: 'new', executablePath: CHROME_PATH,
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-blink-features=AutomationControlled','--disable-notifications','--lang=es-MX,es','--window-size=1280,800'],
      defaultViewport: { width: 1280, height: 800 }
    });
    for (let i = 0; i < NOTICIAS_FUENTES.length; i++) {
      if (scrapingAbortado) break;
      const fuente = NOTICIAS_FUENTES[i];
      send({ tipo: 'progreso', nombre: fuente.nombre, index: ESTADOS.length + DEPENDENCIAS.length + i, total });
      const resultado = await scrapeEstado(fuente, browser2);
      send({ tipo: 'resultado', seccion: 'noticia', id: fuente.id, nombre: fuente.nombre, ...resultado });
      await sleep(1200);
    }
  } catch (err) {
    send({ tipo: 'error', mensaje: `Noticias: ${err.message}` });
  } finally {
    if (browser2) await browser2.close().catch(() => {});
  }

  send({ tipo: 'fin' });
  res.end();
});

// ─── Helper: parsear trayectoria pronosticada del advisory NHC ───
// Formato real NHC: "FORECAST VALID 22/0600Z 29.9N 171.0W\nMAX WIND 75 KT"
async function fetchForecastTrack(advisoryUrl) {
  try {
    const { data } = await axios.get(advisoryUrl, { timeout: 8000 });
    const $ = cheerio.load(data);
    const text = $('pre').first().text();
    const track = [];

    // Posición inicial (INIT)
    const initM = text.match(
      /LOCATED NEAR (\d{1,2}\.\d+)([NS])\s+(\d{1,3}\.\d+)([EW]) AT (\d{2})\/(\d{2})(\d{2})Z/
    );
    let initDay = 0, initHour = 0;
    if (initM) {
      const [, latV, latD, lonV, lonD, day, hh, mm] = initM;
      initDay  = parseInt(day);
      initHour = parseInt(hh) + parseInt(mm) / 60;
      track.push({
        label: 'INIT',
        lat:   parseFloat(latV) * (latD === 'S' ? -1 : 1),
        lon:   parseFloat(lonV) * (lonD === 'W' ? -1 : 1),
        winds: null
      });
    }

    // Puntos FORECAST y OUTLOOK
    const re = /(?:FORECAST|OUTLOOK) VALID (\d{2})\/(\d{2})(\d{2})Z\s+(\d{1,2}\.\d+)([NS])\s+(\d{1,3}\.\d+)([EW])\s*\r?\n\s*MAX WIND\s+(\d+)\s*KT/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const [, day, hh, mm, latV, latD, lonV, lonD, winds] = m;
      const fDay  = parseInt(day);
      const fHour = parseInt(hh) + parseInt(mm) / 60;
      let dayDiff = fDay - initDay;
      if (dayDiff < 0) dayDiff += 31;
      const hrs = Math.round(dayDiff * 24 + (fHour - initHour));
      track.push({
        label: `+${hrs}H`,
        lat:   parseFloat(latV) * (latD === 'S' ? -1 : 1),
        lon:   parseFloat(lonV) * (lonD === 'W' ? -1 : 1),
        winds: parseInt(winds)
      });
    }

    return track;
  } catch (_) {
    return [];
  }
}

// ─── API: Datos para el mapa (USGS + NHC) ────────────────────────
app.get('/api/mapa-datos', async (req, res) => {
  const cached = getCached('mapa-datos');
  if (cached) return res.json(cached);

  const resultado = { sismos: [], ciclones: [], ok: true, lastUpdated: new Date().toISOString() };

  // 1. USGS — últimos 2 días, área de México, M2.5+
  try {
    const { data } = await axios.get(
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5' +
      '&minlatitude=14&maxlatitude=33&minlongitude=-118&maxlongitude=-86' +
      '&starttime=' + new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) +
      '&limit=150&orderby=time',
      { timeout: 12000 }
    );
    resultado.sismos = data.features.map(f => ({
      lat:   f.geometry.coordinates[1],
      lon:   f.geometry.coordinates[0],
      mag:   parseFloat(f.properties.mag.toFixed(1)),
      place: f.properties.place || '',
      time:  f.properties.time,
      depth: Math.round(f.geometry.coordinates[2]),
      url:   f.properties.url || ''
    }));
  } catch (_) {}

  // 2. NHC — ciclones activos + trayectoria pronosticada
  try {
    const { data } = await axios.get('https://www.nhc.noaa.gov/CurrentStorms.json', { timeout: 8000 });
    resultado.ciclones = await Promise.all((data.activeStorms || []).map(async s => {
      const track = s.forecastAdvisory?.url
        ? await fetchForecastTrack(s.forecastAdvisory.url)
        : [];
      return {
        id:       s.id || '',
        name:     s.name || 'Sin nombre',
        type:     s.classification || s.type || 'TD',
        winds:    s.intensity || s.winds || '?',
        lat:      parseFloat((String(s.latitude  || '0').replace(/[NS]/g, ''))),
        lon:      -Math.abs(parseFloat(String(s.longitude || '0').replace(/[EW]/g, ''))),
        movement: s.movement || '',
        url:      s.advisoryURL || '',
        track
      };
    }));
  } catch (_) {}

  setCache('mapa-datos', resultado);
  res.json(resultado);
});

// ─── API existente: Sismos (USGS) ─────────────────────────────────
app.get('/api/sismos', async (req, res) => {
  const cached = getCached('sismos');
  if (cached) return res.json(cached);
  try {
    const { data } = await axios.get(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5` +
      `&minlatitude=14&maxlatitude=33&minlongitude=-118&maxlongitude=-86&limit=60&orderby=time`,
      { timeout: 12000 }
    );
    const byState = {};
    const all = [];
    for (const f of data.features) {
      const [lon, lat, depth] = f.geometry.coordinates;
      const place = f.properties.place || '';
      if (!place.toLowerCase().includes('mexico')) continue;
      const estado = getEstadoCoords(lat, lon);
      const q = {
        mag:    parseFloat(f.properties.mag.toFixed(1)),
        place, depth: Math.round(depth),
        time:   new Date(f.properties.time).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        lat, lon, estado
      };
      all.push(q);
      if (estado) { if (!byState[estado]) byState[estado]=[]; byState[estado].push(q); }
    }
    const result = { byState, all: all.slice(0,25), lastUpdated: new Date().toISOString(), ok: true };
    setCache('sismos', result);
    res.json(result);
  } catch (err) { res.status(500).json({ ok:false, error: err.message, byState:{}, all:[] }); }
});

// ─── API existente: Ciclones (NHC) ────────────────────────────────
app.get('/api/ciclones', async (req, res) => {
  const cached = getCached('ciclones');
  if (cached) return res.json(cached);
  const parser = new xml2js.Parser({ explicitArray:false, ignoreAttrs:true });
  const feeds = [
    { url:'https://www.nhc.noaa.gov/gtwo_pac.xml', basin:'Pacífico Este — Perspectiva' },
    { url:'https://www.nhc.noaa.gov/gtwo_atl.xml', basin:'Atlántico — Perspectiva' },
    { url:'https://www.nhc.noaa.gov/nhc_ep1.xml',  basin:'Sistema Activo Pacífico 1' },
    { url:'https://www.nhc.noaa.gov/nhc_at1.xml',  basin:'Sistema Activo Atlántico 1' },
  ];
  const sistemas = [];
  for (const { url, basin } of feeds) {
    try {
      const { data } = await axios.get(url, { timeout:8000 });
      const parsed = await parser.parseStringPromise(data);
      const ch = parsed?.rss?.channel;
      if (!ch) continue;
      const title = String(ch.title||''); const desc = String(ch.description||'');
      const combined = (title+' '+desc).toLowerCase();
      if (combined.includes('no active')||combined.includes('no current storm')||combined.includes('no tropical')||combined.includes('wallet')) continue;
      const rawItems = ch.item ? [].concat(ch.item) : [];
      const items = rawItems.slice(0,4).map(i => ({ title:String(i.title||'').trim(), desc:String(i.description||'').replace(/<[^>]+>/g,'').trim().slice(0,300) }));
      if (items.length || desc.length>40) sistemas.push({ basin, title, description:desc.slice(0,500), items });
    } catch(_) {}
  }
  const result = { sistemas, lastUpdated:new Date().toISOString(), ok:true };
  setCache('ciclones', result);
  res.json(result);
});

app.get('/api/status', (_req, res) => res.json({ ok:true, time:new Date().toISOString() }));

// ─── API: Noticias de un evento (Google News RSS) ─────────────────
app.get('/api/noticias-evento', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ ok: false, noticias: [] });

  const cacheKey = `noticias-evento:${q}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es-419&gl=MX&ceid=MX%3Aes-419`;
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CADENA-monitor/2.0)' }
    });

    const parsed = await xml2js.parseStringPromise(data, { explicitArray: false });
    const rawItems = parsed?.rss?.channel?.item || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    // Deduplicar por fuente: si dos artículos son del mismo medio, queda el primero (más relevante)
    const vistos = new Set();
    const noticias = [];
    for (const item of items) {
      const fuente = (item.source?._ || item.source || 'Desconocido').trim();
      if (vistos.has(fuente)) continue;
      vistos.add(fuente);
      noticias.push({
        titulo:  (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim(),
        fuente,
        fecha:   item.pubDate || '',
        link:    item.link || '',
        resumen: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 220)
      });
      if (noticias.length >= 6) break;
    }

    const resultado = { ok: true, noticias };
    setCache(cacheKey, resultado);
    res.json(resultado);
  } catch (err) {
    res.json({ ok: false, noticias: [], error: err.message });
  }
});

app.listen(PORT, () => console.log(`\n✅  CADENA Monitoreo — http://localhost:${PORT}\n`));
