// ==== app-main.js (versão reescrita v1.2 Pro simplificada) ====

// Partes do programa litúrgico
const PROGRAM_PARTS = [
  { id: 'entrada',        label: 'Entrada',             icon: '🎉' },
  { id: 'atoPenitencial', label: 'Ato Penitencial',     icon: '🙏' },
  { id: 'gloria',         label: 'Glória',              icon: '🎶' },
  { id: 'salmo',          label: 'Salmo Responsorial',  icon: '📖' },
  { id: 'aclamacao',      label: 'Aclamação ao Evangelho', icon: '📜' },
  { id: 'ofertorio',      label: 'Ofertório',           icon: '🎁' },
  { id: 'santo',          label: 'Santo',               icon: '✨' },
  { id: 'paiNosso',       label: 'Pai Nosso',           icon: '🤲' },
  { id: 'paz',            label: 'Paz',                 icon: '🕊️' },
  { id: 'cordeiro',       label: 'Cordeiro de Deus',    icon: '🐑' },
  { id: 'comunhao',       label: 'Comunhão',            icon: '🍞' },
  { id: 'acaoGracas',     label: 'Ação de Graças',      icon: '🙌' },
  { id: 'final',          label: 'Final',               icon: '🚪' }
];
window.PROGRAM_PARTS = PROGRAM_PARTS;

// Chaves de armazenamento
const STORAGE_HISTORY_KEY = 'coroLiturgicoHistory_v2';
const STORAGE_USAGE_KEY   = 'coroSongUsage_v1';
const STORAGE_THEME_KEY   = 'coroTheme';

// Catálogo e histórico em memória
let songs = [];
let filteredSongs = [];
let history = [];
let songUsageHistory = [];
let partLyricsOverrides = {};
let currentLyricsPartId = null;
let currentSongSelectPartId = null;

// ===============================
//  Utilitários gerais
// ===============================

function safeJSONParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('JSON inválido em localStorage:', e);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Não foi possível guardar em localStorage:', key, e);
  }
}

function formatDateIsoToPt(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return iso;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ===============================
//  Tema (claro/escuro)
// ===============================

function getAutoTheme() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const hour = new Date().getHours();
  const isNight = (hour >= 20 || hour < 7);
  return (prefersDark || isNight) ? 'dark' : 'light';
}

function applyTheme(theme) {
  const root = document.documentElement;
  const effective = theme || localStorage.getItem(STORAGE_THEME_KEY) || getAutoTheme();
  const isDark = effective === 'dark';
  root.classList.toggle('dark', isDark);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo escuro';
  }
}

function initTheme() {
  applyTheme();
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      const root = document.documentElement;
      const isDark = !root.classList.contains('dark');
      const newTheme = isDark ? 'dark' : 'light';
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
      applyTheme(newTheme);
    });
  }
}

// ===============================
//  Tabs
// ===============================

function initTabs() {
  const tabButtons = document.querySelectorAll('.tabs button[data-tab]');
  if (!tabButtons.length) return;

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;
      document.querySelectorAll('.tabs button').forEach(function (b) {
        b.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(function (t) {
        t.classList.remove('active');
      });
      btn.classList.add('active');
      const tabEl = document.getElementById(tabId);
      if (tabEl) {
        tabEl.classList.add('active');
      }
    });
  });
}

// ===============================
//  Histórico de utilização de cânticos
// ===============================

function loadSongUsageHistory() {
  songUsageHistory = safeJSONParse(localStorage.getItem(STORAGE_USAGE_KEY), []) || [];
  return songUsageHistory;
}

function getLastUsageForTitle(title) {
  if (!title) return null;
  loadSongUsageHistory();
  const filtered = songUsageHistory.filter(function (e) {
    return e.title === title;
  });
  if (!filtered.length) return null;
  filtered.sort(function (a, b) {
    return String(b.date || '').localeCompare(String(a.date || ''));
  });
  return filtered[0];
}

