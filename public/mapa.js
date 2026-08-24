/* ═══════════════════════════════════════════════════════════════════
   CADENA — Mapa de Fenómenos
   Leaflet.js — Sismos USGS + Ciclones NHC + Radar SMN
═══════════════════════════════════════════════════════════════════ */

// ─── Inicializar mapa ──────────────────────────────────────────────
const mapa = L.map('mapa', { zoomControl: true }).setView([23.5, -102.0], 5);

// Capa base OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(mapa);

// Escala
L.control.scale({ imperial: false, position: 'bottomright' }).addTo(mapa);

// ─── Grupos de capas (para limpiar antes de actualizar) ────────────
let grupoSismos   = L.layerGroup().addTo(mapa);
let grupoCiclones = L.layerGroup().addTo(mapa);
let radarLayer    = null;

// ─── Colores por magnitud ──────────────────────────────────────────
function colorSismo(mag) {
  if (mag >= 6.0) return '#c62828';
  if (mag >= 5.0) return '#e65100';
  if (mag >= 4.0) return '#f9a825';
  if (mag >= 3.0) return '#558b2f';
  return '#1565c0';
}

// ─── Etiqueta legible de magnitud ─────────────────────────────────
function labelMag(mag) {
  if (mag >= 6.0) return 'M≥6 — Fuerte';
  if (mag >= 5.0) return 'M5–6 — Moderado';
  if (mag >= 4.0) return 'M4–5 — Ligero';
  if (mag >= 3.0) return 'M3–4 — Menor';
  return 'M<3 — Micro';
}

