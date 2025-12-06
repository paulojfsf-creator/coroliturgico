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
//  Calendário litúrgico (Portugal)
// ===============================

const LIT_SEASONS = {
  ADVENT: 'Advento',
  CHRISTMAS: 'Natal',
  LENT: 'Quaresma',
  EASTER: 'Páscoa',
  ORDINARY: 'Tempo Comum'
};

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function sameDate(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// Algoritmo de Butcher para a Páscoa (calendário gregoriano)
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);      // 3=Março, 4=Abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Retorna domingo entre 2 e 8 de janeiro (Epifania em Portugal)
function epiphanySunday(year) {
  const start = new Date(year, 0, 2); // 2 janeiro
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (d.getDay() === 0) return d;
  }
  return new Date(year, 0, 6);
}

function baptismOfTheLord(year) {
  const epi = epiphanySunday(year);
  return addDays(epi, 7);
}

function firstAdventSunday(year) {
  const christmas = new Date(year, 11, 25);
  let d = new Date(christmas);
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
  return addDays(d, -21);
}

function christKingSunday(year) {
  const adv1 = firstAdventSunday(year);
  return addDays(adv1, -7);
}

function getMovableFeasts(year) {
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const corpusChristi = addDays(easter, 60);
  const sacredHeart = addDays(corpusChristi, 8);
  const christKing = christKingSunday(year);

  return [
    { date: ashWednesday, key: 'ash_wed', title: 'Quarta-feira de Cinzas', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Roxo' },
    { date: palmSunday, key: 'palm', title: 'Domingo de Ramos', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Vermelho' },
    { date: holyThursday, key: 'holy_thu', title: 'Ceia do Senhor (Quinta-feira Santa)', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Branco' },
    { date: goodFriday, key: 'good_fri', title: 'Paixão do Senhor (Sexta-feira Santa)', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Vermelho' },
    { date: holySaturday, key: 'holy_sat', title: 'Sábado Santo', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Roxo' },
    { date: easter, key: 'easter', title: 'Domingo de Páscoa', season: LIT_SEASONS.EASTER, rank: 'solenidade', color: 'Branco' },
    { date: ascension, key: 'ascension', title: 'Ascensão do Senhor', season: LIT_SEASONS.EASTER, rank: 'solenidade', color: 'Branco' },
    { date: pentecost, key: 'pentecost', title: 'Pentecostes', season: LIT_SEASONS.EASTER, rank: 'solenidade', color: 'Vermelho' },
    { date: trinity, key: 'trinity', title: 'Santíssima Trindade', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: corpusChristi, key: 'corpus', title: 'Santíssimo Corpo e Sangue de Cristo', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: sacredHeart, key: 'sacred_heart', title: 'Sagrado Coração de Jesus', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: christKing, key: 'christ_king', title: 'Nosso Senhor Jesus Cristo, Rei do Universo', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: epiphanySunday(year), key: 'epiphany', title: 'Epifania do Senhor', season: LIT_SEASONS.CHRISTMAS, rank: 'solenidade', color: 'Branco' },
    { date: baptismOfTheLord(year), key: 'baptism', title: 'Batismo do Senhor', season: LIT_SEASONS.CHRISTMAS, rank: 'festa', color: 'Branco' }
  ];
}

function getFixedFeasts(year) {
  function d(m, day) {
    return new Date(year, m - 1, day);
  }
  return [
    { date: d(1, 1), key: 'mary_mother', title: 'Santa Maria, Mãe de Deus', season: LIT_SEASONS.CHRISTMAS, rank: 'solenidade', color: 'Branco' },
    { date: d(3, 19), key: 'joseph', title: 'São José, Esposo da Virgem Maria', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Branco' },
    { date: d(3, 25), key: 'annunciation', title: 'Anunciação do Senhor', season: LIT_SEASONS.LENT, rank: 'solenidade', color: 'Branco' },
    { date: d(6, 24), key: 'john_baptist', title: 'Natividade de São João Batista', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: d(6, 29), key: 'peter_paul', title: 'São Pedro e São Paulo, Apóstolos', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Vermelho' },
    { date: d(8, 15), key: 'assumption', title: 'Assunção de Nossa Senhora', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: d(11, 1), key: 'all_saints', title: 'Todos os Santos', season: LIT_SEASONS.ORDINARY, rank: 'solenidade', color: 'Branco' },
    { date: d(11, 2), key: 'all_souls', title: 'Fiéis Defuntos', season: LIT_SEASONS.ORDINARY, rank: 'comemoracao', color: 'Roxo' },
    { date: d(12, 8), key: 'immaculate', title: 'Imaculada Conceição da Virgem Santa Maria', season: LIT_SEASONS.ADVENT, rank: 'solenidade', color: 'Branco' },
    { date: d(12, 25), key: 'christmas', title: 'Natal do Senhor', season: LIT_SEASONS.CHRISTMAS, rank: 'solenidade', color: 'Branco' }
  ];
}

function getSeasonInfo(date) {
  const year = date.getFullYear();
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const adv1 = firstAdventSunday(year);
  const christmas = new Date(year, 11, 25);
  const baptism = baptismOfTheLord(year);

  const dateMid = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateMid >= adv1 && dateMid < christmas) {
    return { season: LIT_SEASONS.ADVENT };
  }
  if (dateMid >= christmas && dateMid <= baptism) {
    return { season: LIT_SEASONS.CHRISTMAS };
  }
  if (dateMid >= ashWednesday && dateMid < easter) {
    return { season: LIT_SEASONS.LENT };
  }
  if (dateMid >= easter && dateMid <= pentecost) {
    return { season: LIT_SEASONS.EASTER };
  }
  return { season: LIT_SEASONS.ORDINARY };
}

function defaultColorForSeason(season) {
  switch (season) {
    case LIT_SEASONS.ADVENT:
    case LIT_SEASONS.LENT:
      return 'Roxo';
    case LIT_SEASONS.CHRISTMAS:
    case LIT_SEASONS.EASTER:
      return 'Branco';
    case LIT_SEASONS.ORDINARY:
    default:
      return 'Verde';
  }
}

function buildGenericSundayTitle(date, season) {
  const iso = date.toISOString().slice(0, 10);
  const year = date.getFullYear();
  const easter = easterSunday(year);
  const adv1 = firstAdventSunday(year);

  if (season === LIT_SEASONS.ORDINARY) {
    const baptism = baptismOfTheLord(year);
    let count = 0;
    let d = new Date(baptism.getTime());
    while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
    while (d < adv1) {
      count++;
      const isoD = d.toISOString().slice(0, 10);
      if (isoD === iso) {
        return count + 'º Domingo do Tempo Comum';
      }
      d.setDate(d.getDate() + 7);
    }
    return 'Domingo do Tempo Comum';
  }

  if (season === LIT_SEASONS.LENT) {
    const ashWednesday = addDays(easter, -46);
    let d = addDays(ashWednesday, 4);
    let count = 1;
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    while (d < easter) {
      const isoD = d.toISOString().slice(0, 10);
      if (isoD === iso) {
        const roman = romans[count - 1] || String(count);
        return roman + ' Domingo da Quaresma';
      }
      d = addDays(d, 7);
      count++;
    }
  }

  if (season === LIT_SEASONS.ADVENT) {
    const adv1b = firstAdventSunday(date.getFullYear());
    let d = new Date(adv1b.getTime());
    let count = 1;
    const romans = ['I', 'II', 'III', 'IV'];
    while (d.getMonth() === 10 || d.getMonth() === 11) {
      const isoD = d.toISOString().slice(0, 10);
      if (isoD === iso) {
        const roman = romans[count - 1] || String(count);
        return roman + ' Domingo do Advento';
      }
      d = addDays(d, 7);
      count++;
    }
  }

  if (season === LIT_SEASONS.EASTER) {
    let d = new Date(easter.getTime());
    let count = 0;
    while (d <= addDays(easter, 49)) {
      const isoD = d.toISOString().slice(0, 10);
      if (isoD === iso) {
        if (count === 0) return 'Domingo de Páscoa';
        return count + 'º Domingo da Páscoa';
      }
      d = addDays(d, 7);
      count++;
    }
  }

  return 'Domingo';
}

function getLiturgicalInfo(date) {
  const year = date.getFullYear();
  const iso = date.toISOString().slice(0, 10);

  const movable = getMovableFeasts(year);
  for (let i = 0; i < movable.length; i++) {
    if (sameDate(date, movable[i].date)) {
      const sInfo = getSeasonInfo(date);
      return {
        dateIso: iso,
        title: movable[i].title,
        season: movable[i].season || (sInfo && sInfo.season),
        color: movable[i].color || defaultColorForSeason(sInfo.season),
        rank: movable[i].rank,
        isSunday: date.getDay() === 0,
        isSolemnity: movable[i].rank === 'solenidade'
      };
    }
  }

  const fixed = getFixedFeasts(year);
  for (let j = 0; j < fixed.length; j++) {
    if (sameDate(date, fixed[j].date)) {
      const sInfo = getSeasonInfo(date);
      return {
        dateIso: iso,
        title: fixed[j].title,
        season: fixed[j].season || (sInfo && sInfo.season),
        color: fixed[j].color || defaultColorForSeason(sInfo.season),
        rank: fixed[j].rank,
        isSunday: date.getDay() === 0,
        isSolemnity: fixed[j].rank === 'solenidade'
      };
    }
  }

  const sInfo = getSeasonInfo(date);
  const season = sInfo.season;
  const isSunday = date.getDay() === 0;

  let title = '';
  if (isSunday) {
    title = buildGenericSundayTitle(date, season);
  } else {
    title = 'Dia ferial em ' + season;
  }

  return {
    dateIso: iso,
    title: title,
    season: season,
    color: defaultColorForSeason(season),
    rank: isSunday ? 'domingo' : 'feria',
    isSunday: isSunday,
    isSolemnity: false
  };
}

function updateLiturgicalFromDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput || !dateInput.value) return;
  const dt = new Date(dateInput.value + 'T00:00:00');
  const info = getLiturgicalInfo(dt);

  const litTitleInput = document.getElementById('liturgicalTitle');
  const litColorInput = document.getElementById('liturgicalColor');

  if (litTitleInput && info.title) {
    litTitleInput.value = info.title;
  }
  if (litColorInput && info.color) {
    litColorInput.value = info.color;
  }
}

function renderMiniCalendar() {
  const listContainer = document.getElementById('nextSundays');
  const grid = document.getElementById('calendarGrid');
  const header = document.getElementById('calendarMonthYear');

  const items = [];

  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = addDays(today, i);
    const info = getLiturgicalInfo(d);
    if (info.isSunday || info.isSolemnity) {
      items.push({ date: new Date(d.getTime()), info: info });
    }
    if (items.length >= 12) break;
  }

  if (items.length === 0) {
    if (listContainer) {
      listContainer.innerHTML = '<p class="muted">Sem dados de calendário.</p>';
    }
    if (grid) grid.innerHTML = '';
    if (header) header.textContent = '';
    return;
  }

  if (listContainer) {
    let html = '<ul class="calendar-list">';
    items.forEach(function (item) {
      html += '<li>' +
        '<strong>' + formatDateIsoToPt(item.info.dateIso) + '</strong>' +
        ' — ' + item.info.title +
        ' <span class="badge-season">' + item.info.season + '</span>' +
        ' <span class="badge-color">' + item.info.color + '</span>' +
        '</li>';
    });
    html += '</ul>';
    listContainer.innerHTML = html;
  }

  if (grid && header) {
    const first = items[0];
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const d0 = first.date;
    header.textContent = monthNames[d0.getMonth()] + ' ' + d0.getFullYear();

    let html = '<div class="calendar-cards">';
    items.forEach(function (item) {
      html += '<div class="calendar-card">' +
        '<div class="calendar-card-date">' + formatDateIsoToPt(item.info.dateIso) + '</div>' +
        '<div class="calendar-card-title">' + item.info.title + '</div>' +
        '<div class="calendar-card-meta">' +
          '<span class="badge-season">' + item.info.season + '</span>' +
          '<span class="badge-color">' + item.info.color + '</span>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    grid.innerHTML = html;
  }
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
          .replace(/
/g, '\n')
          .replace(//g, '\n');
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
      updateLiturgicalFromDate();
      updatePreview();
    });
    if (dateInput.value) {
      updateLiturgicalFromDate();
    }
  }

  PROGRAM_PARTS.forEach(function (part) {
    const sel = document.getElementById(part.id);
    if (sel) {
      sel.addEventListener('change', function () {
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
  renderMiniCalendar();
  updatePreview();
}

document.addEventListener('DOMContentLoaded', initAll);