function describeRecency(dateStr) {
  if (!dateStr) return '';
  const today = new Date();
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!y || !m || !d) return '';
  const dt = new Date(y, m - 1, d);
  if (isNaN(dt.getTime())) return '';
  const diffMs = today.getTime() - dt.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Usado hoje';
  if (diffDays === 1) return 'Usado ontem';
  if (diffDays < 7) return 'Usado há ' + diffDays + ' dias';
  const weeks = Math.round(diffDays / 7);
  if (weeks === 1) return 'Usado há 1 semana';
  if (weeks < 8) return 'Usado há ' + weeks + ' semanas';
  const months = Math.round(diffDays / 30);
  if (months === 1) return 'Usado há 1 mês';
  return 'Usado há ' + months + ' meses';
}

// Registo de utilização
window.recordSongUsage = function (titulo, secaoLabel, dateIso) {
  loadSongUsageHistory();
  const todayIso = (dateIso && String(dateIso)) || new Date().toISOString().slice(0, 10);
  const entry = {
    date: todayIso,
    section: secaoLabel || null,
    title: titulo || '',
    count: 1
  };
  const existing = songUsageHistory.find(function (e) {
    return e.date === entry.date && e.section === entry.section && e.title === entry.title;
  });
  if (existing) {
    existing.count = (existing.count || 1) + 1;
  } else {
    songUsageHistory.push(entry);
  }
  saveToStorage(STORAGE_USAGE_KEY, songUsageHistory);
};

// ===============================
//  Catálogo (CSV + Google Sheets)
// ===============================

const GOOGLE_SHEETS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTv7BD5eoTpio0s2Vjb6YCuZNmjCyG_leoWxl6v-IkIMV-LiJZNmCwhqA9j68IESZQJiU-H3ri3_flR/pub?gid=1808635095&single=true&output=csv";

function parseCsvResults(data) {
  songs = data || [];
  filteredSongs = songs.slice();
  window.songs = songs;
  refreshCatalogFilters();
  renderSongsTable();
  populateProgramSelects();
}

function loadCsvFromGoogleSheets() {
  if (typeof Papa === 'undefined') {
    console.warn('PapaParse não está disponível.');
    return;
  }
  Papa.parse(GOOGLE_SHEETS_CSV, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      parseCsvResults(results.data || []);
    },
    error: function (err) {
      console.error('Erro ao carregar CSV do Google Sheets:', err);
      const el = document.getElementById('csvError');
      if (el) {
        el.textContent = 'Erro ao carregar catálogo do Google Sheets.';
        el.style.display = 'block';
      }
    }
  });
}

function handleCsvFileInput(file) {
  if (!file) return;
  if (typeof Papa === 'undefined') {
    console.warn('PapaParse não está disponível.');
    return;
  }
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      parseCsvResults(results.data || []);
    },
    error: function (err) {
      console.error('Erro ao ler CSV local:', err);
      const el = document.getElementById('csvError');
      if (el) {
        el.textContent = 'Erro ao ler o ficheiro CSV.';
        el.style.display = 'block';
      }
    }
  });
}

function getFilteredSongs() {
  const authorFilter = (document.getElementById('filterAuthor') || {}).value || '';
  const themeFilter = (document.getElementById('filterTheme') || {}).value || '';
  const searchTerm = (document.getElementById('songSearch') || {}).value || '';
  const term = searchTerm.trim().toLowerCase();

  return songs.filter(function (s) {
    const titulo = (s.Título || s.Titulo || s.titulo || '').toLowerCase();
    const autor = (s.Autor || s.autor || '').toLowerCase();
    const tema = (s.Tema || s.tema || '').toLowerCase();

    if (authorFilter && autor.indexOf(authorFilter.toLowerCase()) === -1) return false;
    if (themeFilter && tema.indexOf(themeFilter.toLowerCase()) === -1) return false;
    if (term &&
      titulo.indexOf(term) === -1 &&
      autor.indexOf(term) === -1 &&
      tema.indexOf(term) === -1) {
      return false;
    }
    return true;
  });
}

