/* ═══════════════════════════════════════════════════════════════════
   CADENA — Monitoreo de Fenómenos — Frontend v2
═══════════════════════════════════════════════════════════════════ */

// ─── Datos de los 32 estados ──────────────────────────────────────
const ESTADOS = [
  { no:  1, nombre: 'AGUASCALIENTES',    fb: 'https://www.facebook.com/proteccioncivilags?locale=es_LA',                         fbNota: null,               x: 'https://x.com/CEPCAGS',         xNota: 'no usan esta red' },
  { no:  2, nombre: 'BAJA CALIFORNIA',   fb: 'https://www.facebook.com/proteccivilbc?locale=es_LA',                              fbNota: null,               x: null,                             xNota: 'No usan esta red' },
  { no:  3, nombre: 'BAJA CALIFORNIA SUR', fb: 'https://www.facebook.com/profile.php?id=100067605695867&locale=es_LA',           fbNota: null,               x: null,                             xNota: 'No usan esta red' },
  { no:  4, nombre: 'CAMPECHE',           fb: 'https://www.facebook.com/SEPROCICAMP?locale=es_LA',                               fbNota: null,               x: 'https://x.com/SEPROCICAMP',     xNota: null },
  { no:  5, nombre: 'CHIAPAS',            fb: 'https://www.facebook.com/pcivilchiapas.chiapas?locale=es_LA',                    fbNota: null,               x: 'https://x.com/pcivilchiapas',   xNota: null },
  { no:  6, nombre: 'CHIHUAHUA',          fb: 'https://www.facebook.com/CEPC.Chihuahua?locale=es_LA',                           fbNota: null,               x: 'https://x.com/CEPC_Chih',       xNota: null },
  { no:  7, nombre: 'CIUDAD DE MÉXICO',   fb: 'https://www.facebook.com/SGIRPCCDMX?locale=es_LA',                               fbNota: null,               x: 'https://x.com/SGIRPC_CDMX',    xNota: null },
  { no:  8, nombre: 'COAHUILA',           fb: 'https://www.facebook.com/PCcoahuila/?locale=es_LA',                              fbNota: null,               x: 'https://x.com/PCcoahuila',      xNota: null },
  { no:  9, nombre: 'COLIMA',             fb: 'https://www.facebook.com/pccolima?locale=es_LA',                                 fbNota: null,               x: 'https://x.com/PC_Colima',       xNota: null },
  { no: 10, nombre: 'DURANGO',            fb: 'https://www.facebook.com/CEPCDurango/?locale=es_LA',                             fbNota: null,               x: 'https://x.com/CEPCDurango',     xNota: null },
  { no: 11, nombre: 'ESTADO DE MÉXICO',   fb: 'https://www.facebook.com/pciviledomex?locale=es_LA',                             fbNota: null,               x: 'https://x.com/pciviledomex',    xNota: null },
  { no: 12, nombre: 'GUANAJUATO',         fb: null,                                                                              fbNota: 'No usan esta red', x: 'https://x.com/PC_GTO',          xNota: null },
  { no: 13, nombre: 'GUERRERO',           fb: 'https://www.facebook.com/SGIRPCGro?locale=es_LA',                                fbNota: null,               x: 'https://x.com/PC_Guerrero',     xNota: null },
  { no: 14, nombre: 'HIDALGO',            fb: 'https://www.facebook.com/DGPCyGRHgo?locale=es_LA',                               fbNota: null,               x: 'https://x.com/SSPCyGRHgo',     xNota: null },
  { no: 15, nombre: 'JALISCO',            fb: 'https://www.facebook.com/PCJalisco19?locale=es_LA',                              fbNota: null,               x: 'https://x.com/PCJalisco',       xNota: null },
  { no: 16, nombre: 'MICHOACÁN',          fb: 'https://www.facebook.com/pcmichoacan',                                           fbNota: null,               x: 'https://x.com/pcmichoacan',     xNota: null },
  { no: 17, nombre: 'MORELOS',            fb: 'https://www.facebook.com/CoordinacionEstatalProteccionCivilMorelos',             fbNota: null,               x: 'https://x.com/PC_Morelos',      xNota: null },
  { no: 18, nombre: 'NAYARIT',            fb: 'https://www.facebook.com/proteccioncivilnay?locale=es_LA',                      fbNota: null,               x: null,                             xNota: 'No usan esta red social' },
  { no: 19, nombre: 'NUEVO LEÓN',         fb: 'https://www.facebook.com/proteccioncivilnuevoleon',                              fbNota: null,               x: 'https://x.com/PC_NuevoLeon',    xNota: null },
  { no: 20, nombre: 'OAXACA',             fb: 'https://www.facebook.com/CEPCYGRGobOax/',                                        fbNota: null,               x: 'https://x.com/PCMunOax',        xNota: null },
  { no: 21, nombre: 'PUEBLA',             fb: 'https://www.facebook.com/PCGobPue',                                              fbNota: null,               x: 'https://x.com/PC_Estatal',      xNota: null },
  { no: 22, nombre: 'QUERÉTARO',          fb: 'https://www.facebook.com/pcivilqro/?locale=es_LA',                               fbNota: null,               x: 'https://x.com/PCIVILQRO',       xNota: null },
  { no: 23, nombre: 'QUINTANA ROO',       fb: 'https://www.facebook.com/CoeprocQRoo',                                           fbNota: null,               x: 'https://x.com/ProtCivil_QRoo',  xNota: null },
  { no: 24, nombre: 'SAN LUIS POTOSÍ',    fb: 'https://www.facebook.com/proteccioncivil.slp/?locale=es_LA',                    fbNota: null,               x: 'https://x.com/PC_SLP',          xNota: null },
  { no: 25, nombre: 'SINALOA',            fb: 'https://www.facebook.com/pcsinaloa',                                             fbNota: null,               x: 'https://x.com/PC_Sinaloa',      xNota: null },
  { no: 26, nombre: 'SONORA',             fb: 'https://www.facebook.com/proteccioncivilsonora',                                 fbNota: null,               x: 'https://x.com/cepcsonora',      xNota: null },
  { no: 27, nombre: 'TABASCO',            fb: 'https://www.facebook.com/Prociviltabasco',                                       fbNota: null,               x: 'https://x.com/ProcivilTabasco', xNota: null },
  { no: 28, nombre: 'TAMAULIPAS',         fb: 'https://www.facebook.com/ProteccionCivildeTamaulipas',                          fbNota: null,               x: 'https://x.com/PCTamaulipas',    xNota: null },
  { no: 29, nombre: 'TLAXCALA',           fb: 'https://www.facebook.com/profile.php?id=100094578994135',                       fbNota: null,               x: 'https://x.com/GobTlaxcala',     xNota: null },
  { no: 30, nombre: 'VERACRUZ',           fb: 'https://www.facebook.com/secretaria.deproteccioncivil',                         fbNota: null,               x: 'https://x.com/PCEstatalVer',    xNota: null },
  { no: 31, nombre: 'YUCATÁN',            fb: 'https://www.facebook.com/procivy',                                              fbNota: null,               x: 'https://x.com/procivy',         xNota: null },
  { no: 32, nombre: 'ZACATECAS',          fb: 'https://www.facebook.com/PCEstatalZac',                                         fbNota: null,               x: 'https://x.com/PCEstatalZac',    xNota: null },
];