// ─── Tiempo transcurrido legible ───────────────────────────────────
function tiempoAtras(ms) {
  const diff = Date.now() - ms;
  const min  = Math.floor(diff / 60000);
  if (min < 60)   return `hace ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24)     return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

// ─── Icono de ciclón (DivIcon con emoji) ──────────────────────────
function iconoCiclon(winds) {
  // Determinar categoría Saffir-Simpson aproximada por velocidad de viento (nudos)
  const w = parseInt(winds) || 0;
  let size, label;
  if (w >= 137)      { size = 46; label = 'Cat 5'; }
  else if (w >= 113) { size = 42; label = 'Cat 4'; }
  else if (w >= 96)  { size = 38; label = 'Cat 3'; }
  else if (w >= 83)  { size = 34; label = 'Cat 2'; }
  else if (w >= 64)  { size = 30; label = 'Cat 1'; }
  else if (w >= 34)  { size = 26; label = 'TT'; }
  else               { size = 22; label = 'DT'; }

  return L.divIcon({
    className: '',
    html: `<div style="
      font-size:${size}px;
      line-height:1;
      text-shadow: 0 0 6px rgba(0,0,0,.6), 0 0 2px #fff;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,.5));
      cursor:pointer;
      display:flex; flex-direction:column; align-items:center; gap:1px;">
      🌀
      <span style="font-size:10px;font-weight:700;color:#fff;
        background:#c62828;border-radius:3px;padding:0 3px;line-height:1.4;
        font-family:'Segoe UI',Arial,sans-serif;">${label}</span>
    </div>`,
    iconSize:   [size + 10, size + 22],
    iconAnchor: [(size + 10) / 2, size / 2]
  });
}

// ─── Dibujar sismos ────────────────────────────────────────────────
function plotSismos(sismos) {
  grupoSismos.clearLayers();

  sismos.forEach(s => {
    const radio  = Math.max(s.mag * 4, 4);
    const color  = colorSismo(s.mag);
    const circle = L.circleMarker([s.lat, s.lon], {
      radius:      radio,
      color:       color,
      fillColor:   color,
      fillOpacity: 0.7,
      weight:      1.5,
      opacity:     0.9
    });

    const fecha  = new Date(s.time);
    const local  = fecha.toLocaleString('es-MX', {
      timeZone:    'America/Mexico_City',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const hace   = tiempoAtras(s.time);

    // Query para Google News: extraer lugar (quitar distancia tipo "18km NW of ")
    const lugarLimpio = (s.place || '').replace(/^\d[\d.]*\s*km\s+\w+\s+of\s+/i, '').replace(/, Mexico$/i, '').trim();
    const queryS = `sismo ${lugarLimpio} México ${new Date(s.time).getFullYear()}`;

    circle.bindPopup(`
      <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:220px;max-width:300px;">
        <div style="background:${color};color:#fff;padding:6px 10px;margin:-1px -1px 8px;border-radius:3px 3px 0 0;font-weight:700;font-size:15px;">
          M ${s.mag}
        </div>
        <b style="font-size:12px;">${s.place || 'Localización no disponible'}</b><br>
        <div style="margin-top:6px;font-size:11.5px;color:#444;line-height:1.7;">
          🕐 ${local} (${hace})<br>
          📏 Profundidad: ${s.depth} km<br>
          🔵 ${labelMag(s.mag)}
          ${s.url ? `<br><a href="${s.url}" target="_blank" rel="noopener"
            style="color:#1565c0;font-weight:600;">Ver en USGS ↗</a>` : ''}
        </div>
        <button onclick="verNoticiasEvento(this,'${queryS.replace(/'/g,"\\'")}');"
          style="margin-top:10px;width:100%;padding:6px;background:#1C3A6B;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;">
          📰 Ver noticias
        </button>
        <div style="margin-top:4px;"></div>
      </div>
    `, { maxWidth: 320 });

    grupoSismos.addLayer(circle);
  });
}

// ─── Color de línea por vientos (kt) ──────────────────────────────
function colorTrack(winds) {
  const w = parseInt(winds) || 0;
  if (w >= 137) return '#7b1fa2'; // Cat 5
  if (w >= 113) return '#c62828'; // Cat 4
  if (w >= 96)  return '#e65100'; // Cat 3
  if (w >= 83)  return '#f57f17'; // Cat 2
  if (w >= 64)  return '#f9a825'; // Cat 1
  if (w >= 34)  return '#0277bd'; // TT
  return '#546e7a';               // DT
}

// ─── Dibujar ciclones ──────────────────────────────────────────────
function plotCiclones(ciclones) {
  grupoCiclones.clearLayers();

  ciclones.forEach(c => {
    if (!c.lat || !c.lon || isNaN(c.lat) || isNaN(c.lon)) return;

    // Trayectoria pronosticada (se dibuja primero, queda bajo el marcador)
    if (c.track && c.track.length >= 2) {
      const coords = c.track
        .filter(p => !isNaN(p.lat) && !isNaN(p.lon))
        .map(p => [p.lat, p.lon]);

      if (coords.length >= 2) {
        L.polyline(coords, {
          color: '#ff6d00',
          weight: 3,
          dashArray: '9 7',
          opacity: 0.8
        }).addTo(grupoCiclones);

        // Puntos de pronóstico (excluir INIT = posición actual)
        c.track.forEach(p => {
          if (p.label === 'INIT' || isNaN(p.lat) || isNaN(p.lon)) return;
          const col = colorTrack(p.winds);
          const dot = L.circleMarker([p.lat, p.lon], {
            radius:      6,
            color:       col,
            fillColor:   '#fff',
            fillOpacity: 1,
            weight:      2.5
          });
          dot.bindTooltip(
            `<b>${p.label}</b>: ${p.winds} kt`,
            { direction: 'top', permanent: false }
          );
          grupoCiclones.addLayer(dot);
        });
      }
    }

    const marker = L.marker([c.lat, c.lon], { icon: iconoCiclon(c.winds) });

    const tipoLabel = {
      'HU': 'Huracán', 'TS': 'Tormenta Tropical',
      'TD': 'Depresión Tropical', 'SD': 'Depresión Subtropical',
      'SS': 'Tormenta Subtropical', 'EX': 'Extratropical'
    }[c.type] || c.type;

    const trackHtml = (c.track || []).filter(p => p.label !== 'INIT').map(p =>
      `<tr><td style="color:#888;padding-right:8px;">${p.label}</td>
           <td style="font-weight:600;color:${colorTrack(p.winds)};">${p.winds} kt</td>
           <td style="color:#555;">${p.lat.toFixed(1)}°N, ${Math.abs(p.lon).toFixed(1)}°O</td></tr>`
    ).join('');

    const queryC = `${tipoLabel} ${c.name} México ${new Date().getFullYear()}`;

    marker.bindPopup(`
      <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:220px;max-width:320px;">
        <div style="background:#1C3A6B;color:#fff;padding:6px 10px;margin:-1px -1px 8px;border-radius:3px 3px 0 0;font-weight:700;font-size:15px;">
          🌀 ${c.name}
        </div>
        <div style="font-size:12px;line-height:1.8;color:#333;">
          <b>Tipo:</b> ${tipoLabel}<br>
          <b>Vientos:</b> ${c.winds} kt<br>
          <b>Posición:</b> ${c.lat.toFixed(1)}°N, ${Math.abs(c.lon).toFixed(1)}°O
          ${c.movement ? `<br><b>Movimiento:</b> ${c.movement}` : ''}
        </div>
        ${trackHtml ? `
          <div style="margin-top:8px;font-size:11.5px;font-weight:700;color:#1C3A6B;border-top:1px solid #ddd;padding-top:6px;">
            Trayectoria pronosticada
          </div>
          <table style="font-size:11px;line-height:1.9;width:100%;">${trackHtml}</table>` : ''}
        ${c.url ? `<div style="margin-top:6px;font-size:11px;">
          <a href="${c.url}" target="_blank" rel="noopener"
            style="color:#1565c0;font-weight:600;">Ver asesoría NHC ↗</a></div>` : ''}
        <button onclick="verNoticiasEvento(this,'${queryC.replace(/'/g,"\\'")}');"
          style="margin-top:10px;width:100%;padding:6px;background:#1C3A6B;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;">
          📰 Ver noticias
        </button>
        <div style="margin-top:4px;"></div>
      </div>
    `, { maxWidth: 340 });

    grupoCiclones.addLayer(marker);
  });
}

// ─── Radar SMN (falla silenciosamente) ────────────────────────────
function agregarRadarSMN() {
  if (radarLayer) {
    mapa.removeLayer(radarLayer);
    radarLayer = null;
  }
  // Límites aproximados del radar nacional SMN sobre México
  const bounds = [[14.5, -118.5], [33.0, -84.5]];
  const url    = 'https://smn.conagua.gob.mx/tools/RESOURCES/Imagenes/INTERACTIVO/radiardoppler/NACIONAL.gif';

  try {
    const overlay = L.imageOverlay(url, bounds, {
      opacity:      0.55,
      errorOverlayUrl: '',
      interactive: false
    });

    // Detectar error de carga (CORS / 404) y quitar la capa silenciosamente
    overlay.on('load', () => {
      radarLayer = overlay;
    });
    overlay.on('error', () => {
      mapa.removeLayer(overlay);
    });

    overlay.addTo(mapa);
  } catch (_) { /* silencioso */ }
}

// ─── Actualizar panel lateral: lista de sismos ─────────────────────
function renderListaSismos(sismos) {
  const lista  = document.getElementById('lista-sismos');
  const badge  = document.getElementById('badge-sismos');
  badge.textContent = sismos.length;

  if (!sismos.length) {
    lista.innerHTML = '<div class="no-data">Sin sismos en el área de México</div>';
    return;
  }

  lista.innerHTML = sismos.slice(0, 80).map((s, i) => {
    const color = colorSismo(s.mag);
    const hace  = tiempoAtras(s.time);
    const place = s.place || 'Localización desconocida';
    return `
      <div class="sismo-item" data-idx="${i}" title="${place}">
        <div class="mag-badge" style="background:${color};">${s.mag}</div>
        <div class="sismo-info">
          <div class="sismo-place">${place}</div>
          <div class="sismo-meta">${hace} · Prof. ${s.depth} km</div>
        </div>
      </div>`;
  }).join('');

  // Click en item → centrar mapa y abrir popup
  lista.querySelectorAll('.sismo-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      const s   = sismos[idx];
      mapa.setView([s.lat, s.lon], 8, { animate: true });
      // Buscar el marker correspondiente y abrir popup
      grupoSismos.getLayers().forEach((layer, li) => {
        if (li === idx) layer.openPopup();
      });
    });
  });
}

// ─── Actualizar panel lateral: lista de ciclones ───────────────────
function renderListaCiclones(ciclones) {
  const lista = document.getElementById('lista-ciclones');
  const badge = document.getElementById('badge-ciclones');
  badge.textContent = ciclones.length;

  if (!ciclones.length) {
    lista.innerHTML = '<div class="no-data">Sin ciclones activos</div>';
    return;
  }

  const tipoLabel = { 'HU': 'Huracán', 'TS': 'Tormenta Tropical', 'TD': 'Depresión Tropical', 'SD': 'Dep. Subtropical', 'SS': 'Tor. Subtropical', 'EX': 'Extratropical' };

  lista.innerHTML = ciclones.map((c, i) => `
    <div class="ciclon-item" data-idx="${i}">
      <div class="ciclon-icon">🌀</div>
      <div class="ciclon-info">
        <div class="ciclon-name">${c.name}</div>
        <div class="ciclon-meta">
          ${tipoLabel[c.type] || c.type} · ${c.winds} kt<br>
          ${!isNaN(c.lat) ? `${c.lat.toFixed(1)}°N, ${Math.abs(c.lon).toFixed(1)}°O` : 'Posición no disponible'}
        </div>
      </div>
    </div>`).join('');

  lista.querySelectorAll('.ciclon-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      const c   = ciclones[idx];
      if (!isNaN(c.lat) && !isNaN(c.lon)) {
        mapa.setView([c.lat, c.lon], 6, { animate: true });
        grupoCiclones.getLayers()[idx]?.openPopup();
      }
    });
  });
}

// ─── Leyenda ───────────────────────────────────────────────────────
function agregarLeyenda() {
  const leyenda = L.control({ position: 'bottomleft' });
  leyenda.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="legend-title">🗺 Leyenda</div>
      <div class="legend-title" style="font-size:11px;margin-bottom:4px;color:#444;">Sismos</div>
      ${[
        { color: '#c62828', label: 'M ≥ 6.0 — Fuerte' },
        { color: '#e65100', label: 'M 5.0–5.9 — Moderado' },
        { color: '#f9a825', label: 'M 4.0–4.9 — Ligero' },
        { color: '#558b2f', label: 'M 3.0–3.9 — Menor' },
        { color: '#1565c0', label: 'M < 3.0 — Micro' },
      ].map(e => `
        <div class="legend-row">
          <div class="legend-dot" style="background:${e.color};"></div>
          <span>${e.label}</span>
        </div>`).join('')}
      <hr class="legend-sep">
      <div class="legend-row">
        <span style="font-size:20px;line-height:1;">🌀</span>
        <span>Ciclón activo (NHC)</span>
      </div>
    `;
    // Prevenir que el scroll del mapa se active sobre la leyenda
    L.DomEvent.disableScrollPropagation(div);
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  leyenda.addTo(mapa);
}