function refreshCatalogFilters() {
  const filterAuthor = document.getElementById('filterAuthor');
  const filterTheme = document.getElementById('filterTheme');

  if (filterAuthor) {
    const authors = {};
    songs.forEach(function (s) {
      const a = (s.Autor || s.autor || '').trim();
      if (a) authors[a] = true;
    });
    const current = filterAuthor.value;
    filterAuthor.innerHTML = '<option value="">Todos</option>';
    Object.keys(authors).sort().forEach(function (a) {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      filterAuthor.appendChild(opt);
    });
    if (current) filterAuthor.value = current;
  }

  if (filterTheme) {
    const themes = {};
    songs.forEach(function (s) {
      const t = (s.Tema || s.tema || '').trim();
      if (t) {
        t.split(/[;,]/).forEach(function (part) {
          const clean = part.trim();
          if (clean) themes[clean] = true;
        });
      }
    });
    const currentT = filterTheme.value;
    filterTheme.innerHTML = '<option value="">Todos</option>';
    Object.keys(themes).sort().forEach(function (t) {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      filterTheme.appendChild(opt);
    });
    if (currentT) filterTheme.value = currentT;
  }
}

function renderSongsTable() {
  const container = document.getElementById('songsTableContainer');
  if (!container) return;

  const rows = getFilteredSongs();
  let html = '';
  if (!rows.length) {
    html = '<p class="muted">Nenhum cântico encontrado com os filtros atuais.</p>';
    container.innerHTML = html;
    return;
  }

  html += '<table class="songs-table">';
  html += '<thead><tr>' +
    '<th>Título</th><th>Tema</th><th>Autor</th><th>Partitura</th><th>Vídeo</th><th>Uso</th>' +
    '</tr></thead><tbody>';

  rows.forEach(function (song, idx) {
    const titulo = song.Título || song.Titulo || song.titulo || '';
    const tema = song.Tema || song.tema || '';
    const autor = song.Autor || song.autor || '';
    const partitura = song.Partitura || song.partitura || '';
    const video = song.Vídeo || song.video || song['vídeo'] || '';

    const lastUsage = getLastUsageForTitle(titulo);
    const usageLabel = lastUsage ? describeRecency(lastUsage.date) : 'Nunca usado';

    html += '<tr data-song-index="' + idx + '">' +
      '<td>' + titulo + '</td>' +
      '<td>' + (tema || '—') + '</td>' +
      '<td>' + (autor || '—') + '</td>' +
      '<td>' + (partitura ? '<a href="' + partitura + '" target="_blank">Abrir</a>' : '<span class="muted">—</span>') + '</td>' +
      '<td>' + (video ? '<a href="' + video + '" target="_blank">Abrir</a>' : '<span class="muted">—</span>') + '</td>' +
      '<td><span class="badge-usage">' + usageLabel + '</span></td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Preenche selects do programa com títulos do catálogo
function populateProgramSelects() {
  if (!songs || !songs.length) return;
  PROGRAM_PARTS.forEach(function (part) {
    const sel = document.getElementById(part.id);
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value=""></option>';
    songs.forEach(function (song) {
      const titulo = song.Título || song.Titulo || song.titulo || '';
      if (!titulo) return;
      const opt = document.createElement('option');
      opt.value = titulo;
      opt.textContent = titulo;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  });
}

// ===============================
//  Programa litúrgico + histórico
// ===============================

function loadHistory() {
  history = safeJSONParse(localStorage.getItem(STORAGE_HISTORY_KEY), []) || [];
  return history;
}

function saveHistory() {
  saveToStorage(STORAGE_HISTORY_KEY, history);
}

function collectProgramFromForm() {
  const dateInput = document.getElementById('date');
  const litTitleInput = document.getElementById('liturgicalTitle');
  const extraThemeInput = document.getElementById('extraTheme');

  const dateIso = dateInput && dateInput.value ? dateInput.value : '';
  const title = litTitleInput && litTitleInput.value ? litTitleInput.value : '';
  const extraTheme = extraThemeInput && extraThemeInput.value ? extraThemeInput.value : '';

  const program = {};
  PROGRAM_PARTS.forEach(function (part) {
    const sel = document.getElementById(part.id);
    program[part.id] = sel && sel.value ? sel.value : '';
  });

  return {
    date: dateIso,
    title: title,
    extraTheme: extraTheme,
    program: program
  };
}

function applyProgramToForm(rec) {
  if (!rec) return;
  const dateInput = document.getElementById('date');
  const litTitleInput = document.getElementById('liturgicalTitle');
  const extraThemeInput = document.getElementById('extraTheme');

  if (dateInput && rec.date) dateInput.value = rec.date;
  if (litTitleInput && rec.title) litTitleInput.value = rec.title;
  if (extraThemeInput && rec.extraTheme) extraThemeInput.value = rec.extraTheme;

  if (rec.program) {
    PROGRAM_PARTS.forEach(function (part) {
      const sel = document.getElementById(part.id);
      if (sel) sel.value = rec.program[part.id] || '';
    });
  }

  updatePreview();
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;

  loadHistory();
  if (!history.length) {
    container.classList.add('muted');
    container.innerHTML = 'Ainda não há domingos guardados.';
    return;
  }
  container.classList.remove('muted');

  let html = '';
  html += '<table class="history-table"><thead><tr>' +
    '<th>Data</th><th>Título</th><th>Notas</th><th>Ações</th>' +
    '</tr></thead><tbody>';

  history.slice().sort(function (a, b) {
    return String(b.date || '').localeCompare(String(a.date || ''));
  }).forEach(function (rec, idx) {
    html += '<tr>' +
      '<td>' + (formatDateIsoToPt(rec.date) || '—') + '</td>' +
      '<td>' + (rec.title || '—') + '</td>' +
      '<td>' + (rec.extraTheme || '—') + '</td>' +
      '<td>' +
        '<button type="button" class="btn secondary small" data-history-load="' + idx + '">📂 Carregar</button> ' +
        '<button type="button" class="btn secondary small" data-history-delete="' + idx + '">🗑️ Apagar</button>' +
      '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function handleHistoryClick(e) {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const loadIdxAttr = target.getAttribute('data-history-load');
  const delIdxAttr = target.getAttribute('data-history-delete');

  if (loadIdxAttr !== null) {
    const idx = parseInt(loadIdxAttr, 10);
    loadHistory();
    const rec = history[idx];
    if (rec) {
      applyProgramToForm(rec);
      if (typeof showToast === 'function') {
        showToast('Programa carregado do histórico.', 'success');
      }
    }
  } else if (delIdxAttr !== null) {
    const idx = parseInt(delIdxAttr, 10);
    loadHistory();
    const rec = history[idx];
    if (!rec) return;
    const label = rec.title || formatDateIsoToPt(rec.date) || 'este programa';
    if (!window.confirm('Tens a certeza que queres eliminar "' + label + '" do histórico?')) {
      return;
    }
    history.splice(idx, 1);
    saveHistory();
    renderHistory();
    if (typeof showToast === 'function') {
      showToast('Programa eliminado do histórico.', 'info');
    }
  }
}

// ===============================
//  Folheto – versão simplificada
// ===============================

function buildLeafletHtml(includeLyrics) {
  const rec = collectProgramFromForm();
  const dateLabel = formatDateIsoToPt(rec.date) || '';
  const title = rec.title || 'Programa litúrgico';
  const extraTheme = rec.extraTheme || '';

  let html = '';
  html += '<div class="leaflet-a4">';
  html += '<h2 class="leaflet-title">' + title + '</h2>';
  if (dateLabel) {
    html += '<div class="leaflet-meta">' + dateLabel + '</div>';
  }
  if (extraTheme) {
    html += '<div class="leaflet-meta">' + extraTheme + '</div>';
  }

  html += '<div class="leaflet-songs">';
  PROGRAM_PARTS.forEach(function (part) {
    const sel = document.getElementById(part.id);
    const titleSong = sel && sel.value ? sel.value : '';
    if (!titleSong) return;
    html += '<div class="leaflet-song">';
    html += '<div class="leaflet-song-title">' + part.label + ' — ' + titleSong + '</div>';
    if (includeLyrics) {
      const songInfo = songs.find(function (s) {
        const t = s.Título || s.Titulo || s.titulo || '';
        return t === titleSong;
      }) || {};
      const baseLyrics = (songInfo.Letra || songInfo.letra || '').trim();
      const override = (partLyricsOverrides[part.id] || '').trim();
      const effective = override || baseLyrics;
      if (effective) {
        let htmlLyrics = String(effective)
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n');
        htmlLyrics = htmlLyrics.split('\n').map(function (l) {
          return l.replace(/\s+$/g, '');
        }).join('<br>');
        html += '<div class="leaflet-song-lyrics folheto-letra">' + htmlLyrics + '</div>';
      } else {
        html += '<div class="leaflet-song-meta"><em>Letra não disponível.</em></div>';
      }
    }
    html += '</div>';
  });
  html += '</div>';
  html += '</div>';

  return html;
}

function showLeafletModal(includeLyrics) {
  const backdrop = document.getElementById('leafletModalBackdrop');
  const contentEl = document.getElementById('leafletViewContent');
  const titleEl = document.getElementById('leafletViewTitle');

  if (!backdrop || !contentEl || !titleEl) return;

  const html = buildLeafletHtml(includeLyrics);
  contentEl.innerHTML = html;
  titleEl.textContent = includeLyrics ? 'Folheto da assembleia (com letras)' : 'Folheto da assembleia (sem letras)';
  backdrop.hidden = false;
}

function initLeaflet() {
  const btnAssembly = document.getElementById('assemblySheetBtn');
  const btnAssemblyNoLyrics = document.getElementById('assemblySheetBtnNoLyrics');
  const modalBackdrop = document.getElementById('leafletModalBackdrop');
  const btnClose = document.getElementById('leafletViewClose');
  const btnPrint = document.getElementById('leafletViewPrint');

  if (btnAssembly) {
    btnAssembly.addEventListener('click', function () {
      showLeafletModal(true);
    });
  }
  if (btnAssemblyNoLyrics) {
    btnAssemblyNoLyrics.addEventListener('click', function () {
      showLeafletModal(false);
    });
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) {
        modalBackdrop.hidden = true;
      }
    });
  }
  if (btnClose) {
    btnClose.addEventListener('click', function () {
      if (modalBackdrop) modalBackdrop.hidden = true;
    });
  }
  if (btnPrint) {
    btnPrint.addEventListener('click', function () {
      window.print();
    });
  }
}

// ===============================
//  Preview simples do programa
// ===============================

function updatePreview() {
  const container = document.getElementById('previewContainer');
  if (!container) return;
  const rec = collectProgramFromForm();
  let html = '';
  html += '<div class="preview-card">';
  html += '<h3>' + (rec.title || 'Programa litúrgico') + '</h3>';
  if (rec.date) {
    html += '<div class="meta">' + formatDateIsoToPt(rec.date) + '</div>';
  }
  if (rec.extraTheme) {
    html += '<div class="meta">' + rec.extraTheme + '</div>';
  }
  html += '<ul class="preview-parts">';
  PROGRAM_PARTS.forEach(function (part) {
    const sel = document.getElementById(part.id);
    const titleSong = sel && sel.value ? sel.value : '';
    if (!titleSong) return;
    html += '<li><strong>' + part.label + ':</strong> ' + titleSong + '</li>';
  });
  html += '</ul>';
  html += '</div>';
  container.innerHTML = html;
}

// ===============================
//  Edição de letra (versão simples)
// ===============================

function openLyricsModalForPart(partId) {
  const select = document.getElementById(partId);
  if (!select || !select.value) {
    if (typeof showToast === 'function') {
      showToast('Escolhe primeiro um cântico para essa parte.', 'error');
    }
    return;
  }
  const title = select.value;
  currentLyricsPartId = partId;

  // Vamos usar uma janela simples por agora
  const existing = partLyricsOverrides[partId] || '';
  const baseInfo = songs.find(function (s) {
    const t = s.Título || s.Titulo || s.titulo || '';
    return t === title;
  }) || {};
  const baseLyrics = (baseInfo.Letra || baseInfo.letra || '').trim();
  const initial = existing || baseLyrics || '';

  const edited = window.prompt('Editar letra para "' + title + '":', initial);
  if (edited === null) {
    return;
  }
  partLyricsOverrides[partId] = edited;
  if (typeof showToast === 'function') {
    showToast('Letra atualizada para "' + title + '".', 'success');
  }
  updatePreview();
}

function initProgramButtons() {
  document.querySelectorAll('.program-select-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const partId = btn.getAttribute('data-part-id');
      if (!partId) return;
      currentSongSelectPartId = partId;
      // Por enquanto, apenas focar no select correspondente
      const sel = document.getElementById(partId);
      if (sel) {
        sel.focus();
      }
    });
  });

  document.querySelectorAll('.program-lyrics-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const partId = btn.getAttribute('data-part-id');
      if (!partId) return;
      openLyricsModalForPart(partId);
    });
  });

  // program-media-btn: por agora apenas abrir links do catálogo num novo separador se existirem
  document.querySelectorAll('.program-media-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const partId = btn.getAttribute('data-part-id');
      if (!partId) return;
      const sel = document.getElementById(partId);
      if (!sel || !sel.value) return;
      const title = sel.value;
      const songInfo = songs.find(function (s) {
        const t = s.Título || s.Titulo || s.titulo || '';
        return t === title;
      }) || {};
      const video = songInfo.Vídeo || songInfo.video || songInfo['vídeo'] || '';
      if (video) {
        window.open(video, '_blank');
      } else if (typeof showToast === 'function') {
        showToast('Não há vídeo/áudio associado a este cântico.', 'warning');
      }
    });
  });
}