const DEPENDENCIAS = [
  { no: 1, nombre: 'COORDINACIÓN NACIONAL DE PROTECCIÓN CIVIL',       fb: 'https://www.facebook.com/CNPCmx',                               fbNota: null, x: 'https://x.com/CNPC_MX',        xNota: null },
  { no: 2, nombre: 'CONAGUA',                                          fb: 'https://www.facebook.com/conaguamx',                            fbNota: null, x: 'https://x.com/conagua_mx',     xNota: null },
  { no: 3, nombre: 'CONAFOR',                                          fb: 'https://www.facebook.com/CONAFOR.Central',                      fbNota: null, x: 'https://x.com/CONAFOR',        xNota: null },
  { no: 4, nombre: 'SERVICIO SISMOLÓGICO NACIONAL\n(en caso de sismo)', fb: 'https://www.facebook.com/SismologicoMX?locale=es_LA',          fbNota: null, x: 'https://x.com/SismologicoMX', xNota: null },
  { no: 5, nombre: 'OTRA QUE SE CONSIDERE RELEVANTE',                  fb: null,                                                            fbNota: null, x: null,                           xNota: null },
];

const NOTICIAS_FUENTES = [
  { id: 'milenio',   nombre: 'MILENIO',             fb: 'https://www.facebook.com/MilenioDiario',        x: null },
  { id: 'universal', nombre: 'EL UNIVERSAL',         fb: 'https://www.facebook.com/groups/eluniversalmx', x: null },
  { id: 'aristegui', nombre: 'ARISTEGUI NOTICIAS',   fb: 'https://www.facebook.com/aristeguicnn',         x: null },
  { id: 'excelsior', nombre: 'EXCÉLSIOR',            fb: 'https://www.facebook.com/ExcelsiorMex',         x: null },
  { id: 'animalpol', nombre: 'ANIMAL POLÍTICO',      fb: 'https://www.facebook.com/pajaropolitico',       x: null },
  { id: 'latinus',   nombre: 'LATINUS',              fb: 'https://www.facebook.com/Latinus',              x: null },
];