// ─── Función principal de actualización ───────────────────────────
async function actualizarMapa() {
  const loader = document.getElementById('loader');
  const tsLabel = document.getElementById('ts-label');
  loader.style.display = 'block';

  try {
    const res  = await fetch('/api/mapa-datos');
    const data = await res.json();

    plotSismos(data.sismos   || []);
    plotCiclones(data.ciclones || []);
    renderListaSismos(data.sismos   || []);
    renderListaCiclones(data.ciclones || []);
    agregarRadarSMN();

    const ts = data.lastUpdated ? new Date(data.lastUpdated) : new Date();
    tsLabel.textContent = 'Actualizado: ' + ts.toLocaleString('es-MX', {
      timeZone:    'America/Mexico_City',
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (err) {
    tsLabel.textContent = 'Error al cargar datos';
    console.error('[mapa.js] Error cargando /api/mapa-datos:', err);
  } finally {
    loader.style.display = 'none';
  }
}

// ─── Noticias de un evento (Google News) ──────────────────────────
window.verNoticiasEvento = async function (btn, query) {
  const contenedor = btn.nextElementSibling;
  btn.disabled = true;
  btn.textContent = '⏳ Buscando...';

  try {
    const res  = await fetch(`/api/noticias-evento?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.ok || !data.noticias.length) {
      contenedor.innerHTML = '<div style="color:#888;font-size:11px;padding:8px 0;text-align:center;">Sin noticias encontradas</div>';
    } else {
      contenedor.innerHTML = data.noticias.map(n => {
        const fecha = n.fecha ? new Date(n.fecha).toLocaleString('es-MX', {
          day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
        }) : '';
        return `
          <div style="padding:7px 0;border-top:1px solid #e8edf2;">
            <div style="font-size:10.5px;font-weight:700;color:#1C3A6B;text-transform:uppercase;letter-spacing:.3px;">${n.fuente}</div>
            <a href="${n.link}" target="_blank" rel="noopener"
               style="font-size:11.5px;color:#1a1a1a;text-decoration:none;line-height:1.45;display:block;margin-top:2px;font-weight:600;">
              ${n.titulo}
            </a>
            ${n.resumen ? `<div style="font-size:10.5px;color:#607d8b;margin-top:3px;line-height:1.4;">${n.resumen}</div>` : ''}
            ${fecha ? `<div style="font-size:10px;color:#90a4ae;margin-top:3px;">${fecha}</div>` : ''}
          </div>`;
      }).join('');
    }

    btn.style.display = 'none';
    // Forzar refresco del tamaño del popup
    setTimeout(() => mapa.invalidateSize(), 50);
  } catch (_) {
    contenedor.innerHTML = '<div style="color:#c00;font-size:11px;padding:6px 0;">Error al cargar noticias</div>';
    btn.disabled = false;
    btn.textContent = '📰 Ver noticias';
  }
};

// ─── Bootstrap ────────────────────────────────────────────────────
agregarLeyenda();
actualizarMapa();

// Botón manual
document.getElementById('btn-actualizar').addEventListener('click', actualizarMapa);

// Auto-refresh cada 5 minutos
setInterval(actualizarMapa, 5 * 60 * 1000);