// ===============================
//  Inicialização
// ===============================

function initCatalogSection() {
  const csvInput = document.getElementById('csvFile');
  const loadCsvBtn = document.getElementById('loadCsvBtn');
  const filterAuthor = document.getElementById('filterAuthor');
  const filterTheme = document.getElementById('filterTheme');
  const songSearch = document.getElementById('songSearch');

  if (csvInput && loadCsvBtn) {
    loadCsvBtn.addEventListener('click', function () {
      if (!csvInput.files || !csvInput.files.length) {
        if (typeof showToast === 'function') {
          showToast('Escolhe primeiro um ficheiro CSV.', 'error');
        }
        return;
      }
      handleCsvFileInput(csvInput.files[0]);
    });
  }

  [filterAuthor, filterTheme, songSearch].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      renderSongsTable();
    });
  });

  // Carregar catálogo inicial a partir do Google Sheets
  loadCsvFromGoogleSheets();
}

function initProgramForm() {
  const form = document.getElementById('programForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const rec = collectProgramFromForm();
      if (!rec.date) {
        if (typeof showToast === 'function') {
          showToast('Escolhe primeiro a data.', 'error');
        }
        return;
      }
      loadHistory();
      // substituir se já existir domingo com a mesma data
      const existingIndex = history.findIndex(function (h) {
        return h.date === rec.date;
      });
      if (existingIndex >= 0) {
        history[existingIndex] = rec;
      } else {
        history.push(rec);
      }
      saveHistory();
      renderHistory();
      updatePreview();
      if (typeof showToast === 'function') {
        showToast('Programa guardado no histórico.', 'success');
      }
    });
  }

  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.addEventListener('change', function () {
      updatePreview();
    });
  }

  PROGRAM_PARTS.forEach(function (part) {
    const sel = document.getElementById(part.id);
    if (sel) {
      sel.addEventListener('change', function () {
        // registar utilização
        if (window.recordSongUsage && sel.value) {
          const dateIso = (document.getElementById('date') || {}).value || null;
          window.recordSongUsage(sel.value, part.label, dateIso);
        }
        updatePreview();
      });
    }
  });
}

function initHistorySection() {
  const container = document.getElementById('historyContainer');
  if (container) {
    container.addEventListener('click', handleHistoryClick);
  }
  renderHistory();
}

function initAll() {
  initTheme();
  initTabs();
  initCatalogSection();
  initProgramForm();
  initProgramButtons();
  initHistorySection();
  initLeaflet();
  updatePreview();
}

document.addEventListener('DOMContentLoaded', initAll);