// ─── Estado del reporte ───────────────────────────────────────────
const STORAGE_KEY = 'cadena-report-v2';
let reportData = {};

function defaultRow()     { return { eventos: 'Sin novedad', fenomeno: 'NA', intervencion: 'No', auto: false }; }
function defaultNoticia() { return { eventos: '', fenomeno: '', intervencion: '', auto: false }; }

function initDefaults() {
  reportData = {
    fecha: formatFecha(new Date()), hora: formatHora(new Date()),
    responsables: 'Operaciones Humanitarias',
    estados: {}, dependencias: {}, noticias: {}
  };
  ESTADOS.forEach(e => { reportData.estados[e.nombre] = defaultRow(); });
  DEPENDENCIAS.forEach(d => { reportData.dependencias[d.nombre] = { eventos:'', fenomeno:'', intervencion:'', auto:false }; });
  NOTICIAS_FUENTES.forEach(n => { reportData.noticias[n.id] = defaultNoticia(); });
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(reportData, saved);
    ESTADOS.forEach(e => { if (!reportData.estados[e.nombre]) reportData.estados[e.nombre] = defaultRow(); });
    DEPENDENCIAS.forEach(d => { if (!reportData.dependencias[d.nombre]) reportData.dependencias[d.nombre] = { eventos:'', fenomeno:'', intervencion:'', auto:false }; });
    if (!reportData.noticias) reportData.noticias = {};
    NOTICIAS_FUENTES.forEach(n => { if (!reportData.noticias[n.id]) reportData.noticias[n.id] = defaultNoticia(); });
  } catch (_) {}
}

function saveData() {
  syncFromDOM();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData));
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatFecha(d) { return d.toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' }); }
function formatHora(d)  { return d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' }) + ' hrs'; }
function esc(s)         { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function syncFromDOM() {
  reportData.fecha        = document.getElementById('meta-fecha')?.value        || reportData.fecha;
  reportData.hora         = document.getElementById('meta-hora')?.value         || reportData.hora;
  reportData.responsables = document.getElementById('meta-responsables')?.value || reportData.responsables;
  ESTADOS.forEach(e => {
    const k = e.nombre;
    const ev = document.getElementById(`ev-${k}`)?.innerText?.trim();
    const fen= document.getElementById(`fen-${k}`)?.innerText?.trim();
    const int= document.getElementById(`int-${k}`)?.value;
    if (ev  !== undefined) reportData.estados[k].eventos      = ev;
    if (fen !== undefined) reportData.estados[k].fenomeno     = fen;
    if (int !== undefined) reportData.estados[k].intervencion = int;
  });
  DEPENDENCIAS.forEach(d => {
    const k = d.nombre;
    const ev = document.getElementById(`ev-dep-${k}`)?.innerText?.trim();
    const fen= document.getElementById(`fen-dep-${k}`)?.innerText?.trim();
    const int= document.getElementById(`int-dep-${k}`)?.value;
    if (ev  !== undefined) reportData.dependencias[k].eventos      = ev;
    if (fen !== undefined) reportData.dependencias[k].fenomeno     = fen;
    if (int !== undefined) reportData.dependencias[k].intervencion = int;
  });
}

// ─── Columna FUENTE ───────────────────────────────────────────────
function renderFuente(fb, fbNota, x, xNota) {
  let html = '<div class="fuente-links">';
  if (fb)     html += `<a href="${fb}" target="_blank" rel="noopener" class="fuente-link" title="${fb}">📘 Facebook</a>`;
  else if (fbNota) html += `<span class="fuente-link disabled">📘 ${fbNota}</span>`;
  if (x)      html += `<a href="${x}"  target="_blank" rel="noopener" class="fuente-link" title="${x}">𝕏 Twitter</a>`;
  else if (xNota)  html += `<span class="fuente-link disabled">𝕏 ${xNota}</span>`;
  html += '</div>';
  // Para impresión
  html += '<div class="fuente-print">';
  if (fb || fbNota) html += `<b>Facebook:</b> ${fb || fbNota}<br>`;
  if (x  || xNota)  html += `<b>X:</b> ${x || xNota}`;
  html += '</div>';
  return html;
}

// ─── Dropdown intervención ────────────────────────────────────────
const INTERV_OPTS = ['No','Sí','Monitoreando necesidades','Estar en monitoreo','NA','Pendiente verificar'];
function intervClass(v) {
  if (!v||v==='No'||v==='NA') return 'interv-na';
  if (v==='Sí') return 'interv-si';
  if (v.toLowerCase().includes('monitor')||v.toLowerCase().includes('estar')) return 'interv-monitor';
  return 'interv-no';
}
function renderIntervSelect(id, value) {
  const cls = intervClass(value);
  let opts = INTERV_OPTS.map(o => `<option value="${o}" ${o===value?'selected':''}>${o}</option>`).join('');
  if (!INTERV_OPTS.includes(value) && value) opts = `<option value="${value}" selected>${value}</option>` + opts;
  return `<select id="${id}" class="interv-select ${cls}" onchange="onIntervChange(this)">${opts}</select>`;
}
function onIntervChange(sel) {
  sel.className = `interv-select ${intervClass(sel.value)}`;
  saveData();
}
window.onIntervChange = onIntervChange;

// ─── Renderizado ──────────────────────────────────────────────────
function renderEstados() {
  const tbody = document.getElementById('tbody-estados');
  tbody.innerHTML = '';
  ESTADOS.forEach(e => {
    const row    = reportData.estados[e.nombre] || defaultRow();
    const isAuto = row.auto === true;
    const evCls  = isAuto ? 'td-editable auto-populated' : 'td-editable';
    const tr = document.createElement('tr');
    tr.id = `row-${e.nombre}`;
    tr.innerHTML = `
      <td class="td-no">${e.no}</td>
      <td class="td-estado">${e.nombre}</td>
      <td class="td-fuente">${renderFuente(e.fb, e.fbNota, e.x, e.xNota)}</td>
      <td id="ev-${e.nombre}"  class="${evCls}" contenteditable="true"
          data-key="${e.nombre}" data-field="eventos">${esc(row.eventos)}</td>
      <td id="fen-${e.nombre}" class="${isAuto?'td-editable auto-populated':'td-editable'}" contenteditable="true"
          data-key="${e.nombre}" data-field="fenomeno">${esc(row.fenomeno)}</td>
      <td style="vertical-align:middle;text-align:center">
        ${renderIntervSelect(`int-${e.nombre}`, row.intervencion)}
      </td>`;
    tbody.appendChild(tr);
  });
  attachEditListeners('tbody-estados', 'estados');
}

function renderDependencias() {
  const tbody = document.getElementById('tbody-dependencias');
  tbody.innerHTML = '';
  DEPENDENCIAS.forEach(d => {
    const row    = reportData.dependencias[d.nombre] || { eventos:'', fenomeno:'', intervencion:'', auto:false };
    const isAuto = row.auto === true;
    const tr = document.createElement('tr');
    tr.id = `row-dep-${d.nombre}`;
    tr.innerHTML = `
      <td class="td-no">${d.no}</td>
      <td class="td-estado">${d.nombre.replace(/\n/g,'<br>')}</td>
      <td class="td-fuente">${renderFuente(d.fb, d.fbNota, d.x, d.xNota)}</td>
      <td id="ev-dep-${d.nombre}"  class="${isAuto?'td-editable auto-populated':'td-editable'}" contenteditable="true"
          data-key="${d.nombre}" data-field="eventos" data-section="dep">${esc(row.eventos)}</td>
      <td id="fen-dep-${d.nombre}" class="td-editable" contenteditable="true"
          data-key="${d.nombre}" data-field="fenomeno" data-section="dep">${esc(row.fenomeno)}</td>
      <td style="vertical-align:middle;text-align:center">
        ${renderIntervSelect(`int-dep-${d.nombre}`, row.intervencion)}
      </td>`;
    tbody.appendChild(tr);
  });
  attachEditListeners('tbody-dependencias', 'dependencias');
}

function attachEditListeners(tbodyId, section) {
  document.getElementById(tbodyId)?.querySelectorAll('[contenteditable]').forEach(cell => {
    cell.addEventListener('blur', () => {
      const key = cell.dataset.key, field = cell.dataset.field, val = cell.innerText.trim();
      if (section === 'estados') {
        if (!reportData.estados[key]) reportData.estados[key] = defaultRow();
        reportData.estados[key][field] = val;
        reportData.estados[key].auto   = false;
        cell.classList.remove('auto-populated');
      } else {
        if (!reportData.dependencias[key]) reportData.dependencias[key] = { eventos:'',fenomeno:'',intervencion:'',auto:false };
        reportData.dependencias[key][field] = val;
        reportData.dependencias[key].auto   = false;
        cell.classList.remove('auto-populated');
      }
      saveData();
    });
  });
}

function renderNoticias() {
  const tbody = document.getElementById('tbody-noticias');
  if (!tbody) return;
  tbody.innerHTML = '';
  NOTICIAS_FUENTES.forEach((n, i) => {
    const row    = reportData.noticias?.[n.id] || defaultNoticia();
    const isAuto = row.auto === true;
    const tr = document.createElement('tr');
    tr.id = `row-not-${n.id}`;
    tr.innerHTML = `
      <td class="td-no">${i + 1}</td>
      <td class="td-estado">${n.nombre}</td>
      <td class="td-fuente">${renderFuente(n.fb, null, n.x, null)}</td>
      <td id="ev-not-${n.id}"  class="${isAuto ? 'td-editable auto-populated' : 'td-editable'}" contenteditable="true">${esc(row.eventos)}</td>
      <td id="fen-not-${n.id}" class="${isAuto ? 'td-editable auto-populated' : 'td-editable'}" contenteditable="true">${esc(row.fenomeno)}</td>
      <td style="vertical-align:middle;text-align:center">
        ${renderIntervSelect(`int-not-${n.id}`, row.intervencion)}
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderAll() {
  document.getElementById('meta-fecha').value        = reportData.fecha;
  document.getElementById('meta-hora').value         = reportData.hora;
  document.getElementById('meta-responsables').value = reportData.responsables;
  renderEstados();
  renderDependencias();
  renderNoticias();
}

// ─── Aplicar resultado de scraping a una fila ─────────────────────
function aplicarResultado(data) {
  const { seccion, nombre, id, ok, eventos, fenomeno, intervencion, motivo } = data;

  // ── Sección NOTICIAS
  if (seccion === 'noticia') {
    const notId = id || NOTICIAS_FUENTES.find(n => n.nombre === nombre)?.id;
    if (!notId) return;
    if (!reportData.noticias) reportData.noticias = {};
    if (ok && eventos) {
      reportData.noticias[notId] = { eventos, fenomeno: fenomeno || '', intervencion: intervencion || 'No', auto: true };
    }
    const evEl  = document.getElementById(`ev-not-${notId}`);
    const fenEl = document.getElementById(`fen-not-${notId}`);
    const intEl = document.getElementById(`int-not-${notId}`);
    if (evEl && ok && eventos) { evEl.innerText = eventos; evEl.classList.add('auto-populated'); }
    if (fenEl && ok && fenomeno) { fenEl.innerText = fenomeno; fenEl.classList.add('auto-populated'); }
    if (intEl && ok && intervencion) { intEl.value = intervencion; intEl.className = `interv-select ${intervClass(intervencion)}`; }
    const rowEl = document.getElementById(`row-not-${notId}`);
    if (rowEl) {
      rowEl.style.transition = 'background-color 0.5s';
      rowEl.style.backgroundColor = ok ? '#c8e6c9' : '#fff3e0';
      setTimeout(() => { rowEl.style.backgroundColor = ''; }, 2000);
    }
    saveData();
    return;
  }

  // ── Sección ESTADOS o DEPENDENCIAS
  const esEstado = seccion === 'estado';
  const store    = esEstado ? reportData.estados : reportData.dependencias;
  const prefix   = esEstado ? '' : 'dep-';

  if (!store[nombre]) store[nombre] = esEstado ? defaultRow() : { eventos:'',fenomeno:'',intervencion:'',auto:false };

  if (ok && eventos) {
    store[nombre].eventos     = eventos;
    store[nombre].fenomeno    = fenomeno || '';
    store[nombre].intervencion= intervencion || 'No';
    store[nombre].auto        = true;
  }

  const evEl  = document.getElementById(`ev-${prefix}${nombre}`);
  const fenEl = document.getElementById(`fen-${prefix}${nombre}`);
  const intEl = document.getElementById(`int-${prefix}${nombre}`);

  if (evEl && ok && eventos) { evEl.innerText = eventos; evEl.classList.add('auto-populated'); }
  if (fenEl && ok && fenomeno) { fenEl.innerText = fenomeno; fenEl.classList.add('auto-populated'); }
  if (intEl && ok && intervencion) { intEl.value = intervencion; intEl.className = `interv-select ${intervClass(intervencion)}`; }

  const rowId = esEstado ? `row-${nombre}` : `row-dep-${nombre}`;
  const rowEl = document.getElementById(rowId);
  if (rowEl) {
    rowEl.style.transition = 'background-color 0.5s';
    rowEl.style.backgroundColor = ok ? '#c8e6c9' : '#fff3e0';
    setTimeout(() => { rowEl.style.backgroundColor = ''; }, 2000);
  }

  saveData();
}

// ═══════════════════════════════════════════════════════════════════
//  PANEL DE PROGRESO (SSE en tiempo real)
// ═══════════════════════════════════════════════════════════════════
let sseSource = null;
let scrapingTotal = 0;
let scrapingOk = 0;
let scrapingSinAcceso = 0;

function abrirPanelProgreso(total) {
  scrapingTotal = total; scrapingOk = 0; scrapingSinAcceso = 0;
  let panel = document.getElementById('panel-progreso');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'panel-progreso';
    document.body.appendChild(panel);
  }
  panel.innerHTML = `
    <div class="pp-header">
      <span>📰 Obteniendo noticias del día...</span>
      <button onclick="cancelarScraping()" class="pp-btn-cancel">✖ Cancelar</button>
    </div>
    <div class="pp-bar-wrap"><div id="pp-bar" class="pp-bar" style="width:0%"></div></div>
    <div class="pp-status" id="pp-status">Iniciando navegador...</div>
    <div id="pp-log" class="pp-log"></div>
    <div id="pp-resumen" class="pp-resumen" style="display:none"></div>
  `;
  panel.style.display = 'block';
}

function actualizarProgreso(nombre, index, total) {
  const pct = Math.round(((index) / total) * 100);
  const bar = document.getElementById('pp-bar');
  const st  = document.getElementById('pp-status');
  if (bar) bar.style.width = pct + '%';
  if (st)  st.textContent  = `🔄 (${index}/${total}) ${nombre}`;
}

function agregarLog(nombre, ok, fenomeno, motivo) {
  const log = document.getElementById('pp-log');
  if (!log) return;
  const li = document.createElement('div');
  li.className = 'pp-log-item ' + (ok ? 'pp-ok' : 'pp-warn');
  li.innerHTML = ok
    ? `✅ <strong>${nombre}</strong> — ${fenomeno || 'Por verificar'}`
    : `⚠️ <strong>${nombre}</strong> — ${motivo || 'Sin acceso'}`;
  log.prepend(li);
  // Mantener solo los últimos 15
  while (log.children.length > 15) log.removeChild(log.lastChild);
}

function cerrarPanelProgreso(okCount, sinAccesoCount, total) {
  const bar = document.getElementById('pp-bar');
  if (bar) bar.style.width = '100%';
  const st = document.getElementById('pp-status');
  if (st)  st.textContent = '✅ Completado';

  const resumen = document.getElementById('pp-resumen');
  if (resumen) {
    resumen.style.display = 'block';
    resumen.innerHTML = `
      <strong>${okCount}</strong> fuentes con datos &nbsp;|&nbsp;
      <strong>${sinAccesoCount}</strong> sin acceso &nbsp;|&nbsp;
      ${new Date().toLocaleTimeString('es-MX')}
      <button onclick="document.getElementById('panel-progreso').style.display='none'" class="pp-btn-close">Cerrar panel</button>
    `;
  }
}

window.cancelarScraping = function() {
  fetch('/api/abortar').catch(() => {});
  if (sseSource) { sseSource.close(); sseSource = null; }
  const panel = document.getElementById('panel-progreso');
  if (panel) panel.style.display = 'none';
  document.getElementById('btn-noticias').disabled = false;
  document.getElementById('btn-noticias').textContent = '📰 Obtener noticias del día';
};

// ─── Obtener noticias — conecta SSE ──────────────────────────────
async function obtenerNoticias() {
  const btn = document.getElementById('btn-noticias');
  btn.disabled = true;
  btn.textContent = '⏳ Scraping en curso...';

  abrirPanelProgreso(37); // 32 estados + 4 dependencias aprox

  if (sseSource) sseSource.close();
  sseSource = new EventSource('/api/scrape-todos');

  sseSource.onmessage = (e) => {
    let data;
    try { data = JSON.parse(e.data); } catch (_) { return; }

    switch (data.tipo) {
      case 'inicio':
        abrirPanelProgreso(data.total);
        break;

      case 'progreso':
        actualizarProgreso(data.nombre, data.index, data.total);
        break;

      case 'resultado':
      case 'resultado-dep':
        aplicarResultado(data);
        if (data.ok) scrapingOk++;
        else          scrapingSinAcceso++;
        agregarLog(data.nombre, data.ok, data.fenomeno, data.motivo);
        break;

      case 'error':
        agregarLog('ERROR', false, null, data.mensaje);
        break;

      case 'fin':
        sseSource.close(); sseSource = null;
        cerrarPanelProgreso(scrapingOk, scrapingSinAcceso, scrapingTotal);
        btn.disabled = false;
        btn.textContent = '📰 Obtener noticias del día';
        saveData();
        break;
    }
  };

  sseSource.onerror = () => {
    sseSource.close(); sseSource = null;
    btn.disabled = false;
    btn.textContent = '📰 Obtener noticias del día';
    agregarLog('Conexión', false, null, 'Error de red. Intenta de nuevo.');
  };
}

// ═══════════════════════════════════════════════════════════════════
//  APIs de sismos y ciclones (datos automáticos extra)
// ═══════════════════════════════════════════════════════════════════
async function fetchSismos() {
  try {
    const res = await fetch('/api/sismos');
    const data = await res.json();
    if (!data.ok) return;

    for (const [estado, quakes] of Object.entries(data.byState || {})) {
      const cur = reportData.estados[estado];
      if (!cur || cur.eventos !== 'Sin novedad') continue;
      const top = quakes.reduce((m, q) => q.mag > m.mag ? q : m, quakes[0]);
      const texto = `Sismo M${top.mag} — ${top.place}. Prof: ${top.depth} km. ${top.time}.`;
      let interv = 'No';
      if (top.mag >= 6.0)  interv = 'Sí';
      else if (top.mag >= 4.5) interv = 'Monitoreando necesidades';
      else if (top.mag >= 3.5) interv = 'Estar en monitoreo';
      reportData.estados[estado] = { eventos: texto, fenomeno: 'Geológico', intervencion: interv, auto: true };
    }

    const ssnKey = 'SERVICIO SISMOLÓGICO NACIONAL\n(en caso de sismo)';
    if (data.all?.length) {
      const top5 = data.all.slice(0,5).map(q=>`M${q.mag} — ${q.place} (${q.time})`).join('\n');
      reportData.dependencias[ssnKey] = { eventos:`Últimos sismos USGS:\n${top5}`, fenomeno:'Geológico', intervencion: data.all[0]?.mag>=4.5?'Estar en monitoreo':'No', auto:true };
    }
    saveData(); renderAll();
  } catch (_) {}
}

async function fetchCiclones() {
  try {
    const res  = await fetch('/api/ciclones');
    const data = await res.json();
    if (!data.ok || !data.sistemas?.length) return;
    const cnpc = 'COORDINACIÓN NACIONAL DE PROTECCIÓN CIVIL';
    const resumen = data.sistemas.map(s => `[${s.basin}] ${s.title}\n${s.items?.map(i=>`• ${i.title}`).join('\n')||''}`).join('\n\n');
    reportData.dependencias[cnpc] = { eventos: resumen, fenomeno:'Hidrometeorológico', intervencion:'Estar en monitoreo', auto:true };
    saveData(); renderAll();
  } catch (_) {}
}

async function actualizarDatosAuto() {
  const btn = document.getElementById('btn-refresh');
  const dot = document.getElementById('status-indicator');
  btn.disabled = true; btn.textContent = '⏳ Consultando...'; dot.className = 'status-dot yellow';
  await Promise.all([fetchSismos(), fetchCiclones()]);
  btn.disabled = false; btn.textContent = '🔄 Sismos / Ciclones';
  dot.className = 'status-dot green';
}

// ─── Botones auxiliares ────────────────────────────────────────────
function limpiarAuto() {
  ESTADOS.forEach(e => { if (reportData.estados[e.nombre]?.auto) reportData.estados[e.nombre] = defaultRow(); });
  DEPENDENCIAS.forEach(d => { if (reportData.dependencias[d.nombre]?.auto) reportData.dependencias[d.nombre] = { eventos:'',fenomeno:'',intervencion:'',auto:false }; });
  NOTICIAS_FUENTES.forEach(n => { reportData.noticias[n.id] = defaultNoticia(); });
  saveData(); renderAll();
}

function reiniciarTabla() {
  if (!confirm('¿Reiniciar toda la tabla? Se perderán todos los datos.')) return;
  initDefaults(); saveData(); renderAll();
  document.getElementById('status-indicator').className = 'status-dot gray';
}

function imprimirReporte() { syncFromDOM(); saveData(); window.print(); }

function attachMetaListeners() {
  ['meta-fecha','meta-hora','meta-responsables'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', saveData);
  });
}

// ─── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDefaults();
  loadSaved();
  renderAll();
  attachMetaListeners();

  document.getElementById('btn-noticias').addEventListener('click', obtenerNoticias);
  document.getElementById('btn-refresh').addEventListener('click', actualizarDatosAuto);
  document.getElementById('btn-clear-auto').addEventListener('click', limpiarAuto);
  document.getElementById('btn-reset').addEventListener('click', reiniciarTabla);
  document.getElementById('btn-print').addEventListener('click', imprimirReporte);

  window.addEventListener('beforeunload', saveData);
});
