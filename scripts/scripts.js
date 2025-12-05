// ==== app-main.js ====
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


  let songs = [];
  let history = [];
  let partLyricsOverrides = {};
  let currentLyricsPartId = null;
  let currentSongSelectPartId = null;
  let partExtraData = {}; // dados extra por parte: título/tom/letra/acordes/notas
  let songUsageHistory = []; // histórico de utilização de cânticos
  // Registo de utilização de cânticos (para histórico e etiquetas)
  window.recordSongUsage = function(titulo, secaoLabel, dateIso) {
    try {
      const key = 'coroSongUsage_v1';
      const raw = localStorage.getItem(key);
      songUsageHistory = raw ? JSON.parse(raw) : [];
    } catch (e) {
      songUsageHistory = [];
    }
    const todayIso = (dateIso && String(dateIso)) || new Date().toISOString().slice(0,10);
    const entry = {
      date: todayIso,
      section: secaoLabel || null,
      title: titulo || '',
      count: 1
    };
  function loadSongUsageHistory() {
    try {
      const raw = localStorage.getItem('coroSongUsage_v1');
      songUsageHistory = raw ? JSON.parse(raw) : [];
    } catch (e) {
      songUsageHistory = [];
    }
    return songUsageHistory;
  }

  function getLastUsageForTitle(title) {
    if (!title) return null;
    loadSongUsageHistory();
    const filtered = songUsageHistory.filter(function(e) { return e.title === title; });
    if (!filtered.length) return null;
    filtered.sort(function(a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    return filtered[0];
  }

  function describeRecency(dateStr) {
    if (!dateStr) return '';
    const today = new Date();
    const [y, m, d] = dateStr.split('-').map(function(v) { return parseInt(v, 10); });
    if (!y || !m || !d) return '';
    const dt = new Date(y, m - 1, d);
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

    const existing = songUsageHistory.find(function(e) {
      return e.date === entry.date && e.section === entry.section && e.title === entry.title;
    });
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      songUsageHistory.push(entry);
    }
    try {
      localStorage.setItem('coroSongUsage_v1', JSON.stringify(songUsageHistory));
    } catch (e) {
      console.warn('Não foi possível guardar histórico de cânticos:', e);
    }
  };

  function loadSongUsageHistory() {
    try {
      const raw = localStorage.getItem('coroSongUsage_v1');
      songUsageHistory = raw ? JSON.parse(raw) : [];
    } catch (e) {
      songUsageHistory = [];
    }
    return songUsageHistory;
  }

  function getLastUsageForTitle(title) {
    if (!title) return null;
    loadSongUsageHistory();
    const filtered = songUsageHistory.filter(function(e) { return e.title === title; });
    if (!filtered.length) return null;
    filtered.sort(function(a, b) {
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



  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'success' ? 'toast--success' : type === 'error' ? 'toast--error' : '');
    el.innerHTML = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toast-out 0.2s forwards';
      setTimeout(() => container.removeChild(el), 200);
    }, 2500);
  }

  function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }
  function diffWeeks(a, b) {
    return Math.round((a - b) / (7 * 24 * 60 * 60 * 1000));
  }
  
  function warnIfProgramHasVeryRecentSongs(program) {
    if (!program || !program.parts) return;
    loadSongUsageHistory();
    const today = new Date();
    const recentWarnings = [];
    program.parts.forEach(function(p) {
      if (!p.title) return;
      const last = getLastUsageForTitle(p.title);
      if (!last || !last.date) return;
      const parts = last.date.split('-');
      if (parts.length !== 3) return;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!y || !m || !d) return;
      const dt = new Date(y, m - 1, d);
      const diffDays = Math.round((today - dt) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        recentWarnings.push(p.label + ' — ' + p.title + ' (' + describeRecency(last.date) + ')');
      }
    });
    if (recentWarnings.length && typeof showToast === 'function') {
      showToast('Atenção: alguns cânticos foram usados muito recentemente:\n' + recentWarnings.join('\n'), 'warning');
    }
  }
function sameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function calculateEaster(year) {
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
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = 1 + ((h + l - 7 * m + 114) % 31);
    return new Date(year, month - 1, day);
  }

  function firstSundayOnOrAfter(date) {
    const d = new Date(date.getTime());
    const dow = d.getDay();
    const diff = (7 - dow) % 7;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function firstSundayOfAdvent(year) {
    // Domingo que cai em ou depois de 27 de novembro
    return firstSundayOnOrAfter(new Date(year, 10, 27));
  }

  function calculateBaptismOfTheLord(year) {
    // Domingo depois de 6 de janeiro (Epifania fixa a 6)
    const epiphany = new Date(year, 0, 6);
    const d = new Date(epiphany.getTime());
    d.setDate(d.getDate() + 1);
    return firstSundayOnOrAfter(d);
  }


// Festas / Solenidades / Memórias (geral + Braga) para qualquer ano
function getFeastForDate(date) {
  if (!date || !(date instanceof Date)) return null;
  const year = date.getFullYear();

  function md(month, day) {
    return new Date(year, month - 1, day);
  }
  function isSame(d) {
    return sameDate(date, d);
  }

  const easter = calculateEaster(year);
  const palmSunday   = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const goodFriday   = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const divineMercy  = addDays(easter, 7);
  const ascension    = addDays(easter, 42);
  const pentecost    = addDays(easter, 49);
  const trinity      = addDays(easter, 56);
  const corpusChristi= addDays(easter, 60);
  const sacredHeart  = addDays(easter, 68);

  const christmas = md(12, 25);
  let holyFamily = null;
  if (christmas.getDay() === 0) {
    holyFamily = md(12, 30);
  } else {
    for (let d = 26; d <= 31; d++) {
      const cand = md(12, d);
      if (cand.getDay() === 0) {
        holyFamily = cand;
        break;
      }
    }
  }

  const adventStart = firstSundayOfAdvent(year);
  const christKing  = addDays(adventStart, -7);

  // Tríduo Pascal e Páscoa
  if (isSame(palmSunday))   return { name: 'Domingo de Ramos e da Paixão do Senhor', type: 'Festa' };
  if (isSame(holyThursday)) return { name: 'Ceia do Senhor', type: 'Solenidade' };
  if (isSame(goodFriday))   return { name: 'Paixão do Senhor', type: 'Solenidade' };
  if (isSame(holySaturday)) return { name: 'Sábado Santo', type: 'Comemoração' };
  if (isSame(easter))       return { name: 'Páscoa da Ressurreição do Senhor', type: 'Solenidade' };
  if (isSame(divineMercy))  return { name: 'Domingo da Divina Misericórdia', type: 'Festa' };
  if (isSame(ascension))    return { name: 'Ascensão do Senhor', type: 'Solenidade' };
  if (isSame(pentecost))    return { name: 'Domingo de Pentecostes', type: 'Solenidade' };
  if (isSame(trinity))      return { name: 'Santíssima Trindade', type: 'Solenidade' };
  if (isSame(corpusChristi))return { name: 'Santíssimo Corpo e Sangue de Cristo', type: 'Solenidade' };
  if (isSame(sacredHeart))  return { name: 'Sagrado Coração de Jesus', type: 'Solenidade' };

  // Natal + Sagrada Família
  if (isSame(christmas))    return { name: 'Natal do Senhor', type: 'Solenidade' };
  if (holyFamily && isSame(holyFamily)) {
    return { name: 'Sagrada Família de Jesus, Maria e José', type: 'Festa' };
  }

  // Datas fixas principais
  if (isSame(md(1, 1)))  return { name: 'Santa Maria, Mãe de Deus', type: 'Solenidade' };
  if (isSame(md(1, 6)))  return { name: 'Epifania do Senhor', type: 'Solenidade' };
  if (isSame(md(2, 2)))  return { name: 'Apresentação do Senhor', type: 'Festa' };
  if (isSame(md(3, 19))) return { name: 'São José', type: 'Solenidade' };
  if (isSame(md(3, 25))) return { name: 'Anunciação do Senhor', type: 'Solenidade' };
  if (isSame(md(6, 24))) return { name: 'Nascimento de São João Batista', type: 'Solenidade' };
  if (isSame(md(6, 29))) return { name: 'Apóstolos São Pedro e São Paulo', type: 'Solenidade' };
  if (isSame(md(8, 15))) return { name: 'Assunção da Virgem Santa Maria', type: 'Solenidade' };
  if (isSame(md(11, 1))) return { name: 'Todos os Santos', type: 'Solenidade' };
  if (isSame(md(11, 2))) return { name: 'Comemoração de Todos os Fiéis Defuntos', type: 'Comemoração' };
  if (isSame(md(12, 8))) return { name: 'Imaculada Conceição da Virgem Santa Maria', type: 'Solenidade' };

  // Portugal
  if (isSame(md(5, 13))) return { name: 'Nossa Senhora de Fátima', type: 'Memória' };

  // Cristo Rei
  if (isSame(christKing)) {
    return { name: 'Nosso Senhor Jesus Cristo, Rei do Universo', type: 'Solenidade' };
  }

  // Calendário próprio de Braga (datas fixas)
  // Janeiro
  if (isSame(md(1, 10))) return { name: 'Beato Gonçalo de Amarante, presbítero', type: 'Memória' };
  if (isSame(md(1, 15))) return { name: 'Santo Amaro, abade', type: 'Memória' };

  // Fevereiro
  if (isSame(md(2, 27))) return { name: 'São Félix de Braga (Torcato), bispo', type: 'Memória' };

  // Março
  if (isSame(md(3, 1)))  return { name: 'São Rosendo, bispo', type: 'Memória' };

  // Abril
  if (isSame(md(4, 12))) return { name: 'São Vítor, mártir', type: 'Memória' };
  if (isSame(md(4, 22))) return { name: 'Santa Senhorinha, abadessa', type: 'Memória' };
  if (isSame(md(4, 26))) return { name: 'São Pedro de Rates, bispo, padroeiro secundário da Arquidiocese', type: 'Memória' };

  // Junho
  if (isSame(md(6, 12))) return { name: 'Virgem Santa Maria do Sameiro', type: 'Festa' };
  if (isSame(md(6, 26))) return { name: 'São Paio, mártir', type: 'Memória' };

  // Julho
  if (isSame(md(7, 17))) return { name: 'Bem-aventurados Brás Ribeiro, João Fernandes, Inácio de Azevedo e companheiros, mártires', type: 'Memória' };
  if (isSame(md(7, 18))) return { name: 'São Bartolomeu dos Mártires, bispo', type: 'Memória' };
  if (isSame(md(7, 28))) return { name: 'Beato Mário de Gouveia, mártir', type: 'Memória' };

  // Agosto
  if (isSame(md(8, 2)))  return { name: 'São Gualter, presbítero', type: 'Memória' };
  if (isSame(md(8, 25))) return { name: 'Beato Miguel Carvalho, presbítero e mártir', type: 'Memória' };
  if (isSame(md(8, 28))) return { name: 'Aniversário da Dedicação da Igreja Catedral de Braga', type: 'Festa' }; // na catedral seria solenidade

  // Outubro
  if (isSame(md(10, 13))) return { name: 'Beata Alexandrina Maria da Costa, virgem', type: 'Memória' };
  if (isSame(md(10, 19))) return { name: 'São Frutuoso de Braga, bispo', type: 'Memória' };
  if (isSame(md(10, 21))) return { name: 'São João Paulo II, papa', type: 'Memória' };
  if (isSame(md(10, 22))) return { name: 'São Martinho de Braga, bispo, padroeiro principal da Arquidiocese', type: 'Solenidade' };

  // Dezembro
  if (isSame(md(12, 5)))  return { name: 'São Geraldo de Braga, bispo', type: 'Memória' };
  if (isSame(md(12, 10))) return { name: 'Santa Eulália, virgem e mártir', type: 'Memória' };

  return null;
}


    function toRoman(num) {
    if (!num) return '';
    const romans = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let res = '';
    for (const [val, sym] of romans) {
      while (num >= val) {
        res += sym;
        num -= val;
      }
    }
    return res;
  }

  function getSundayCycle(date) {
    // Usa o ano civil, ajustando a partir do 1º domingo do Advento
    let year = date.getFullYear();
    const adventStart = firstSundayOfAdvent(year);
    if (date >= adventStart) {
      year = year + 1;
    }
    const mod = year % 3;
    if (mod === 1) return 'A';
    if (mod === 2) return 'B';
    return 'C';
  }

  function getOrdinaryTimeSundayNumber(date, easter, ashWed, pentecost, adventStart) {
    const year = date.getFullYear();
    const baptism = calculateBaptismOfTheLord(year);
    const firstOTSunday = addDays(baptism, 7);      // 2º Domingo do TC
    const sundayBeforeAsh = addDays(ashWed, -3);    // Domingo antes de 4ª feira de cinzas
    const sundayAfterPent = addDays(pentecost, 7);  // Domingo depois de Pentecostes
    const lastOTSunday  = addDays(adventStart, -7); // Domingo antes do 1º do Advento

    if (date < firstOTSunday || date > lastOTSunday) return null;
    if (date > addDays(ashWed, -1) && date < addDays(pentecost, 1)) return null;
    if (date.getDay() !== 0) return null; // só domingos

    // Antes da Quaresma: progressivo desde o 2º Domingo do TC
    if (date <= sundayBeforeAsh) {
      return 2 + diffWeeks(date, firstOTSunday);
    }
    // Depois de Pentecostes: conta de trás para a frente para garantir que o último é o XXXIV
    return 34 - diffWeeks(lastOTSunday, date);
  }

  function getLiturgicalInfo(date) {
    const year = date.getFullYear();
    const easter = calculateEaster(year);
    const ashWed = addDays(easter, -46);
    const pentecost = addDays(easter, 49);
    const adventStart = firstSundayOfAdvent(year);

    const cycle = getSundayCycle(date);
    const dow = date.getDay();

    let season = 'Tempo Comum';
    let title = '';
    let sundayNumber = null;

    // Determinar tempo litúrgico principal
    const christmasStartPrev = new Date(year - 1, 11, 25);
    const baptismThis = calculateBaptismOfTheLord(year);
    const christmasStartThis = new Date(year, 11, 25);
    const ashWedStart = ashWed;
    const easterOctaveEnd = addDays(easter, 7);

    const inChristmas =
      (date >= christmasStartPrev && date < baptismThis) ||
      (date >= christmasStartThis && date < calculateBaptismOfTheLord(year + 1));

    if (date >= adventStart || date < christmasStartPrev) {
      season = 'Advento';
    } else if (inChristmas) {
      season = 'Natal';
    } else if (date >= ashWedStart && date < easter) {
      season = 'Quaresma';
    } else if (date >= easter && date < pentecost) {
      season = 'Páscoa';
    } else {
      season = 'Tempo Comum';
    }

    // Solenidades fixas principais (Portugal - sem transferência para domingo)
    let isSolemnity = false;
    const mm = date.getMonth() + 1;
    const dd = date.getDate();

    if (mm === 12 && dd === 25) {
      // Natividade do Senhor (Natal)
      season = 'Natal';
      title = 'Solenidade da Natividade do Senhor';
      isSolemnity = true;
    } else if (mm === 1 && dd === 1) {
      // Santa Maria Mãe de Deus
      season = 'Natal';
      title = 'Solenidade de Santa Maria, Mãe de Deus';
      isSolemnity = true;
    } else if (mm === 1 && dd === 6) {
      // Epifania do Senhor
      season = 'Natal';
      title = 'Solenidade da Epifania do Senhor';
      isSolemnity = true;
    } else if (mm === 3 && dd === 19) {
      // São José
      season = season || 'Tempo Comum';
      title = 'Solenidade de São José, Esposo da Virgem Maria';
      isSolemnity = true;
    } else if (mm === 3 && dd === 25) {
      // Anunciação do Senhor
      season = season || 'Tempo Comum';
      title = 'Solenidade da Anunciação do Senhor';
      isSolemnity = true;
    } else if (mm === 8 && dd === 15) {
      // Assunção de Nossa Senhora
      season = season || 'Tempo Comum';
      title = 'Solenidade da Assunção de Nossa Senhora';
      isSolemnity = true;
    } else if (mm === 12 && dd === 8) {
      // Imaculada Conceição
      season = season || 'Tempo Comum';
      title = 'Solenidade da Imaculada Conceição';
      isSolemnity = true;
    }

    // Se for solenidade em dia de semana, não calcular número de domingo
    if (isSolemnity && dow !== 0) {
      return {
        title,
        season,
        cycle,
        sundayNumber: null,
        sundayRoman: '—'
      };
    }


    // Solenidades móveis principais ligadas à Páscoa
    const ascension = addDays(easter, 39);      // Quinta-feira da Ascensão
    const pentecostSunday = pentecost;         // já calculado acima
    const trinitySunday = addDays(pentecostSunday, 7);
    const corpusChristi = addDays(trinitySunday, 4); // Quinta-feira seguinte
    const sacredHeart = addDays(corpusChristi, 8);   // Sexta-feira seguinte

    let movableSolemnity = null;
    if (sameDate(date, ascension)) {
      movableSolemnity = {
        id: 'ascension',
        title: 'Solenidade da Ascensão do Senhor',
        seasonHint: 'Páscoa',
        color: 'white'
      };
    } else if (sameDate(date, pentecostSunday)) {
      movableSolemnity = {
        id: 'pentecost',
        title: 'Solenidade de Pentecostes',
        seasonHint: 'Páscoa',
        color: 'red'
      };
    } else if (sameDate(date, trinitySunday)) {
      movableSolemnity = {
        id: 'trinity',
        title: 'Solenidade da Santíssima Trindade',
        seasonHint: 'Tempo Comum',
        color: 'white'
      };
    } else if (sameDate(date, corpusChristi)) {
      movableSolemnity = {
        id: 'corpus_christi',
        title: 'Solenidade do Santíssimo Corpo e Sangue de Cristo',
        seasonHint: 'Tempo Comum',
        color: 'white'
      };
    } else if (sameDate(date, sacredHeart)) {
      movableSolemnity = {
        id: 'sacred_heart',
        title: 'Solenidade do Sagrado Coração de Jesus',
        seasonHint: 'Tempo Comum',
        color: 'white'
      };
    }

    // Combinar solenidades fixas e móveis
    let chosenSolemnity = null;
    if (isSolemnity) {
      chosenSolemnity = {
        id: 'fixed',
        title,
        seasonHint: season,
        color: null
      };
    }
    if (movableSolemnity) {
      // Se houver solenidade móvel neste dia, prevalece sobre a fixa
      chosenSolemnity = movableSolemnity;
      if (movableSolemnity.seasonHint) {
        season = movableSolemnity.seasonHint;
      }
      title = movableSolemnity.title;
    }

    // Não permitir que nenhuma solenidade substitua o Tríduo Pascal (Quinta Santa até Domingo de Páscoa)
    const triduumStart = addDays(easter, -3); // Quinta-feira Santa
    const triduumEnd = easter;               // Domingo de Páscoa
    const inTriduum = date >= triduumStart && date <= triduumEnd;

    if (inTriduum) {
      chosenSolemnity = null;
    }

    // Se for solenidade em dia de semana (não domingo) e for a celebração do dia
    if (chosenSolemnity && dow !== 0) {
      if (chosenSolemnity.seasonHint) {
        season = chosenSolemnity.seasonHint;
      }
      return {
        title: chosenSolemnity.title,
        season,
        cycle,
        sundayNumber: null,
        sundayRoman: '—',
        color: chosenSolemnity.color || null
      };
    }

    if (dow === 0) {
      if (season === 'Tempo Comum') {
        sundayNumber = getOrdinaryTimeSundayNumber(date, easter, ashWed, pentecost, adventStart);
        if (sundayNumber !== null) {
          title = toRoman(sundayNumber) + ' Domingo do Tempo Comum';
        } else {
          title = 'Domingo do Tempo Comum';
        }
      } else if (season === 'Advento') {
        const firstAdv = adventStart;
        const n = 1 + Math.floor((date - firstAdv) / (7 * 24 * 60 * 60 * 1000));
        sundayNumber = n;
        title = toRoman(n) + ' Domingo do Advento';
      } else if (season === 'Natal') {
        const christmasStart = date.getMonth() === 11 ? christmasStartThis : christmasStartPrev;
        const n = 1 + Math.floor((date - christmasStart) / (7 * 24 * 60 * 60 * 1000));
        sundayNumber = n;
        title = toRoman(n) + ' Domingo do Tempo de Natal';
      } else if (season === 'Quaresma') {
        if (sameDate(date, addDays(easter, -7))) {
          sundayNumber = 6;
          title = 'Domingo de Ramos da Paixão do Senhor';
        } else {
          const firstLentSunday = firstSundayOnOrAfter(addDays(ashWed, 1));
          const n = 1 + Math.floor((date - firstLentSunday) / (7 * 24 * 60 * 60 * 1000));
          sundayNumber = n;
          title = toRoman(n) + ' Domingo da Quaresma';
        }
      } else if (season === 'Páscoa') {
        if (sameDate(date, easter)) {
          sundayNumber = 1;
          title = 'Domingo de Páscoa da Ressurreição do Senhor';
        } else {
          const n = 1 + Math.floor((date - easter) / (7 * 24 * 60 * 60 * 1000));
          sundayNumber = n + 1;
          title = toRoman(sundayNumber) + ' Domingo da Páscoa';
        }
      }
    }

    return {
      title,
      season,
      cycle,
      sundayNumber,
      sundayRoman: sundayNumber !== null ? toRoman(sundayNumber) : '—',
      color: null
    };
  }

  function buildDisplayLiturgicalTitle(date, info) {
    if (!info) return '';
    let base = info.title || '';
    if (!date) return base;
    const dow = date.getDay();
    if (dow === 0 && info.cycle) {
      if (base && base.indexOf('Ano ') === -1) {
        base += ' — Ano ' + info.cycle;
      }
    }
    return base;
  }

  function updateLiturgicalTheme(season) {
    let primary = '#004b80';
    let soft = '#d6e4ff';
    if (season === 'Advento' || season === 'Quaresma') {
      primary = '#4b2c6f'; soft = '#ede9fe';
    } else if (season === 'Natal' || season === 'Páscoa') {
      primary = '#92400e'; soft = '#fef3c7';
    } else if (season === 'Tempo Comum') {
      primary = '#166534'; soft = '#dcfce7';
    }
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-soft', soft);
  }

  function applyLiturgicalClass(season) {
    document.body.classList.remove(
      'liturgic-advento','liturgic-quaresma','liturgic-natal','liturgic-pascoa','liturgic-tempocomum',
      'lit-green','lit-purple','lit-red','lit-white','lit-gold'
    );
    if (season === 'Advento') {
      document.body.classList.add('liturgic-advento','lit-purple');
    } else if (season === 'Quaresma') {
      document.body.classList.add('liturgic-quaresma','lit-purple');
    } else if (season === 'Natal') {
      document.body.classList.add('liturgic-natal','lit-gold');
    } else if (season === 'Páscoa') {
      document.body.classList.add('liturgic-pascoa','lit-white');
    } else if (season === 'Tempo Comum') {
      document.body.classList.add('liturgic-tempocomum','lit-green');
    }
  }

  function applyHeaderIcon(season) {
    const titleEl = document.getElementById('headerTitle');
    const pillText = document.getElementById('liturgicalInfoText');
    const pillIcon = document.getElementById('liturgicalIcon');
    let icon = '🎵';
    switch (season) {
      case 'Advento': icon = '🕯'; break;
      case 'Natal': icon = '⭐'; break;
      case 'Quaresma': icon = '✝'; break;
      case 'Páscoa': icon = '🔥'; break;
      case 'Tempo Comum': icon = '🌿'; break;
    }
    pillIcon.innerHTML = icon;
    pillText.innerHTML = season ? ('Tempo: ' + season) : 'Tempo litúrgico não definido';
    titleEl.innerHTML = icon + ' Coro Paroquial São João Batista de Rio Caldo';
  }

  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  function getAutoTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hour = new Date().getHours();
    const isNight = (hour >= 20 || hour < 7);
    return (prefersDark || isNight) ? 'dark' : 'light';
  }
  function applyThemeFromStorage() {
    const stored = localStorage.getItem('coroTheme');
    const effective = stored || getAutoTheme();
    if (effective === 'dark') {
      document.documentElement.classList.add('dark');
      themeToggleBtn.innerHTML = '☀ Modo claro';
    } else {
      document.documentElement.classList.remove('dark');
      themeToggleBtn.innerHTML = '🌙 Modo escuro';
    }
  }
  themeToggleBtn.addEventListener('click', () => {
    const isDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('coroTheme', isDark ? 'dark' : 'light');
    applyThemeFromStorage();
  });
  applyThemeFromStorage();

  // ---- Catálogo (Google Sheets + CSV manual) ----
  const csvFileInput = document.getElementById('csvFile');
  const loadCsvBtn = document.getElementById('loadCsvBtn');
  const csvError = document.getElementById('csvError');
  const songsTableContainer = document.getElementById('songsTableContainer');
  const filterAuthor = document.getElementById('filterAuthor');
  const filterTheme = document.getElementById('filterTheme');
  const songSearch = document.getElementById('songSearch');

  const GOOGLE_SHEETS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTv7BD5eoTpio0s2Vjb6YCuZNmjCyG_leoWxl6v-IkIMV-LiJZNmCwhqA9j68IESZQJiU-H3ri3_flR/pub?gid=1808635095&single=true&output=csv";

  function parseCsvResults(data) {
    songs = data || [];
    window.songs = songs;
    refreshFilters();
    renderSongsTable();
  }

  function loadCsvFromGoogleSheets(done) {
    Papa.parse(GOOGLE_SHEETS_CSV, {
      download: true,
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (results && results.data && results.data.length) {
          try { if (typeof done === 'function') done(); } catch(e) { console.error(e); }
          parseCsvResults(results.data);
          showToast('Catálogo carregado automaticamente do Google Sheets.', 'success');
        } else {
          songsTableContainer.innerHTML = 'Não foi possível carregar automaticamente o catálogo. Usa o CSV manual ou tenta mais tarde.';
          showToast('Erro ao carregar catálogo do Google Sheets.', 'error');
        }
      },
      error: (err) => {
        try { if (typeof done === 'function') done(); } catch(e) { console.error(e); }
        console.error(err);
        songsTableContainer.innerHTML = 'Não foi possível carregar automaticamente o catálogo. Usa o CSV manual ou tenta mais tarde.';
        showToast('Erro ao carregar catálogo do Google Sheets.', 'error');
      }
    });
  }

  function renderSongsTable() {
    if (!songs.length) {
      songsTableContainer.classList.add('muted');
      songsTableContainer.innerHTML = 'Sem dados de catálogo para mostrar.';
      return;
    }
    const authorVal = filterAuthor.value;
    const themeVal = filterTheme.value;
    const searchVal = (songSearch.value || '').toLowerCase();
    const filtered = songs.filter(song => {
      const autor = song.Autor || song.autor || '';
      const tema = song.Tema || song.tema || '';
      const titulo = song.Título || song.Titulo || song.titulo || '';
      if (authorVal && autor !== authorVal) return false;
      if (themeVal && tema !== themeVal) return false;
      if (searchVal && !titulo.toLowerCase().includes(searchVal)) return false;
      return true;
    });

    // Carregar histórico de uso
    loadSongUsageHistory();

    let html = '<table><thead><tr>' +
      '<th>Título</th><th>Tema</th><th>Autor</th><th>Partitura</th><th>Vídeo</th><th>Utilizações</th>' +
      '</tr></thead><tbody>';
    filtered.forEach((song, idx) => {
      const titulo = song.Título || song.Titulo || song.titulo || '';
      const tema = song.Tema || song.tema || '';
      const autor = song.Autor || song.autor || '';
      const partitura = song.partitura || song.Partitura || '';
      const video = song.video || song.Vídeo || song.Video || '';
      
      // Contar quantas vezes foi usado
      const usageCount = songUsageHistory.filter(u => u.title === titulo).length;
      
      // Pegar últimas 3 datas
      const usages = songUsageHistory
        .filter(u => u.title === titulo)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 3);
      
      let usageHtml = '';
      if (usageCount === 0) {
        usageHtml = '<span class="muted">Nunca usado</span>';
      } else {
        const lastDate = usages[0] ? new Date(usages[0].date).toLocaleDateString('pt-PT', {day: '2-digit', month: '2-digit'}) : '';
        usageHtml = '<button type="button" class="btn secondary small" data-show-usage="' + idx + '" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">' +
          '📊 ' + usageCount + 'x (últ: ' + lastDate + ')' +
          '</button>';
      }
      
      html += '<tr>' +
        '<td>' + titulo + '</td>' +
        '<td>' + tema + '</td>' +
        '<td>' + autor + '</td>' +
        '<td>' + (partitura ? '<a href="' + partitura + '" target="_blank">Partitura</a>' : '<span class="muted">—</span>') + '</td>' +
        '<td>' + (video ? '<a href="' + video + '" target="_blank">Vídeo</a>' : '<span class="muted">—</span>') + '</td>' +
        '<td>' + usageHtml + '</td>' +
      '</tr>';
    });
    html += '</tbody></table>';
    songsTableContainer.classList.remove('muted');
    songsTableContainer.innerHTML = html;

    // Event listeners para os botões de histórico
    songsTableContainer.querySelectorAll('[data-show-usage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-show-usage'), 10);
        const song = filtered[idx];
        if (song) {
          showSongUsageModal(song);
        }
      });
    });

    populateSongDropdowns();
  }

  // Mostrar modal de histórico de uso de cântico
  function showSongUsageModal(song) {
    const titulo = song.Título || song.Titulo || song.titulo || '';
    const modal = document.getElementById('songUsageModal');
    const modalTitle = document.getElementById('songUsageModalTitle');
    const modalContent = document.getElementById('songUsageModalContent');
    
    if (!modal || !modalTitle || !modalContent) return;
    
    // Guardar título no modal para usar no botão de apagar
    modal.dataset.currentSongTitle = titulo;
    
    // Carregar histórico
    loadSongUsageHistory();
    
    // Filtrar usos deste cântico
    const usages = songUsageHistory
      .filter(u => u.title === titulo)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    modalTitle.textContent = 'Histórico: ' + titulo;
    
    if (usages.length === 0) {
      modalContent.innerHTML = '<p class="muted">Este cântico ainda não foi usado em nenhum programa.</p>';
    } else {
      let html = '<p class="small" style="margin-bottom: 0.5rem;">Este cântico foi usado <strong>' + usages.length + ' vez(es)</strong>:</p>';
      html += '<table style="width: 100%;"><thead><tr>' +
        '<th>Data</th><th>Secção</th><th>Programa</th>' +
        '</tr></thead><tbody>';
      
      usages.forEach(usage => {
        const date = usage.date ? new Date(usage.date).toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '—';
        const section = usage.section || '—';
        
        // Tentar encontrar o programa correspondente
        let programTitle = '—';
        const program = history.find(h => h.date === usage.date);
        if (program) {
          programTitle = program.title || '—';
        }
        
        html += '<tr>' +
          '<td>' + date + '</td>' +
          '<td>' + section + '</td>' +
          '<td style="font-size: 0.85rem;">' + programTitle + '</td>' +
        '</tr>';
      });
      
      html += '</tbody></table>';
      
      // Adicionar botão de apagar histórico deste cântico
      html += '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">' +
        '<button type="button" class="btn btn-delete small" id="deleteSongHistoryBtn">' +
        '🗑️ Apagar histórico deste cântico' +
        '</button>' +
        '<p class="small muted" style="margin-top: 0.5rem;">Remove todas as ' + usages.length + ' utilizações deste cântico do histórico.</p>' +
        '</div>';
      
      modalContent.innerHTML = html;
      
      // Event listener para o botão de apagar
      const deleteBtn = document.getElementById('deleteSongHistoryBtn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
          deleteSongHistory(titulo);
        });
      }
    }
    
    modal.style.display = 'flex';
  }

  // Função para apagar histórico de um cântico específico
  function deleteSongHistory(songTitle) {
    if (!songTitle) return;
    
    // Carregar histórico
    loadSongUsageHistory();
    
    // Contar quantas vezes será apagado
    const count = songUsageHistory.filter(u => u.title === songTitle).length;
    
    if (count === 0) {
      showToast('Não há histórico para apagar.', 'info');
      return;
    }
    
    // Confirmar
    if (!confirm(`⚠️ Tens a certeza que queres apagar o histórico deste cântico?\n\nSerão removidas ${count} utilização(ões) de "${songTitle}".\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    // Filtrar para remover este cântico
    songUsageHistory = songUsageHistory.filter(u => u.title !== songTitle);
    
    // Guardar
    try {
      localStorage.setItem('coroSongUsage_v1', JSON.stringify(songUsageHistory));
    } catch (e) {
      console.error('Erro ao guardar histórico:', e);
      showToast('Erro ao guardar alterações.', 'error');
      return;
    }
    
    // Fechar modal
    const modal = document.getElementById('songUsageModal');
    if (modal) modal.style.display = 'none';
    
    // Re-renderizar catálogo para atualizar a coluna de utilizações
    renderSongsTable();
    
    showToast(`Histórico de "${songTitle}" apagado com sucesso (${count} utilização(ões)).`, 'success');
  }

  // Event listener para fechar modal
  const songUsageModalClose = document.getElementById('songUsageModalClose');
  if (songUsageModalClose) {
    songUsageModalClose.addEventListener('click', () => {
      const modal = document.getElementById('songUsageModal');
      if (modal) modal.style.display = 'none';
    });
  }

  function refreshFilters() {
    const authors = new Set();
    const temas = new Set();
    songs.forEach(s => {
      const autor = s.Autor || s.autor;
      const tema = s.Tema || s.tema;
      if (autor) authors.add(autor);
      if (tema) temas.add(tema);
    });
    filterAuthor.innerHTML = '<option value="">Todos</option>' + Array.from(authors).sort().map(a => '<option>' + a + '</option>').join('');
    filterTheme.innerHTML = '<option value="">Todos</option>' + Array.from(temas).sort().map(t => '<option>' + t + '</option>').join('');
  }

  loadCsvBtn.addEventListener('click', () => {
    csvError.style.display = 'none';
    if (!csvFileInput.files || !csvFileInput.files.length) {
      csvError.innerHTML = 'Escolhe um ficheiro CSV.';
      csvError.style.display = 'block';
      return;
    }
    const file = csvFileInput.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        try {
          parseCsvResults(results.data);
          showToast('CSV carregado com sucesso.', 'success');
        } catch (err) {
          csvError.innerHTML = 'Erro ao processar o CSV.';
          csvError.style.display = 'block';
        }
      },
      error: () => {
        csvError.innerHTML = 'Erro ao ler o ficheiro CSV.';
        csvError.style.display = 'block';
      }
    });
  });

  filterAuthor.addEventListener('change', renderSongsTable);
  filterTheme.addEventListener('change', renderSongsTable);
  songSearch.addEventListener('input', renderSongsTable);

  function populateSongDropdowns() {
    const titles = Array.from(new Set(songs.map(s => s.Título || s.Titulo || s.titulo).filter(Boolean))).sort();
    PROGRAM_PARTS.forEach(part => {
      const select = document.getElementById(part.id);
      if (!select) return;
      const currentValue = select.value;
      select.innerHTML = '<option value="">— escolher —</option>' +
        titles.map(t => '<option value="' + t + '">' + t + '</option>').join('');
      if (currentValue) select.value = currentValue;
}););
  }

  // ---- Histórico ----
  
// ---- Histórico de cânticos (por utilização) ----
// FUNÇÃO DESATIVADA - O histórico de cânticos agora é mostrado no catálogo (coluna "Utilizações")
function renderSongUsageHistory() {
  // Função desativada - o histórico agora aparece no catálogo
  return;
}

function exportSongUsageCsv() {
  loadSongUsageHistory();
  if (!songUsageHistory.length) return;
  let csv = 'data,secao,cantico,contador\n';
  songUsageHistory.forEach(function(e) {
    csv += [
      e.date || '',
      e.section || '',
      e.title || '',
      e.count || 1
    ].map(function(v) {
      const s = String(v).replace(/"/g, '""');
      return '"' + s + '"';
    }).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico_canticos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearSongUsageHistory() {
  loadSongUsageHistory();
  
  if (!songUsageHistory || songUsageHistory.length === 0) {
    showToast('Não há histórico de cânticos para limpar.', 'info');
    return;
  }
  
  const count = songUsageHistory.length;
  
  if (!confirm(`⚠️ Tens a certeza que queres apagar o histórico de ${count} cântico(s)?\n\nEsta ação não pode ser desfeita.`)) {
    return;
  }
  
  songUsageHistory = [];
  
  try {
    localStorage.removeItem('coroSongUsage_v1');
  } catch(e) {
    console.error('Erro ao limpar localStorage:', e);
  }
  
  renderSongUsageHistory();
  showToast(`Histórico de ${count} cântico(s) eliminado com sucesso.`, 'success');
}

function exportFullStateJson() {
    const dateInput = document.getElementById('date');
    const state = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      programDate: dateInput && dateInput.value || null,
      program: {},
      songUsage: []
    };
    // Programa atual
    (window.PROGRAM_PARTS || []).forEach(function(p) {
      const sel = document.getElementById(p.id);
      state.program[p.id] = sel && sel.value || null;
    });
    // Histórico de cânticos
    loadSongUsageHistory();
    state.songUsage = songUsageHistory.slice();

    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estado_coro.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

function importFullStateJson() {
  const textarea = document.getElementById('fullStateImportArea');
  if (!textarea || !textarea.value.trim()) {
    if (typeof showToast === 'function') showToast('Cola primeiro o JSON exportado.', 'error');
    return;
  }
  let parsed = null;
  try {
    parsed = JSON.parse(textarea.value);
  } catch (e) {
    if (typeof showToast === 'function') showToast('JSON inválido.', 'error');
    return;
  }
  if (!parsed || typeof parsed !== 'object') {
    if (typeof showToast === 'function') showToast('JSON inválido.', 'error');
    return;
  }

  if (!confirm('Isto vai substituir o programa atual e o histórico de cânticos neste dispositivo. Continuar?')) return;

  // Restaurar programa
  if (parsed.program) {
    (window.PROGRAM_PARTS || []).forEach(function(p) {
      const sel = document.getElementById(p.id);
      if (!sel) return;
      const val = parsed.program[p.id];
      if (val) {
        let opt = Array.from(sel.options).find(function(o) { return o.value === val; });
        if (!opt) {
          opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          sel.appendChild(opt);
        }
        sel.value = val;
      } else {
        sel.value = '';
      }
    });
    if (typeof updatePreview === 'function') updatePreview();
  }

  // Restaurar histórico de cânticos
  if (parsed.songUsage && Array.isArray(parsed.songUsage)) {
    songUsageHistory = parsed.songUsage.slice();
    try {
      localStorage.setItem('coroSongUsage_v1', JSON.stringify(songUsageHistory));
    } catch (e) {}
    renderSongUsageHistory();
  }

  if (typeof showToast === 'function') showToast('Estado importado com sucesso.', 'success');
}

function loadHistory() {
  try {
    const raw = localStorage.getItem('coroLiturgicoHistory_v2');
    history = raw ? JSON.parse(raw) : [];
  } catch (e) {
    history = [];
  }
}

function saveHistory() {
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!history.length) {
    container.classList.add('muted');
    container.innerHTML = 'Ainda não há domingos guardados.';
    refreshRehearsalPrograms();
    return;
  }
  let html = '<table><thead><tr><th>Data</th><th>Título</th><th>Tempo / Ciclo</th><th>Ações</th></tr></thead><tbody>';
  history.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach((rec, idx) => {
    html += '<tr>' +
      '<td>' + (rec.date || '—') + '</td>' +
      '<td>' + (rec.title || '—') + '</td>' +
      '<td>' + (rec.season || '—') + ' / ' + (rec.cycle || '—') + '</td>' +
      '<td>' +
        '<button type="button" class="btn secondary small" data-hist-idx="' + idx + '" style="margin-right:0.5rem;">📂 Carregar</button>' +
        '<button type="button" class="btn btn-delete small" data-delete-idx="' + idx + '" title="Eliminar este programa">🗑️ Eliminar</button>' +
      '</td>' +
    '</tr>';
  });
  html += '</tbody></table>';
  container.classList.remove('muted');
  container.innerHTML = html;

  // Botões de carregar
  container.querySelectorAll('button[data-hist-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-hist-idx'), 10);
      loadProgramFromHistory(idx);
    });
  });

  // Botões de eliminar
  container.querySelectorAll('button[data-delete-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-delete-idx'), 10);
      deleteProgramFromHistory(idx);
    });
  });

  refreshRehearsalPrograms();
}

function getProgramFromForm() {
    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
      showToast('Escolhe uma data.', 'error');
      return null;
    }
    const [y, m, d] = dateInput.value.split('-').map(v => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    const info = getLiturgicalInfo(dt);
    const litTitleInput = document.getElementById('liturgicalTitle');
    const extraThemeInput = document.getElementById('extraTheme');

    const record = {
      date: dateInput.value,
      title: (litTitleInput.value || buildDisplayLiturgicalTitle(dt, info)),
      extraTheme: extraThemeInput.value || '',
      season: info.season || '',
      cycle: info.cycle || '',
      parts: {}
    };
    PROGRAM_PARTS.forEach(part => {
      const select = document.getElementById(part.id);
      if (!select || !select.value) return;
      record.parts[part.id] = {
        title: select.value,
        label: part.label
      };
    });
    return record;
  }

  function applyProgramToForm(rec) {
    const dateInput = document.getElementById('date');
    const litTitleInput = document.getElementById('liturgicalTitle');
    const extraThemeInput = document.getElementById('extraTheme');
    const cycleDisplay = document.getElementById('cycleDisplay');

    dateInput.value = rec.date || '';
    litTitleInput.value = rec.title || '';
    extraThemeInput.value = rec.extraTheme || '';
    cycleDisplay.value = (rec.season || '—') + ' / Ano ' + (rec.cycle || '—');

    PROGRAM_PARTS.forEach(part => {
      const select = document.getElementById(part.id);
      if (!select) return;
      const p = rec.parts && rec.parts[part.id];
      select.value = p && p.title ? p.title : '';
    });

    if (rec.date) {
      const [y, m, d] = rec.date.split('-').map(v => parseInt(v, 10));
      const dt = new Date(y, m - 1, d);
      const info = getLiturgicalInfo(dt);
      updateLiturgicalTheme(info.season);
      applyLiturgicalClass(info.season);
      applyHeaderIcon(info.season);
      updatePreview();
    }
  }

  function loadProgramFromHistory(idx) {
    const rec = history[idx];
    if (!rec) return;
    applyProgramToForm(rec);
    showToast('Programa carregado do histórico.', 'success');
  }

  function deleteProgramFromHistory(idx) {
    const rec = history[idx];
    if (!rec) return;
    
    const dateFormatted = rec.date || 'este programa';
    const title = rec.title || '';
    
    if (!confirm(`Tem a certeza que deseja eliminar o programa de ${dateFormatted}?\n\n"${title}"\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    // Remover do array
    history.splice(idx, 1);
    
    // Guardar
    saveHistory();
    
    // Re-renderizar
    renderHistory();
    
    // Atualizar calendário (remover o ✓)
    if (window.updateCalendarAfterSave) {
      window.updateCalendarAfterSave();
    }
    
    showToast('Programa eliminado com sucesso.', 'success');
  }

  function clearAllHistory() {
    if (!history.length) {
      showToast('Não há programas para eliminar.', 'info');
      return;
    }
    
    const count = history.length;
    
    if (!confirm(`⚠️ ATENÇÃO: Vai eliminar TODOS os ${count} programas do histórico!\n\nEsta ação NÃO PODE ser desfeita.\n\nTem a certeza absoluta?`)) {
      return;
    }
    
    // Dupla confirmação para segurança
    if (!confirm(`Última confirmação:\n\nEliminar ${count} programas permanentemente?\n\nClique OK para confirmar ou Cancelar para voltar.`)) {
      return;
    }
    
    // Limpar array
    history.length = 0;
    
    // Guardar
    saveHistory();
    
    // Re-renderizar
    renderHistory();
    
    // Atualizar calendário (remover todos os ✓)
    if (window.updateCalendarAfterSave) {
      window.updateCalendarAfterSave();
    }
    
    showToast(`${count} programas eliminados com sucesso.`, 'success');
  }

  // Event listener para o botão de limpar tudo
  const clearAllBtn = document.getElementById('clearAllHistoryBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllHistory);
  }

  // Renderizar histórico de cânticos quando a tab é aberta
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && target.dataset && target.dataset.tab === 'tab-historico') {
      setTimeout(function() {
        if (typeof renderSongUsageHistory === 'function') {
          renderSongUsageHistory();
        }
      }, 100);


  // Inicializar histórico de cânticos se já estiver na tab
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      const historicoTab = document.getElementById('tab-historico');
      if (historicoTab && historicoTab.classList.contains('active')) {
        renderSongUsageHistory();
      }
    });
  } else {
    const historicoTab = document.getElementById('tab-historico');
    if (historicoTab && historicoTab.classList.contains('active')) {
      renderSongUsageHistory();
    }
  }

  const programForm = document.getElementById('programForm');
  programForm.addEventListener('submit', e => {
    e.preventDefault();
    const rec = getProgramFromForm();
    if (!rec) return;
    
    // Adicionar ao histórico
    history.push(rec);
    saveHistory();
    
    // Registar cânticos no histórico de uso
    if (rec.parts && window.recordSongUsage) {
      Object.keys(rec.parts).forEach(function(partId) {
        const part = rec.parts[partId];
        if (part && part.title) {
          window.recordSongUsage(part.title, part.label, rec.date);
        }
      });
    }
    
    renderHistory();
    updatePreview();
    showToast('Domingo guardado no histórico.', 'success');
    
    // Atualizar histórico de cânticos
    if (typeof renderSongUsageHistory === 'function') {
      renderSongUsageHistory();


  
// Função para atualizar dashboard (movida para fora de updatePreview para corrigir scoping)
function updateDashboard() {
  try {
    const dateInput = document.getElementById('date');
    if (!dateInput || !dateInput.value) return;
    const d = new Date(dateInput.value + 'T12:00:00');
    const info = getLiturgicalInfo(d);
    const usage = (typeof loadSongUsageHistory === 'function')
      ? loadSongUsageHistory()
      : (window.songUsageHistory || []);

    const parts = window.PROGRAM_PARTS || [];
    const filled = parts.filter(p => {
      const el = document.getElementById(p.id);
      return el && el.value && el.value.trim() !== '';
    }).length;

    const dashLitTitle = document.getElementById('dashLitTitle');
    const dashLitSeason = document.getElementById('dashLitSeason');
    const dashLitCycle = document.getElementById('dashLitCycle');
    const dashFilledParts = document.getElementById('dashFilledParts');
    const dashTotalParts = document.getElementById('dashTotalParts');
    const dashUsageCount = document.getElementById('dashUsageCount');

    if (dashLitTitle) {
      dashLitTitle.textContent = buildDisplayLiturgicalTitle(info);
    }
    if (dashLitSeason) {
      dashLitSeason.textContent = info.season || '';
    }
    if (dashLitCycle) {
      dashLitCycle.textContent = 'Ano ' + (info.cycle || '—');
    }
    if (dashFilledParts) {
      dashFilledParts.textContent = filled;
    }
    if (dashTotalParts) {
      dashTotalParts.textContent = parts.length;
    }
    if (dashUsageCount) {
      dashUsageCount.textContent = (usage || []).length;
    }
  } catch (e) {
    console.error('updateDashboard error', e);
  }
}

// Função updatePreview
function updatePreview() {
    const preview = document.getElementById('previewContainer');
    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
      preview.innerHTML = '<p class="small muted">Preenche um programa na aba anterior.</p>';
      return;
    }
    const [y, m, d] = dateInput.value.split('-').map(v => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    const info = getLiturgicalInfo(dt);
    const extraThemeInput = document.getElementById('extraTheme');
    const litTitleInput = document.getElementById('liturgicalTitle');

    const displayTitle = (litTitleInput.value || buildDisplayLiturgicalTitle(dt, info) || 'Programa litúrgico');
    const dataFormatada = dt.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const extraRaw = extraThemeInput.value.trim();
    let extraHtml = '';
    if (extraRaw) {
      let label = '';
      let nome = extraRaw;
      if (/(Solenidade)/i.test(extraRaw)) {
        label = 'Solenidade: ';
        nome = extraRaw.replace(/\s*\(Solenidade\)\s*/i, '');
      } else if (/(Festa)/i.test(extraRaw)) {
        label = 'Festa: ';
        nome = extraRaw.replace(/\s*\(Festa\)\s*/i, '');
      } else if (/(Memória)/i.test(extraRaw)) {
        label = 'Memória: ';
        nome = extraRaw.replace(/\s*\(Memória[^)]*\)\s*/i, '');
      } else if (/(Comemoração)/i.test(extraRaw)) {
        label = 'Comemoração: ';
        nome = extraRaw.replace(/\s*\(Comemoração[^)]*\)\s*/i, '');
      }
      extraHtml = '<div class="meta"><strong>' + (label || '') + nome + '</strong></div>';
    }

    // Logo e imagem
    const logoEl = document.getElementById('folhetoLogo');
    const imgDomingoEl = document.getElementById('folhetoImagemDomingo');
    const logoSrc = 'logo.png';
    const domingoSrc = (typeof window !== 'undefined' && window.__sundayImageUrl) || '';

    // Construir blocos de cânticos com letras
    let songsHtml = '';
    PROGRAM_PARTS.forEach(part => {
      const select = document.getElementById(part.id);
      if (!select || !select.value) return;
      const title = select.value;
      const songInfo = songs.find(s => (s.Título || s.Titulo || s.titulo) === title) || {};
      const author = songInfo.Autor || songInfo.autor || '';
      const override = (partLyricsOverrides[part.id] || '').trim();
      const baseLyrics = (songInfo.Letra || songInfo.letra || '').trim();
      const lyrics = override || baseLyrics;
      let lyricsHtml = '';
      const extra = (window.partExtraData && window.partExtraData[part.id]) || null;
      const effectiveTitle = (extra && extra.title) ? extra.title : title;
      const effectiveLyrics = (extra && extra.lyrics) ? extra.lyrics : lyrics;
      const extraChords = extra && extra.chords;
      const extraNotes = extra && extra.notes;

      if (effectiveLyrics) {
        let htmlLyrics = String(effectiveLyrics)
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n');
        htmlLyrics = htmlLyrics.replace(/\[([^\]]+)\]/g, '<span class="chord">[$1]</span>');
        htmlLyrics = htmlLyrics
          .split('\n')
          .map(l => l.replace(/\s+$/g, ''))
          .join('<br>');
        lyricsHtml = '<div class="leaflet-song-lyrics folheto-letra">' + htmlLyrics + '</div>';
      } else {
        lyricsHtml = '<div class="leaflet-song-meta"><em>Letra não disponível.</em></div>';
      }
      songsHtml += '<div class="leaflet-song">';
      songsHtml += '<div class="leaflet-song-title">' + part.label + ' — ' + effectiveTitle + '</div>';
      if (author) {
        songsHtml += '<div class="leaflet-song-meta">Autor: ' + author + '</div>';
      }
      if (extraChords) {
        songsHtml += '<div class="leaflet-song-meta"><strong>Acordes:</strong> ' + extraChords + '</div>';
      }
      if (extraNotes) {
        songsHtml += '<div class="leaflet-song-meta"><strong>Notas:</strong> ' + extraNotes + '</div>';
      }
      songsHtml += lyricsHtml;
      songsHtml += '</div>';

    });

    if (!songsHtml) {
      preview.innerHTML = '<p class="small muted">Seleciona pelo menos um cântico para ver o folheto.</p>';
      return;
    }

    let html = '';
    html += '<div class="leaflet-frame">';
    html += '  <div class="leaflet-a4">';
    html += '    <div class="leaflet-header" id="leafletHeader">';
    html += '      <div class="leaflet-header-left">';
    if (logoSrc) {
      html += '        <img src="' + logoSrc + '" alt="Logotipo">';
    }
    html += '      </div>';
    html += '      <div class="leaflet-header-center">';
    html += '        <h2>' + displayTitle + '</h2>';
    html += '        <div class="meta">' + dataFormatada + '</div>';
    html +=          extraHtml || '';
    html += '      </div>';
    html += '      <div class="leaflet-header-right">';
    if (domingoSrc) {
      html += '        <img src="' + domingoSrc + '" alt="Imagem do domingo">';
    }
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="leaflet-line" id="leafletLine"></div>';
    html += '    <div class="leaflet-note">Folheto para a assembleia. Respeitar sempre os direitos de autor.</div>';
    html += '    <div class="leaflet-cols" id="leafletSongs">';
    html +=          songsHtml;
    html += '    </div>';
    html += '    <div class="leaflet-footer">';
    html += '      <div>Paróquia / Comunidade</div>';
    html += '      <div>Gerado a partir do programa litúrgico</div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';


    const programForWarnings = {
      date: dateInput.value,
      parts: []
    };
    PROGRAM_PARTS.forEach(part => {
      const select = document.getElementById(part.id);
      if (!select || !select.value) return;
      programForWarnings.parts.push({
        id: part.id,
        label: part.label,
        title: select.value
      });
    });

    warnIfProgramHasVeryRecentSongs(programForWarnings);

    preview.innerHTML = html;
  }

  PROGRAM_PARTS.forEach(part => {
    const select = document.getElementById(part.id);
    if (select) select.addEventListener('change', updatePreview);
  });



    

    const win = // window.open popup removido na v0.9.3;
    if (win) {
      win.document.write('<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Folheto da assembleia</title><style>' + leafletCss + '</style></head><body>' + content + '</body></html>');
      win.document.close();
      try { win.focus(); win.print(); } catch (e) {}
    } else {
      showToast('Permite pop-ups para ver o folheto.', 'error');
    }
  })
;




    

    const win = // window.open popup removido na v0.9.3;
    if (win) {
      win.document.write('<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Folheto da assembleia (sem letras)</title><style>' + leafletCss + '</style></head><body>' + content + '</body></html>');
      win.document.close();
      try { win.focus(); win.print(); } catch (e) {}
    } else {
      showToast('Permite pop-ups para ver o folheto.', 'error');

  // Ensaios – WhatsApp
  function refreshRehearsalPrograms() {
    const select = document.getElementById('rehearsalProgram');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">— escolher domingo —</option>';
    history.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach((rec, idx) => {
      const opt = document.createElement('option');
      let label = (rec.date || '') + ' – ' + (rec.title || '');
      if (rec.extraTheme) label += ' [' + rec.extraTheme + ']';
      opt.value = idx;
      opt.innerHTML = label;
      select.appendChild(opt);
    });
    if (currentValue) select.value = currentValue;
});

  document.getElementById('rehearsalWhatsAppBtn').addEventListener('click', () => {
    const dateStr = document.getElementById('rehearsalDate').value;
    const timeStr = document.getElementById('rehearsalTime').value;
    const place = document.getElementById('rehearsalPlace').value.trim();
    const programIdx = document.getElementById('rehearsalProgram').value;
    const notes = document.getElementById('rehearsalNotes').value.trim();

    if (!dateStr || !timeStr) {
      showToast('Preenche a data e a hora do ensaio.', 'error');
      return;
    }
    if (!programIdx) {
      showToast('Escolhe um domingo/programa.', 'error');
      return;
    }
    const rec = history[parseInt(programIdx, 10)];
    if (!rec) {
      showToast('Programa inválido.', 'error');
      return;
    }

    const [y, m, d] = dateStr.split('-').map(v => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    const dataFormatada = dt.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const horaFormatada = timeStr.substring(0,5);

    let text = '';
    text += '🎶 Ensaio do Coro Paroquial São João Batista de Rio Caldo 🎶%0A%0A';
    text += '🗓️ ' + encodeURIComponent(dataFormatada + ' às ' + horaFormatada) + '%0A';
    if (place) text += '📍 Local: ' + encodeURIComponent(place) + '%0A%0A';
    else text += '%0A';
    text += 'Programa: ' + encodeURIComponent(rec.title || '') + '%0A';
    if (rec.extraTheme) text += 'Tema extra: ' + encodeURIComponent(rec.extraTheme) + '%0A';
    text += 'Tempo litúrgico: ' + encodeURIComponent(rec.season || '') + ' | Ciclo: ' + encodeURIComponent(rec.cycle || '') + '%0A%0A';
    if (rec.parts) {
      text += 'Cânticos:%0A';
      Object.keys(rec.parts).forEach(function(partId) {
        var p = rec.parts[partId];
        if (!p || !p.title) return;
        var label = p.label || partId;
        text += '- ' + encodeURIComponent(label + ': ' + p.title) + '%0A';
      });
      text += '%0A';
    }
    if (notes) text += 'Notas: ' + encodeURIComponent(notes) + '%0A%0A';
    
    // Adicionar link das partituras
    text += '━━━━━━━━━━━━━━━━━━━━%0A';
    text += '📁 Partituras disponíveis em:%0A';
    text += 'https://drive.google.com/drive/folders/10VhjmmmvGcUzg8gdIT3Rlu5iDTFqlJy8%0A%0A';
    text += '💡 Abre o link para descarregar as partituras necessárias.%0A%0A';
    text += 'Nos vemos no ensaio! 🎶';

    const waUrl = 'https://wa.me/?text=' + text;
    // window.open popup removido na v0.9.3;
  });

  // Botão Email
  document.getElementById('rehearsalEmailBtn').addEventListener('click', () => {
    const dateStr = document.getElementById('rehearsalDate').value;
    const timeStr = document.getElementById('rehearsalTime').value;
    const place = document.getElementById('rehearsalPlace').value.trim();
    const programIdx = document.getElementById('rehearsalProgram').value;
    const notes = document.getElementById('rehearsalNotes').value.trim();

    if (!dateStr || !timeStr) {
      showToast('Preenche a data e a hora do ensaio.', 'error');
      return;
    }
    if (!programIdx) {
      showToast('Escolhe um domingo/programa.', 'error');
      return;
    }
    const rec = history[parseInt(programIdx, 10)];
    if (!rec) {
      showToast('Programa inválido.', 'error');
      return;
    }

    const [y, m, d] = dateStr.split('-').map(v => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    const dataFormatada = dt.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const horaFormatada = timeStr.substring(0,5);

    // Assunto do email
    const subject = encodeURIComponent('Ensaio Coro - ' + dataFormatada);

    // Corpo do email
    let body = '';
    body += '🎶 Ensaio do Coro Paroquial São João Batista de Rio Caldo 🎶%0D%0A%0D%0A';
    body += '🗓️ Data: ' + encodeURIComponent(dataFormatada) + '%0D%0A';
    body += '🕐 Hora: ' + horaFormatada + '%0D%0A';
    if (place) body += '📍 Local: ' + encodeURIComponent(place) + '%0D%0A';
    body += '%0D%0A';
    body += '📋 PROGRAMA DO DOMINGO:%0D%0A';
    body += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0D%0A';
    body += 'Celebração: ' + encodeURIComponent(rec.title || '') + '%0D%0A';
    if (rec.extraTheme) body += 'Tema: ' + encodeURIComponent(rec.extraTheme) + '%0D%0A';
    body += 'Tempo litúrgico: ' + encodeURIComponent(rec.season || '') + ' | Ciclo: ' + encodeURIComponent(rec.cycle || '') + '%0D%0A%0D%0A';
    
    if (rec.parts) {
      body += '🎵 CÂNTICOS:%0D%0A';
      Object.keys(rec.parts).forEach(function(partId) {
        var p = rec.parts[partId];
        if (!p || !p.title) return;
        var label = p.label || partId;
        body += '  • ' + encodeURIComponent(label + ': ' + p.title) + '%0D%0A';
      });
      body += '%0D%0A';
    }
    
    if (notes) {
      body += '📝 NOTAS:%0D%0A';
      body += encodeURIComponent(notes) + '%0D%0A%0D%0A';
    }
    
    body += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0D%0A';
    body += '📁 As partituras estão disponíveis em:%0D%0A';
    body += 'https://drive.google.com/drive/folders/10VhjmmmvGcUzg8gdIT3Rlu5iDTFqlJy8%0D%0A%0D%0A';
    body += '💡 Abre o link acima para descarregar as partituras necessárias.%0D%0A%0D%0A';
    body += 'Nos vemos no ensaio! 🎶';

    const mailtoUrl = 'mailto:?subject=' + subject + '&body=' + body;
    window.location.href = mailtoUrl;
    
    showToast('Email aberto! As partituras estão linkadas no corpo do email.', 'success');
  });

  const dateInput = document.getElementById('date');
  const litTitleInput = document.getElementById('liturgicalTitle');
  const extraThemeInput = document.getElementById('extraTheme');
  const cycleDisplay = document.getElementById('cycleDisplay');

  
function updateLiturgicalFromDate() {
    if (!dateInput.value) {
      cycleDisplay.value = '';
      applyHeaderIcon('');
      applyLiturgicalClass('');
      return;
    }
    const [y, m, d] = dateInput.value.split('-').map(v => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    const info = getLiturgicalInfo(dt);
    const display = buildDisplayLiturgicalTitle(dt, info);

    // Atualiza sempre o título litúrgico (corrige bug do domingo preso)
    litTitleInput.value = display;

    // Preencher automaticamente o Tema extra com festa / solenidade / memória, se existir e se o campo estiver vazio
    const feast = getFeastForDate(dt);
    if (feast && !extraThemeInput.value.trim()) {
      extraThemeInput.value = feast.name + ' (' + feast.type + ')';
    }

    cycleDisplay.value = (info.season || '—') + ' / Ano ' + (info.cycle || '—');
    updateLiturgicalTheme(info.season);
    applyLiturgicalClass(info.season);
    applyHeaderIcon(info.season);
    updatePreview();
  }


  dateInput.addEventListener('change', updateLiturgicalFromDate);
  extraThemeInput.addEventListener('input', updatePreview);
  litTitleInput.addEventListener('input', updatePreview);

  
// ---- Programa: edição de letra e catálogo rápido de cânticos ----
function openLyricsModalForPart(partId) {
  const select = document.getElementById(partId);
  if (!select) return;
  if (!select.value) {
    showToast('Escolhe primeiro um cântico para essa parte.', 'error');
    return;
  }
  const title = select.value;
  const songInfo = songs.find(s => (s.Título || s.Titulo || s.titulo) === title) || {};
  const baseLyrics = (songInfo.Letra || songInfo.letra || '').trim();
  const override = (partLyricsOverrides[partId] || '').trim();
  const effective = override || baseLyrics;

  currentLyricsPartId = partId;

  // Usa o editor Quill global, reusando o mesmo modal de letras
  if (window.openLyricsEditorForProgram) {
    const part = PROGRAM_PARTS.find(p => p.id === partId);
    const label = part ? part.label : '';
    // define callback para aplicar letra desta parte
    window.applyProgramLyricsFromEditor = function(htmlContent) {
      if (htmlContent && htmlContent.trim()) {
        partLyricsOverrides[partId] = htmlContent;
      } else {
        delete partLyricsOverrides[partId];
      }
      updatePreview();
      showToast('Letra atualizada para esta parte no programa atual.', 'success');
    };
    window.openLyricsEditorForProgram(partId, effective, 'Editar letra — ' + label);
  } else {
    // fallback antigo com textarea (se editor não carregar por algum motivo)
    const modal = document.getElementById('programLyricsModal');
    const titleEl = document.getElementById('programLyricsModalTitle');
    const songEl = document.getElementById('programLyricsModalSong');
    const ta = document.getElementById('programLyricsTextarea');
    const part = PROGRAM_PARTS.find(p => p.id === partId);
    titleEl.innerHTML = 'Editar letra — ' + (part ? part.label : '');
    songEl.innerHTML = title;
    ta.value = effective;
    modal.hidden = false;
  }
}
function closeLyricsModal() {
  const modal = document.getElementById('programLyricsModal');
  if (modal) {
    const backdrop = modal;
    backdrop.classList.add('modal-closing');
    setTimeout(() => {
      backdrop.hidden = true;
      backdrop.classList.remove('modal-closing');
    }, 180);
  }
  currentLyricsPartId = null;
}

function openSongSelectModal(partId) {
  const modal = document.getElementById('songSelectModal');
  if (!modal) return;
  currentSongSelectPartId = partId;

  const part = PROGRAM_PARTS.find(p => p.id === partId);
  const labelEl = document.getElementById('songSelectPartLabel');
  if (labelEl) {
    const icon = part && part.icon ? part.icon + ' ' : '';
    labelEl.innerHTML = part ? ('Parte: ' + icon + part.label) : '';
  }

  // preencher dropdown de temas (únicos)
  const themeSelect = document.getElementById('songSelectTheme');
  if (themeSelect) {
    const prev = themeSelect.value;
    themeSelect.innerHTML = '<option value="">Todos</option>';
    const themes = new Set();
    songs.forEach(s => {
      const tema = (s.Tema || s.tema || '').trim();
      if (tema) {
        tema.split(/[;,]/).forEach(t => {
          const clean = t.trim();
          if (clean) themes.add(clean);
        });
      }
    });
    Array.from(themes).sort((a, b) => a.localeCompare(b, 'pt-PT')).forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.innerHTML = t;
      themeSelect.appendChild(opt);
    });
    if (Array.from(themes).includes(prev)) {
      themeSelect.value = prev;
    }
  }

  const searchInput = document.getElementById('songSelectSearch');
  if (searchInput) searchInput.value = '';

  // construir sugestões inteligentes
  buildSongSuggestionsForPart(partId);

  renderSongSelectList();
  modal.hidden = false;
}

function closeSongSelectModal() {
  const modal = document.getElementById('songSelectModal');
  if (modal) {
    const backdrop = modal;
    backdrop.classList.add('modal-closing');
    setTimeout(() => {
      backdrop.hidden = true;
      backdrop.classList.remove('modal-closing');
    }, 180);
  }
  currentSongSelectPartId = null;
}


  function getLiturgicalContextForProgram() {
    const dateInput = document.getElementById('date');
    if (!dateInput || !dateInput.value || typeof getLiturgicalInfo !== 'function') {
      return null;
    }
    const parts = dateInput.value.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return getLiturgicalInfo(dt);
  }

  function scoreSongForContext(song, partId, context, lastUsage) {
    let score = 0;
    const tema = (song.Tema || song.tema || '').toLowerCase();
    const tempo = (song.Tempo || song.tempo || '').toLowerCase();
    const obs = (song['Observações'] || song.Observacoes || song.observacoes || song['observações'] || '').toLowerCase();

    if (context) {
      const season = (context.season || '').toLowerCase();
      const color = (context.color || '').toLowerCase();

      if (season && tempo.indexOf(season) !== -1) score += 3;
      if (season && tema.indexOf(season) !== -1) score += 2;

      if (color && obs.indexOf(color) !== -1) score += 2;
      if (color && tema.indexOf(color) !== -1) score += 1;
    }

    // Bónus simples por parte
    if (partId && obs.indexOf(partId.toLowerCase()) !== -1) score += 1;

    // Penalização se usado muito recentemente
    if (lastUsage && lastUsage.date) {
      const today = new Date();
      const parts = lastUsage.date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (y && m && d) {
          const dt = new Date(y, m - 1, d);
          const diffDays = Math.round((today - dt) / (1000 * 60 * 60 * 24));
          if (diffDays < 7) score -= 8;         // muito recente
          else if (diffDays < 14) score -= 4;   // recente
          else if (diffDays < 30) score -= 2;   // nas últimas semanas
        }
      }
    }

    return score;
  }

  function buildSongSuggestionsForPart(partId) {
    const suggestionsContainer = document.getElementById('songSelectSuggestions');
    const listEl = document.getElementById('songSelectSuggestionsList');
    if (!suggestionsContainer || !listEl) return;

    if (!songs || !songs.length) {
      suggestionsContainer.style.display = 'none';
      listEl.innerHTML = '';
      return;
    }

    const context = getLiturgicalContextForProgram();
    const scored = [];

    songs.forEach(function(s) {
      const title = (s.Título || s.Titulo || s.titulo || '').trim();
      if (!title) return;
      const last = getLastUsageForTitle(title);
      const score = scoreSongForContext(s, partId, context, last);
      if (score <= 0) return;
      scored.push({ song: s, title: title, last: last, score: score });
    });

    scored.sort(function(a, b) { return b.score - a.score; });

    const top = scored.slice(0, 5);

    if (!top.length) {
      suggestionsContainer.style.display = 'none';
      listEl.innerHTML = '';
      return;
    }

    let html = '';
    top.forEach(function(item) {
      const recency = item.last ? describeRecency(item.last.date) : '';
      const tema = item.song.Tema || item.song.tema || '';
      const tempo = item.song.Tempo || item.song.tempo || '';
      html += '<button type="button" class="btn secondary btn-xs" data-suggest-title="' + String(item.title).replace(/"/g, '&quot;') + '">';
      html += item.title;
      if (tempo) html += ' <span class="small muted">(' + tempo + ')</span>';
      if (recency) html += ' <span class="badge-usage">' + recency + '</span>';
      html += '</button> ';
    });

    listEl.innerHTML = html;
    suggestionsContainer.style.display = 'block';

    // Ligar click dos botões de sugestão
    listEl.querySelectorAll('button[data-suggest-title]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const title = btn.getAttribute('data-suggest-title');
        if (!currentSongSelectPartId || !title) return;
        const select = document.getElementById(currentSongSelectPartId);
        if (select) {
          // criar option se necessário
          let opt = Array.from(select.options).find(function(o) { return o.value === title; });
          if (!opt) {
            opt = document.createElement('option');
            opt.value = title;
            opt.textContent = title;
            select.appendChild(opt);
          }
          select.value = title;
          select.dispatchEvent(new Event('change'));
          if (window.recordSongUsage) {
            const part = (window.PROGRAM_PARTS || []).find(function(p) { return p.id === currentSongSelectPartId; });
            const label = part ? part.label : null;
            const dateInput = document.getElementById('date');
            const dateIso = (dateInput && dateInput.value) || null;
            window.recordSongUsage(title, label, dateIso);
          }
          if (typeof showToast === 'function') {
            const part = (window.PROGRAM_PARTS || []).find(function(p) { return p.id === currentSongSelectPartId; });
            showToast('Cântico sugerido aplicado a ' + (part ? part.label : 'parte') + '.', 'success');
          }
        }
        const modal = document.getElementById('songSelectModal');
        if (modal) modal.hidden = true;
      });
    });
  }
function renderSongSelectList() {
  const listEl = document.getElementById('songSelectList');
  if (!listEl) return;
  if (!songs.length) {
    listEl.innerHTML = '<p class="small muted">Catálogo ainda não carregado.</p>';
    return;
  }

  const search = (document.getElementById('songSelectSearch')?.value || '').toLowerCase();
  const theme = (document.getElementById('songSelectTheme')?.value || '').toLowerCase();

  const filtered = songs.filter(s => {
    const title = (s.Título || s.Titulo || s.titulo || '').toLowerCase();
    const temaRaw = (s.Tema || s.tema || '').toLowerCase();
    const autor = (s.Autor || s.autor || '').toLowerCase();
    const tempo = (s.Tempo || s.tempo || '').toLowerCase();
    const obs = (s['Observações'] || s.Observacoes || s.observacoes || s['observações'] || '').toLowerCase();

    if (theme) {
      const temasArr = temaRaw.split(/[;,]/).map(t => t.trim()).filter(Boolean);
      if (!temasArr.some(t => t.toLowerCase() === theme)) {
        return false;
      }
    }

    if (!search) return true;
    return title.includes(search) || temaRaw.includes(search) || autor.includes(search) || tempo.includes(search) || obs.includes(search);
  });

  if (!filtered.length) {
    listEl.innerHTML = '<p class="small muted">Nenhum cântico encontrado com esses filtros.</p>';
    return;
  }

  const parts = [];
  filtered.forEach(s => {
    const title = s.Título || s.Titulo || s.titulo || '';
    const tema = s.Tema || s.tema || '';
    const autor = s.Autor || s.autor || '';
    const tempo = s.Tempo || s.tempo || '';
    const obs = s['Observações'] || s.Observacoes || s.observacoes || s['observações'] || '';
    const video = s.video || s.Video || s.Vídeo || s['vídeo'] || '';
    const partitura = s.partitura || s.Partitura || '';

    let html = '<div class="song-select-item">';
    html += '<div class="song-select-item-header"><div class="song-select-title">' + title + '</div>';
    if (tema) {
      html += '<div class="song-select-meta">' + tema + '</div>';
    }
    html += '</div>';
    if (autor || tempo || obs) {
      html += '<div class="song-select-meta">';
      const bits = [];
      if (autor) bits.push('Autor: ' + autor);
      if (tempo) bits.push('Tempo: ' + tempo);
      if (obs) bits.push(obs);
      html += bits.join(' • ');
      html += '</div>';
    }
    html += '<div class="song-select-actions">';
    html += '<button type="button" class="btn small program-use-song-btn" data-title="' + String(title).replace(/"/g, '&quot;') + '">Usar</button>';
    html += '<button type="button" class="btn secondary small program-view-lyrics-btn" data-title="' + String(title).replace(/"/g, '&quot;') + '">Letra</button>';
    if (video) {
      html += '<button type="button" class="btn secondary small program-view-video-btn" data-title="' + String(title).replace(/"/g, '&quot;') + '">Vídeo/áudio</button>';
    }
    if (partitura) {
      html += '<button type="button" class="btn secondary small program-view-score-btn" data-title="' + String(title).replace(/"/g, '&quot;') + '">Partitura</button>';
    }
    html += '</div>';
    html += '</div>';
    parts.push(html);
  });

  listEl.innerHTML = parts.join('');
}

function setupProgramButtons() {
  // Botões Selecionar – abrem o catálogo rápido
  document.querySelectorAll('.program-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const partId = btn.getAttribute('data-part-id');
      openSongSelectModal(partId);
    });
  });

  // Botões Editar letra – abrem modal de letra para a parte
  document.querySelectorAll('.program-lyrics-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const partId = btn.getAttribute('data-part-id');
      openLyricsModalForPart(partId);
    });
  });

  // Botões Vídeo/áudio ligados diretamente ao cântico selecionado na parte
  document.querySelectorAll('.program-media-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const partId = btn.getAttribute('data-part-id');
      const select = document.getElementById(partId);
      if (!select || !select.value) {
        showToast('Escolhe primeiro um cântico para essa parte.', 'error');
        return;
      }
      const title = select.value;
      const songInfo = songs.find(s => (s.Título || s.Titulo || s.titulo) === title) || {};
      const videoUrl = songInfo.video || songInfo.Video || songInfo.Vídeo || songInfo['vídeo'] || '';
      if (!videoUrl) {
        showToast('Não há vídeo/áudio associado a este cântico no catálogo.', 'warning');
        return;
      }
      // window.open popup removido na v0.9.3;
    });
  });

  // Eventos do modal de seleção
  const searchInput = document.getElementById('songSelectSearch');
  const themeSelect = document.getElementById('songSelectTheme');
  const closeBtn = document.getElementById('songSelectCloseBtn');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderSongSelectList());
  }
  if (themeSelect) {
    themeSelect.addEventListener('change', () => renderSongSelectList());
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeSongSelectModal());
  }

  // Delegação de eventos na lista de cânticos
  const listEl = document.getElementById('songSelectList');
  if (listEl) {
    listEl.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      const title = target.getAttribute('data-title');
      if (!title) return;
      const songInfo = songs.find(s => (s.Título || s.Titulo || s.titulo) === title) || {};

      if (target.classList.contains('program-use-song-btn')) {
        if (!currentSongSelectPartId) return;
        const select = document.getElementById(currentSongSelectPartId);
        if (select) {
          let foundOpt = null;
          Array.from(select.options).forEach(opt => {
            if (opt.value === title) foundOpt = opt;
          });
          if (!foundOpt) {
            const opt = document.createElement('option');
            opt.value = title;
            opt.innerHTML = title;
            select.appendChild(opt);
          }
          select.value = title;
        }
        closeSongSelectModal();
        updatePreview();
        showToast('Cântico selecionado para "' + (PROGRAM_PARTS.find(p => p.id === currentSongSelectPartId)?.label || '') + '".', 'success');
      } else if (target.classList.contains('program-view-lyrics-btn')) {
        const lyrics = (songInfo.Letra || songInfo.letra || '').trim();
        if (!lyrics) {
          showToast('Não há letra disponível para este cântico no catálogo.', 'warning');
          return;
        }
        // Mostrar letra simples em janela separada
        const w = // window.open popup removido na v0.9.3;
        if (w) {
          w.document.write('<pre style="white-space:pre-wrap;font-family:system-ui, sans-serif;font-size:14px;padding:1rem;">' +
            lyrics.replace(/</g, '&lt;') +
            '</pre>');
          w.document.title = 'Letra — ' + title;
        }
      } else if (target.classList.contains('program-view-video-btn')) {
        const videoUrl = songInfo.video || songInfo.Video || songInfo.Vídeo || songInfo['vídeo'] || '';
        if (!videoUrl) {
          showToast('Não há vídeo/áudio associado a este cântico no catálogo.', 'warning');
          return;
        }
        // window.open popup removido na v0.9.3;
      } else if (target.classList.contains('program-view-score-btn')) {
        const partUrl = songInfo.partitura || songInfo.Partitura || '';
        if (!partUrl) {
          showToast('Não há partitura associada a este cântico no catálogo.', 'warning');
          return;
        }
        // window.open popup removido na v0.9.3;
      }
    });
  }

  // Modal de letra: botões
  const cancelBtn = document.getElementById('programLyricsCancelBtn');
  const saveBtn = document.getElementById('programLyricsSaveBtn');
  const ta = document.getElementById('programLyricsTextarea');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeLyricsModal();
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!currentLyricsPartId) {
        closeLyricsModal();
        return;
      }
      const value = (ta.value || '').trim();
      if (value) {
        partLyricsOverrides[currentLyricsPartId] = value;
      } else {
        delete partLyricsOverrides[currentLyricsPartId];
      }
      closeLyricsModal();
      updatePreview();
      showToast('Letra atualizada para esta parte no programa atual.', 'success');
    });
  }
}

function init() {
    loadHistory();
    renderHistory();
    loadCsvFromGoogleSheets();
    populateSongDropdowns();
    updatePreview();
    refreshRehearsalPrograms();
    setupProgramButtons();


    // Dashboard inicial
    updateDashboard();
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.addEventListener('change', () => {
        updatePreview();
        updateDashboard();
      });
    }

    // Atalhos de dashboard para tabs
    document.querySelectorAll('[data-go-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-go-tab');
        const tabBtn = document.querySelector('.tabs button[data-tab="' + tabId + '"]');
        const tabEl = document.getElementById(tabId);
        if (tabBtn && tabEl) {
          document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tabBtn.classList.add('active');
          tabEl.classList.add('active');
        }
      });
    });

    // Botão de exportar folheto em PDF
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Refresh catálogo manual
    const refreshCatalogBtn = document.getElementById('refreshCatalogBtn');
    const catalogStatus = document.getElementById('catalogStatus');
    if (refreshCatalogBtn) {
      refreshCatalogBtn.addEventListener('click', () => {
        if (catalogStatus) {
          catalogStatus.textContent = 'A atualizar catálogo...';
        }
        loadCsvFromGoogleSheets(() => {
          if (catalogStatus) {
            const now = new Date();
            catalogStatus.textContent = 'Catálogo atualizado às ' + now.toLocaleTimeString();
          }
        });
      });
    }

    // Gestor de ensaios
    if (typeof initRehearsalManager === 'function') {
      initRehearsalManager();
    }
  }

  window.addEventListener('DOMContentLoaded', init);

  // ============================================
  // PESQUISA DE PARTITURAS
  // ============================================
  (function() {
    const searchInput = document.getElementById('partituraSearch');
    
    if (!searchInput) return;
    
    // Debounce para não fazer pesquisas a cada tecla
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      
      const query = searchInput.value.trim();
      
      if (query.length < 2) {
        // Reset iframes para vista normal se pesquisa vazia
        resetDriveFrames();
        return;
      }
      
      // Esperar 500ms após parar de escrever
      searchTimeout = setTimeout(function() {
        searchInDriveFrames(query);
      }, 500);
    });
    
    function searchInDriveFrames(query) {
      // Nota: Por limitações de segurança (CORS), não podemos controlar
      // diretamente o conteúdo dos iframes do Google Drive.
      // O que fazemos é abrir as pastas com a pesquisa em novas abas.
      
      const folder1 = '10VhjmmmvGcUzg8gdIT3Rlu5iDTFqlJy8';
      const folder2 = '10YDH1vUq67KE1Qd3trMukyacLTjwpVis';
      
      // Criar URLs de pesquisa
      const searchUrl1 = `https://drive.google.com/drive/search?q=${encodeURIComponent(query)}%20parent:${folder1}`;
      const searchUrl2 = `https://drive.google.com/drive/search?q=${encodeURIComponent(query)}%20parent:${folder2}`;
      
      // Mostrar mensagem com links
      showSearchResults(query, searchUrl1, searchUrl2);
    }
    
    function showSearchResults(query, url1, url2) {
      // Criar/atualizar div de resultados
      let resultsDiv = document.getElementById('partituraSearchResults');
      
      if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'partituraSearchResults';
        resultsDiv.style.cssText = 'margin: 1rem 0; padding: 1rem; background: var(--bg-soft); border-radius: 0.5rem; border-left: 4px solid var(--accent);';
        searchInput.parentNode.appendChild(resultsDiv);
      }
      
      resultsDiv.innerHTML = `
        <p style="margin: 0 0 0.75rem 0;"><strong>🔍 Resultados para: "${query}"</strong></p>
        <p class="small" style="margin: 0 0 0.5rem 0;">Para melhor experiência, abre a pesquisa diretamente no Google Drive:</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="${url1}" target="_blank" class="btn secondary small">
            🔗 Pesquisar na Pasta Principal
          </a>
          <a href="${url2}" target="_blank" class="btn secondary small">
            🔗 Pesquisar na Pasta Adicional
          </a>
        </div>
        <p class="small muted" style="margin: 0.75rem 0 0 0;">
          💡 Dica: Podes também usar a caixa de pesquisa dentro de cada pasta do Drive abaixo.
        </p>
      `;
    }
    
    function resetDriveFrames() {
      const resultsDiv = document.getElementById('partituraSearchResults');
      if (resultsDiv) {
        resultsDiv.remove();
      }
    }
  })();


// ==== catalog-actions.js ====
document.addEventListener('DOMContentLoaded', () => {
  const songsTableContainer = document.getElementById('songsTableContainer');
  const lyricsModal = document.getElementById('lyricsModal');
  const lyricsModalTitle = document.getElementById('lyricsModalTitle');
  const lyricsModalTextarea = { value: '' };
  const lyricsModalCancel = document.getElementById('lyricsModalCancel');
  const lyricsModalSave = document.getElementById('lyricsModalSave');

  function enhanceCatalogTable() {
    if (!songsTableContainer) return;
    const table = songsTableContainer.querySelector('table');
    if (!table) return;

    const theadRow = table.querySelector('thead tr');
    if (!theadRow) return;

    const lastTh = theadRow.lastElementChild;
    if (lastTh && lastTh.textContent.trim() === 'Ações') return;

    const th = document.createElement('th');
    th.innerHTML = 'Ações';
    theadRow.appendChild(th);

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const titleCell = row.querySelector('td');
      if (titleCell) {
        const titulo = titleCell.textContent.trim();
        const last = getLastUsageForTitle(titulo);
        if (last) {
          const label = describeRecency(last.date);
          if (label) {
            const span = document.createElement('span');
            span.className = 'badge-usage';
            span.textContent = label;
            titleCell.appendChild(span);
          }
        }
      }

      const td = document.createElement('td');
      const btnLetra = document.createElement('button');
      btnLetra.type = 'button';
      btnLetra.className = 'btn secondary btn-xs';
      btnLetra.dataset.action = 'edit-lyrics';
      btnLetra.innerHTML = 'Letra';

      const btnUsar = document.createElement('button');
      btnUsar.type = 'button';
      btnUsar.className = 'btn secondary btn-xs';
      btnUsar.dataset.action = 'use-song';
      btnUsar.style.marginLeft = '0.25rem';
      btnUsar.innerHTML = 'Usar';

      td.appendChild(btnLetra);
      td.appendChild(btnUsar);
      row.appendChild(td);
    });
  }

  if (typeof renderSongsTable === 'function') {
    const originalRenderSongsTable = renderSongsTable;
    renderSongsTable = function(...args) {
      originalRenderSongsTable.apply(this, args);
      try { enhanceCatalogTable(); } catch(e) { console.error(e); }
    };
  } else {
    setTimeout(() => {
      try { enhanceCatalogTable(); } catch(e) { console.error(e); }
    }, 1500);
  }

  
if (songsTableContainer) {
  songsTableContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const tr = btn.closest('tr');
    if (!tr) return;

    const firstCell = tr.querySelector('td');
    if (!firstCell) return;

    const titulo = firstCell.textContent.trim();
    const song =
      (window.songs || []).find(
        (s) => (s.Título || s.Titulo || s.titulo || '') === titulo
      ) || {};

    if (btn.dataset.action === 'edit-lyrics') {
      lyricsModalTitle.innerHTML = titulo;
      lyricsModalTextarea.value = (song.Letra || song.letra || '').trim();
      lyricsModal.dataset.currentTitle = titulo;
      lyricsModal.style.display = 'block';
      return;
    }

    if (btn.dataset.action === 'use-song') {
      if (!window.PROGRAM_PARTS) return;
      const partLabels = window.PROGRAM_PARTS.map((p) => p.label);
      return window.showUseDropdown(btn, partLabels, titulo);

}
if (lyricsModalCancel) {
    lyricsModalCancel.addEventListener('click', () => {
      lyricsModal.style.display = 'none';
    });
  }
  if (lyricsModal) {
    lyricsModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        lyricsModal.style.display = 'none';
      }
    });
  }
  if (lyricsModalSave) {
    lyricsModalSave.addEventListener('click', () => {
      const titulo = lyricsModal.dataset.currentTitle;
      const newLyrics = lyricsModalTextarea.value || '';
      const song = (window.songs || []).find(s => (s.Título || s.Titulo || s.titulo || '') === titulo);
      if (song) {
        song.Letra = newLyrics;
        song.letra = newLyrics;
        if (typeof showToast === 'function') {
          showToast('Letra atualizada para "' + titulo + '".', 'success');
        }
      }
      lyricsModal.style.display = 'none';
    });
  


// ==== editor-quill.js ====
let quill;
document.addEventListener('DOMContentLoaded', () => {
  const lyricsModal = document.getElementById('lyricsModal');
  const lyricsModalTitle = document.getElementById('lyricsModalTitle');
  const saveBtn = document.getElementById('lyricsModalSave');
  const songsTableContainer = document.getElementById('songsTableContainer');

  function initQuill(content = "") {
    if (!quill) {
      quill = new Quill('#lyricsEditor', {
        theme: 'snow',
        modules: {
          toolbar: {
            container: '#lyricsEditorToolbar',
            handlers: {
              chord: function () {
                const range = quill.getSelection();
                if (!range) return;
                let text = quill.getText(range.index, range.length) || '';
                if (!text.trim()) text = 'C';
                quill.deleteText(range.index, range.length);
                quill.insertText(range.index, '[' + text.trim() + ']', 'bold', true);
              }
            }
          }
        }
      });
    }
    quill.root.innerHTML = content || '';
  }

  // Abrir via catálogo (btn Letra)
  if (songsTableContainer) {
    songsTableContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action="edit-lyrics"]');
      if (!btn) return;
      const tr = btn.closest('tr');
      if (!tr) return;
      const firstCell = tr.querySelector('td');
      if (!firstCell) return;
      const titulo = firstCell.textContent.trim();
      const song = (window.songs || []).find(s => (s.Título || s.Titulo || s.titulo || '') === titulo) || {};
      const letra = (song.Letra || song.letra || "").trim();
      lyricsModalTitle.innerHTML = titulo;
      lyricsModal.dataset.mode = 'catalog';
      lyricsModal.dataset.currentTitle = titulo;
      initQuill(letra);
      lyricsModal.style.display = 'block';
    });
  }

  // Guardar (catálogo ou programa)
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const mode = lyricsModal.dataset.mode || 'catalog';
      const htmlContent = quill ? quill.root.innerHTML : '';
      if (mode === 'catalog') {
        const titulo = lyricsModal.dataset.currentTitle;
        const song = (window.songs || []).find(s => (s.Título || s.Titulo || s.titulo || '') === titulo);
        if (song) {
          song.Letra = htmlContent;
          song.letra = htmlContent;
          if (typeof showToast === 'function') {
            showToast('Letra atualizada.', 'success');
          }
        }
      } else if (mode === 'program' && window.applyProgramLyricsFromEditor) {
        // Delega para app-main aplicar a letra à parte correta
        window.applyProgramLyricsFromEditor(htmlContent);
      }
      lyricsModal.style.display = 'none';
    });
  }

  // Expor função global para o programa abrir o editor
  window.openLyricsEditorForProgram = function(partId, currentHtml, titleLabel) {
    if (!lyricsModal) return;
    const title = titleLabel || 'Letra - ' + (partId || '');
    lyricsModalTitle.innerHTML = title;
    lyricsModal.dataset.mode = 'program';
    lyricsModal.dataset.currentPartId = partId || '';
    if (!window.partLyricsOverrides) window.partLyricsOverrides = {};
    initQuill(currentHtml || '');
    lyricsModal.style.display = 'block';
  };
});


// ==== upload-image.js ====
// stub upload-image





// ---- PATCH v11c: Fix modal closing when clicking inside editor ----
document.addEventListener('DOMContentLoaded', () => {
    const lyricsModal = document.getElementById('lyricsModal');
    if (lyricsModal) {
        const modalDialog = lyricsModal.querySelector('.modal-dialog');
        const modalBackdrop = lyricsModal.querySelector('.modal-backdrop');

        if (modalDialog) {
            modalDialog.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => {
                lyricsModal.style.display = 'none';
            });
        }
    




// Modal central para seleção de secção

// Editor de cântico antes de inserir no programa
window.openSongEditModal = function(titulo) {
  const modal = document.getElementById('songEditModal');
  if (!modal) return;

  const titleInput = document.getElementById('songEditTitle');
  const keyInput = document.getElementById('songEditKey');
  const lyricsInput = document.getElementById('songEditLyrics');
  const chordsInput = document.getElementById('songEditChords');
  const notesInput = document.getElementById('songEditNotes');
  const partSelect = document.getElementById('songEditPartSelect');

  if (!partSelect) return;

  // Encontrar cântico no catálogo
  const song = (window.songs || []).find(function(s) {
    return (s.Título || s.Titulo || s.titulo || '') === titulo;
  }) || {};

  if (titleInput) titleInput.value = titulo || '';
  if (keyInput)   keyInput.value = song.Tom || song.tom || '';
  if (lyricsInput) lyricsInput.value = (song.Letra || song.letra || '').trim();
  if (chordsInput) chordsInput.value = song.Acordes || song.acordes || '';
  if (notesInput)  notesInput.value = song.Notas || song.notas || '';

  // Popular lista de secções se ainda não estiver
  while (partSelect.firstChild) {
    partSelect.removeChild(partSelect.firstChild);
  }
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '— escolher secção —';
  partSelect.appendChild(defaultOpt);

  (window.PROGRAM_PARTS || []).forEach(function(p) {
    const opt = document.createElement('option');
    opt.value = p.id;
    const icon = p.icon ? p.icon + ' ' : '';
    opt.textContent = icon + p.label;
    partSelect.appendChild(opt);
  });

  modal.dataset.currentTitle = titulo || '';
  modal.hidden = false;
};

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('songEditModal');
  if (!modal) return;

  const cancelBtn = document.getElementById('songEditCancelBtn');
  const saveBtn = document.getElementById('songEditSaveInsertBtn');

  function closeModal() {
    modal.hidden = true;
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      closeModal();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const titleInput = document.getElementById('songEditTitle');
      const keyInput = document.getElementById('songEditKey');
      const lyricsInput = document.getElementById('songEditLyrics');
      const chordsInput = document.getElementById('songEditChords');
      const notesInput = document.getElementById('songEditNotes');
      const partSelect = document.getElementById('songEditPartSelect');

      const partId = partSelect ? partSelect.value : '';
      if (!partId) {
        if (window.showToast) window.showToast('Escolhe a secção do programa.', 'error');
        return;
      }

      const selectEl = document.getElementById(partId);
      if (!selectEl) {
        if (window.showToast) window.showToast('Não foi possível encontrar o campo dessa secção.', 'error');
        return;
      }

      const editedTitle = titleInput ? titleInput.value || '' : '';
      const editedLyrics = lyricsInput ? lyricsInput.value || '' : '';
      const editedKey = keyInput ? keyInput.value || '' : '';
      const editedChords = chordsInput ? chordsInput.value || '' : '';
      const editedNotes = notesInput ? notesInput.value || '' : '';

      // Aplicar título ao select (se não estiver vazio)
      if (editedTitle) {
        // Se opção ainda não existir, criá-la
        let opt = Array.from(selectEl.options).find(function(o) { return o.value === editedTitle; });
        if (!opt) {
          opt = document.createElement('option');
          opt.value = editedTitle;
          opt.textContent = editedTitle;
          selectEl.appendChild(opt);
        }
        selectEl.value = editedTitle;
      }

      // Guardar dados extra desta parte
      if (!window.partExtraData) window.partExtraData = {};
      window.partExtraData[partId] = {
        title: editedTitle || selectEl.value,
        key: editedKey,
        lyrics: editedLyrics,
        chords: editedChords,
        notes: editedNotes
      };

      if (window.recordSongUsage) {
        const part = (window.PROGRAM_PARTS || []).find(function(p) { return p.id === partId; });
        const label = part ? part.label : null;
        const dateInput = document.getElementById('date');
        const dateIso = (dateInput && dateInput.value) || null;
        window.recordSongUsage(editedTitle || selectEl.value, label, dateIso);
      }

      if (typeof updatePreview === 'function') {
        updatePreview();
      }
      if (window.showToast) window.showToast('Cântico editado e inserido no programa.', 'success');
      closeModal();
    });
  
window.showUseDropdown = function(btn, partLabels, titulo){
  const m = document.createElement('div');
  m.className = 'use-modal';
  m.innerHTML = `<div class="use-modal-box">
    <h3>Escolher secção para: ${titulo}</h3>
    <div class="use-modal-list"></div>
    <button class="use-modal-close">Fechar</button>
  </div>`;
  document.body.appendChild(m);

  const list = m.querySelector('.use-modal-list');
  const dateInput = document.getElementById('date');
  const date = dateInput && dateInput.value ? dateInput.value : null;

  // Botão por cada parte do programa
  partLabels.forEach(function(label, i) {
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = function() {
      const part = window.PROGRAM_PARTS[i];
      const sel = part && document.getElementById(part.id);
      if (sel) {
        sel.value = titulo;
        sel.dispatchEvent(new Event('change'));
      }
      if (window.recordSongUsage) {
        window.recordSongUsage(titulo, label, date);
      }
      m.remove();
    };
    list.appendChild(b);
  });

  // Opção extra: editar antes de inserir
  const editButton = document.createElement('button');
  editButton.textContent = '✏️ Editar antes de inserir';
  editButton.onclick = function() {
    if (window.openSongEditModal) {
      window.openSongEditModal(titulo);
    }
    m.remove();
  };
  list.appendChild(editButton);

  const closeBtn = m.querySelector('.use-modal-close');
  if (closeBtn) {
    closeBtn.onclick = function() { m.remove(); };
  }
  m.onclick = function(e) { if (e.target === m) m.remove(); };
};

// ===== CALENDÁRIO LITÚRGICO =====
(function() {
  // Datas litúrgicas importantes para 2024-2025
  const LITURGICAL_EVENTS = {
    2024: [
      { date: '2024-12-01', title: 'I Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2024-12-08', title: 'Imaculada Conceição', type: 'solenidade', season: 'advento' },
      { date: '2024-12-08', title: 'II Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2024-12-15', title: 'III Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2024-12-22', title: 'IV Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2024-12-24', title: 'Véspera de Natal', type: 'natal', season: 'natal' },
      { date: '2024-12-25', title: 'Natal do Senhor', type: 'solenidade', season: 'natal' },
      { date: '2024-12-29', title: 'Sagrada Família', type: 'festa', season: 'natal' }
    ],
    2025: [
      { date: '2025-01-01', title: 'Santa Maria Mãe de Deus', type: 'solenidade', season: 'natal' },
      { date: '2025-01-06', title: 'Epifania do Senhor', type: 'solenidade', season: 'natal' },
      { date: '2025-01-12', title: 'Batismo do Senhor', type: 'festa', season: 'natal' },
      { date: '2025-02-02', title: 'Apresentação do Senhor', type: 'festa', season: 'tempocomum' },
      { date: '2025-03-05', title: 'Quarta-feira de Cinzas', type: 'quaresma', season: 'quaresma' },
      { date: '2025-03-09', title: 'I Domingo da Quaresma', type: 'quaresma', season: 'quaresma' },
      { date: '2025-03-16', title: 'II Domingo da Quaresma', type: 'quaresma', season: 'quaresma' },
      { date: '2025-03-23', title: 'III Domingo da Quaresma', type: 'quaresma', season: 'quaresma' },
      { date: '2025-03-25', title: 'Anunciação do Senhor', type: 'solenidade', season: 'quaresma' },
      { date: '2025-03-30', title: 'IV Domingo da Quaresma', type: 'quaresma', season: 'quaresma' },
      { date: '2025-04-06', title: 'V Domingo da Quaresma', type: 'quaresma', season: 'quaresma' },
      { date: '2025-04-13', title: 'Domingo de Ramos', type: 'quaresma', season: 'quaresma' },
      { date: '2025-04-17', title: 'Quinta-feira Santa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-04-18', title: 'Sexta-feira Santa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-04-19', title: 'Sábado Santo', type: 'pascoa', season: 'pascoa' },
      { date: '2025-04-20', title: 'Domingo de Páscoa', type: 'solenidade', season: 'pascoa' },
      { date: '2025-04-27', title: 'II Domingo da Páscoa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-05-04', title: 'III Domingo da Páscoa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-05-11', title: 'IV Domingo da Páscoa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-05-18', title: 'V Domingo da Páscoa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-05-25', title: 'VI Domingo da Páscoa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-05-29', title: 'Ascensão do Senhor', type: 'solenidade', season: 'pascoa' },
      { date: '2025-06-01', title: 'VII Domingo da Páscoa', type: 'pascoa', season: 'pascoa' },
      { date: '2025-06-08', title: 'Pentecostes', type: 'solenidade', season: 'pascoa' },
      { date: '2025-06-15', title: 'Santíssima Trindade', type: 'solenidade', season: 'tempocomum' },
      { date: '2025-06-22', title: 'Corpo de Deus', type: 'solenidade', season: 'tempocomum' },
      { date: '2025-06-27', title: 'Sagrado Coração de Jesus', type: 'solenidade', season: 'tempocomum' },
      { date: '2025-08-15', title: 'Assunção de Nossa Senhora', type: 'solenidade', season: 'tempocomum' },
      { date: '2025-09-14', title: 'Exaltação da Santa Cruz', type: 'festa', season: 'tempocomum' },
      { date: '2025-11-01', title: 'Todos os Santos', type: 'solenidade', season: 'tempocomum' },
      { date: '2025-11-02', title: 'Fiéis Defuntos', type: 'festa', season: 'tempocomum' },
      { date: '2025-11-09', title: 'Dedicação da Basílica de Latrão', type: 'festa', season: 'tempocomum' },
      { date: '2025-11-23', title: 'Cristo Rei', type: 'solenidade', season: 'tempocomum' },
      { date: '2025-11-30', title: 'I Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2025-12-07', title: 'II Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2025-12-08', title: 'Imaculada Conceição', type: 'solenidade', season: 'advento' },
      { date: '2025-12-14', title: 'III Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2025-12-21', title: 'IV Domingo do Advento', type: 'advento', season: 'advento' },
      { date: '2025-12-25', title: 'Natal do Senhor', type: 'solenidade', season: 'natal' }
    ],
    2026: [
      { date: '2026-01-01', title: 'Santa Maria Mãe de Deus', type: 'solenidade', season: 'natal' }
    ]
  };

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Obter todos os eventos
  function getAllEvents() {
    const events = [];
    Object.keys(LITURGICAL_EVENTS).forEach(year => {
      events.push(...LITURGICAL_EVENTS[year]);
    });
    return events;
  }

  // Obter eventos de um mês específico
  function getEventsForMonth(year, month) {
    const allEvents = getAllEvents();
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }

  // Obter próximos eventos
  function getUpcomingEvents(limit = 5) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allEvents = getAllEvents();
    return allEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  }

  // Renderizar calendário
  function renderCalendar() {
    const monthYear = document.getElementById('calendarMonthYear');
    const gridContainer = document.getElementById('calendarGrid');
    
    if (!monthYear || !gridContainer) return;

    // Nome do mês
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Remover apenas os dias (manter cabeçalhos)
    const dayElements = gridContainer.querySelectorAll('.calendar-day');
    dayElements.forEach(el => el.remove());

    // Primeiro dia do mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Dias do mês anterior
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dayEl = createDayElement(day, true);
      gridContainer.appendChild(dayEl);
    }

    // Dias do mês atual
    const events = getEventsForMonth(currentYear, currentMonth);
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date === dateStr);
      
      const isToday = date.toDateString() === today.toDateString();
      const dayEl = createDayElement(day, false, isToday, dayEvents);
      gridContainer.appendChild(dayEl);
    }

    // Dias do próximo mês
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      const dayEl = createDayElement(day, true);
      gridContainer.appendChild(dayEl);
    }
  }

  // Criar elemento de dia
  function createDayElement(day, otherMonth, isToday, events) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (otherMonth) {
      dayEl.classList.add('other-month');
    }
    
    if (isToday) {
      dayEl.classList.add('today');
    }
    
    // Verificar se há programa guardado para este dia
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const hasProgram = checkIfHasProgram(dateStr);
    
    if (hasProgram && !otherMonth) {
      dayEl.classList.add('has-program');
      dayEl.title = 'Programa guardado - Clique para ver';
    }
    
    if (events && events.length > 0) {
      const event = events[0];
      dayEl.classList.add('liturgical-event', event.type);
      
      if (hasProgram) {
        dayEl.title = `${event.title}\n✓ Programa guardado - Clique para ver`;
      } else {
        dayEl.title = event.title;
      }
    }
    
    if (!otherMonth) {
      dayEl.onclick = function() {
        if (hasProgram) {
          showProgramForDay(dateStr);
        } else if (events && events.length > 0) {
          showEventDetails(events, dateStr);
        }
      };
    }
    
    const numberSpan = document.createElement('span');
    numberSpan.className = 'calendar-day-number';
    numberSpan.textContent = day;
    dayEl.appendChild(numberSpan);
    
    return dayEl;
  }

  // Verificar se existe programa para uma data
  function checkIfHasProgram(dateStr) {
    try {
      const historyData = localStorage.getItem('coroLiturgicoHistory_v2');
      if (!historyData) return false;
      
      const history = JSON.parse(historyData);
      return history.some(function(prog) {
        return prog.date === dateStr;
      });
    } catch (e) {
      return false;
    }
  }

  // Obter programa de uma data específica
  function getProgramForDay(dateStr) {
    try {
      const historyData = localStorage.getItem('coroLiturgicoHistory_v2');
      if (!historyData) return null;
      
      const history = JSON.parse(historyData);
      return history.find(function(prog) {
        return prog.date === dateStr;
      });
    } catch (e) {
      return null;
    }
  }

  // Mostrar programa do dia
  function showProgramForDay(dateStr) {
    const program = getProgramForDay(dateStr);
    if (!program) {
      showEventDetails([], dateStr);
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'program-day-modal';
    
    const date = new Date(dateStr + 'T00:00:00');
    const dateFormatted = date.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let partsHTML = '';
    const partLabels = window.PROGRAM_PARTS || [];
    
    partLabels.forEach(function(part) {
      const songTitle = program[part.id];
      if (songTitle) {
        partsHTML += `
          <div class="program-part-item">
            <div class="program-part-label">${part.icon || ''} ${part.label}</div>
            <div class="program-part-song">${songTitle}</div>
          </div>
        `;
      }
    });

    if (!partsHTML) {
      partsHTML = '<p class="muted small">Nenhum cântico definido ainda.</p>';
    }

    modal.innerHTML = `
      <div class="program-day-content">
        <div class="program-day-header">
          <div>
            <h3>📅 Programa Litúrgico</h3>
            <div class="program-day-date">${dateFormatted}</div>
          </div>
          <button class="program-day-close" onclick="this.closest('.program-day-modal').remove()">×</button>
        </div>
        
        <div class="program-day-info">
          ${program.liturgicalTitle ? `
            <div class="program-info-row">
              <span class="program-info-label">Celebração:</span>
              <span class="program-info-value">${program.liturgicalTitle}</span>
            </div>
          ` : ''}
          ${program.extraTheme ? `
            <div class="program-info-row">
              <span class="program-info-label">Tema:</span>
              <span class="program-info-value">${program.extraTheme}</span>
            </div>
          ` : ''}
          ${program.cycleDisplay ? `
            <div class="program-info-row">
              <span class="program-info-label">Tempo litúrgico:</span>
              <span class="program-info-value">${program.cycleDisplay}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="program-day-parts">
          <h4>🎵 Cânticos do Programa</h4>
          ${partsHTML}
        </div>
        
        <div class="program-day-actions">
          <button class="btn secondary" onclick="this.closest('.program-day-modal').remove()">
            Fechar
          </button>
          <button class="btn" onclick="editProgramFromCalendar('${dateStr}')">
            ✏️ Editar Programa
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }

  // Função global para editar programa a partir do calendário
  window.editProgramFromCalendar = function(dateStr) {
    // Fechar modal
    const modal = document.querySelector('.program-day-modal');
    if (modal) modal.remove();

    // Carregar programa
    const program = getProgramForDay(dateStr);
    if (!program) return;

    // Mudar para tab de programa
    const programTab = document.querySelector('[data-tab="tab-programa"]');
    if (programTab) {
      programTab.click();
    }

    // Preencher formulário (dar tempo para a tab mudar)
    setTimeout(function() {
      const dateInput = document.getElementById('date');
      if (dateInput) {
        dateInput.value = dateStr;
        dateInput.dispatchEvent(new Event('change'));
      }

      const liturgicalInput = document.getElementById('liturgicalTitle');
      if (liturgicalInput && program.liturgicalTitle) {
        liturgicalInput.value = program.liturgicalTitle;
      }

      const themeInput = document.getElementById('extraTheme');
      if (themeInput && program.extraTheme) {
        themeInput.value = program.extraTheme;
      }

      // Preencher cânticos
      const partLabels = window.PROGRAM_PARTS || [];
      partLabels.forEach(function(part) {
        const select = document.getElementById(part.id);
        if (select && program[part.id]) {
          select.value = program[part.id];
        }
      });

      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Mostrar detalhes do evento (versão melhorada)
  function showEventDetails(events, dateStr) {
    const modal = document.createElement('div');
    modal.className = 'program-day-modal';
    
    const date = new Date(dateStr + 'T00:00:00');
    const dateFormatted = date.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let eventsHTML = '';
    if (events && events.length > 0) {
      eventsHTML = events.map(function(event) {
        return `
          <div class="program-part-item">
            <div class="program-part-label">${event.title}</div>
            <div class="program-part-song">
              <span class="event-type ${event.type}">${event.type}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      eventsHTML = '<p class="muted small">Dia comum do calendário.</p>';
    }

    modal.innerHTML = `
      <div class="program-day-content">
        <div class="program-day-header">
          <div>
            <h3>📅 ${dateFormatted}</h3>
          </div>
          <button class="program-day-close" onclick="this.closest('.program-day-modal').remove()">×</button>
        </div>
        
        ${events && events.length > 0 ? `
          <div class="program-day-parts">
            <h4>🎄 Celebrações Litúrgicas</h4>
            ${eventsHTML}
          </div>
        ` : `
          <div class="no-program-message">
            <span style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem;">📅</span>
            <p>Nenhuma celebração especial neste dia.</p>
          </div>
        `}
        
        <div class="program-day-actions">
          <button class="btn secondary" onclick="this.closest('.program-day-modal').remove()">
            Fechar
          </button>
          <button class="btn" onclick="createProgramForDate('${dateStr}')">
            ➕ Criar Programa
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }

  // Função global para criar programa para uma data específica
  window.createProgramForDate = function(dateStr) {
    // Fechar modal
    const modal = document.querySelector('.program-day-modal');
    if (modal) modal.remove();

    // Mudar para tab de programa
    const programTab = document.querySelector('[data-tab="tab-programa"]');
    if (programTab) {
      programTab.click();
    }

    // Preencher data
    setTimeout(function() {
      const dateInput = document.getElementById('date');
      if (dateInput) {
        dateInput.value = dateStr;
        dateInput.dispatchEvent(new Event('change'));
      }

      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Renderizar próximos eventos
  function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;

    const events = getUpcomingEvents(8);
    
    if (events.length === 0) {
      container.innerHTML = '<p class="muted small">Nenhum evento próximo.</p>';
      return;
    }

    container.innerHTML = events.map(event => {
      const date = new Date(event.date);
      const dateStr = date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
      
      return `
        <div class="event-item">
          <div class="event-date">${dateStr}</div>
          <div class="event-details">
            <div class="event-title">${event.title}</div>
            <span class="event-type ${event.type}">${event.type}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Event listeners
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const todayBtn = document.getElementById('todayBtn');

  if (prevBtn) {
    prevBtn.onclick = function() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = function() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    };
  }

  if (todayBtn) {
    todayBtn.onclick = function() {
      const today = new Date();
      currentMonth = today.getMonth();
      currentYear = today.getFullYear();
      renderCalendar();
    };
  }

  // Inicializar calendário quando estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      renderCalendar();
      renderUpcomingEvents();
    });
  } else {
    renderCalendar();
    renderUpcomingEvents();
  }

  // Atualizar quando mudar de tab
  document.addEventListener('click', function(e) {
    if (e.target.dataset.tab === 'tab-dashboard' || e.target.closest('[data-tab="tab-dashboard"]')) {
      setTimeout(function() {
        renderCalendar();
        renderUpcomingEvents();
      }, 100);


  // Atualizar calendário quando programa é guardado
  window.updateCalendarAfterSave = function() {
    renderCalendar();
    renderUpcomingEvents();
  };

  // Hook no formulário de programa para atualizar calendário
  const programForm = document.getElementById('programForm');
  if (programForm) {
    programForm.addEventListener('submit', function() {
      setTimeout(function() {
        if (window.updateCalendarAfterSave) {
          window.updateCalendarAfterSave();
        }
      }, 500);
    });
  }

  // Também atualizar quando há mudanças no localStorage
  window.addEventListener('storage', function(e) {
    if (e.key === 'coroHistory_v1') {
      renderCalendar();
      renderUpcomingEvents();

})();

// ===== CONTROLES DE IMPRESSÃO E MARGEM (OBSOLETO - REMOVIDO v14.0) =====
// Esta secção foi removida porque a tab de pré-visualização foi eliminada na v14.0
// Os controlos de margem (marginTop, marginBottom, etc.) já não existem na interface

// ===== VÍDEOS DOS CÂNTICOS =====
(function() {
  function renderVideos() {
    const container = document.getElementById('videosContainer');
    const searchInput = document.getElementById('videoSearch');
    const sectionSelect = document.getElementById('videoSection');
    
    if (!container) return;
    
    // Filtrar cânticos que têm vídeo
    let filteredSongs = (window.songs || []).filter(song => {
      const videoUrl = song.Video || song.video || '';
      return videoUrl.trim() !== '';
    });
    
    // Aplicar filtros
    const searchTerm = (searchInput && searchInput.value || '').toLowerCase();
    const selectedSection = sectionSelect && sectionSelect.value || '';
    
    if (searchTerm) {
      filteredSongs = filteredSongs.filter(song => {
        const title = (song.Título || song.Titulo || song.titulo || '').toLowerCase();
        const author = (song.Autor || song.autor || '').toLowerCase();
        return title.includes(searchTerm) || author.includes(searchTerm);
      });
    }
    
    if (selectedSection) {
      filteredSongs = filteredSongs.filter(song => {
        const theme = song.Tema || song.tema || '';
        return theme.includes(selectedSection);
      });
    }
    
    if (!filteredSongs.length) {
      container.innerHTML = '<p class="small muted">Nenhum cântico encontrado com vídeo. Adiciona links de vídeo na coluna "Video" do catálogo.</p>';
      return;
    }
    
    // Renderizar vídeos
    container.innerHTML = filteredSongs.map(song => {
      const title = song.Título || song.Titulo || song.titulo || 'Sem título';
      const author = song.Autor || song.autor || '';
      const videoUrl = song.Video || song.video || '';
      
      // Extrair ID do YouTube
      let youtubeId = '';
      if (videoUrl.includes('youtube.com/watch?v=')) {
        youtubeId = videoUrl.split('watch?v=')[1].split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        youtubeId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('youtube.com/embed/')) {
        youtubeId = videoUrl.split('embed/')[1].split('?')[0];
      }
      
      if (!youtubeId) {
        return `
          <div style="padding: 1rem; background: var(--bg-soft); border-radius: 0.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${title}</h4>
            ${author ? `<p class="small muted" style="margin: 0 0 0.5rem 0;">${author}</p>` : ''}
            <p class="small">⚠️ Link de vídeo inválido</p>
            <a href="${videoUrl}" target="_blank" class="small" style="color: var(--primary);">Abrir link →</a>
          </div>
        `;
      }
      
      return `
        <div style="background: var(--card); border-radius: 0.5rem; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="position: relative; padding-bottom: 56.25%; height: 0;">
            <iframe 
              src="https://www.youtube.com/embed/${youtubeId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
            </iframe>
          </div>
          <div style="padding: 0.75rem;">
            <h4 style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">${title}</h4>
            ${author ? `<p class="small muted" style="margin: 0;">${author}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Event listeners para filtros
  const videoSearch = document.getElementById('videoSearch');
  const videoSection = document.getElementById('videoSection');
  
  if (videoSearch) {
    videoSearch.addEventListener('input', renderVideos);
  }
  
  if (videoSection) {
    videoSection.addEventListener('change', renderVideos);
  }
  
  // Renderizar quando a tab for aberta
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && target.dataset && target.dataset.tab === 'tab-videos') {
      setTimeout(renderVideos, 100);

  
  // Exportar função para ser usada externamente
  window.renderVideos = renderVideos;
})();

// ============================================
// UPLOAD DA IMAGEM DO DOMINGO
// ============================================
// SISTEMA DE FOLHETOS GUARDADOS
// ============================================
(function() {
  let savedLeaflets = [];
  
  // Carregar folhetos do localStorage
  function loadSavedLeaflets() {
    try {
      const raw = localStorage.getItem('coroSavedLeaflets_v1');
      savedLeaflets = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao carregar folhetos:', e);
      savedLeaflets = [];
    }
    return savedLeaflets;
  }
  
  // Guardar folhetos no localStorage
  function saveSavedLeaflets() {
    try {
      localStorage.setItem('coroSavedLeaflets_v1', JSON.stringify(savedLeaflets));
    } catch (e) {
      console.error('Erro ao guardar folhetos:', e);
      showToast('Erro ao guardar folheto. LocalStorage pode estar cheio.', 'error');
    }
  }
  
  // Renderizar lista de folhetos guardados
  function renderSavedLeaflets() {
    loadSavedLeaflets();
    const container = document.getElementById('savedLeafletsContainer');
    const summaryEl = document.getElementById('leafletsSummary');
    
    if (!container) return;
    
    if (!savedLeaflets || savedLeaflets.length === 0) {
      container.classList.add('muted');
      container.innerHTML = 'Ainda não há folhetos guardados.';
      if (summaryEl) summaryEl.textContent = '';
      return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const sorted = savedLeaflets.slice().sort((a, b) => {
      return (b.savedAt || '').localeCompare(a.savedAt || '');
    });
    
    let html = '<table><thead><tr>' +
      '<th>Título</th>' +
      '<th>Data</th>' +
      '<th>Guardado em</th>' +
      '<th>Ações</th>' +
      '</tr></thead><tbody>';
    
    sorted.forEach((leaflet, idx) => {
      const realIndex = savedLeaflets.indexOf(leaflet);
      const savedDate = new Date(leaflet.savedAt);
      const savedDateStr = savedDate.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      html += '<tr>' +
        '<td>' + (leaflet.title || '—') + '</td>' +
        '<td>' + (leaflet.date || '—') + '</td>' +
        '<td>' + savedDateStr + '</td>' +
        '<td>' +
          '<button type="button" class="btn secondary small" data-view-leaflet="' + realIndex + '" style="margin-right:0.3rem;">👁️ Ver</button>' +
          '<button type="button" class="btn secondary small" data-print-leaflet="' + realIndex + '" style="margin-right:0.3rem;">🖨️ Imprimir</button>' +
          '<button type="button" class="btn btn-delete small" data-delete-leaflet="' + realIndex + '">🗑️ Eliminar</button>' +
        '</td>' +
      '</tr>';
    });
    
    html += '</tbody></table>';
    container.classList.remove('muted');
    container.innerHTML = html;
    
    if (summaryEl) {
      summaryEl.textContent = `${savedLeaflets.length} folheto(s) guardado(s)`;
    }
    
    // Event listeners para botões
    container.querySelectorAll('[data-view-leaflet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-view-leaflet'), 10);
        viewLeaflet(idx);
      });
    });
    
    container.querySelectorAll('[data-print-leaflet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-print-leaflet'), 10);
        printLeaflet(idx);
      });
    });
    
    container.querySelectorAll('[data-delete-leaflet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-delete-leaflet'), 10);
        deleteLeaflet(idx);
      });
    });
  }
  
  // Guardar folheto atual
  function saveCurrentLeaflet() {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer || !previewContainer.innerHTML.trim() || 
        previewContainer.innerHTML.includes('Ainda não há dados')) {
      showToast('Não há folheto para guardar. Crie um programa primeiro.', 'error');
      return;
    }
    
    const dateInput = document.getElementById('date');
    const liturgicalTitleInput = document.getElementById('liturgicalTitle');
    
    if (!dateInput || !dateInput.value) {
      showToast('Escolha uma data no programa primeiro.', 'error');
      return;
    }
    
    // Capturar o HTML do folheto
    const leafletHTML = previewContainer.innerHTML;
    
    // Criar objeto do folheto
    const leaflet = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      date: dateInput.value,
      title: liturgicalTitleInput ? liturgicalTitleInput.value : '',
      html: leafletHTML
    };
    
    // Adicionar à lista
    savedLeaflets.push(leaflet);
    
    // Guardar
    saveSavedLeaflets();
    
    // Re-renderizar
    renderSavedLeaflets();
    
    showToast('Folheto guardado com sucesso!', 'success');
  }
  
  // Ver folheto
  function viewLeaflet(idx) {
    if (idx < 0 || idx >= savedLeaflets.length) return;
    
    const leaflet = savedLeaflets[idx];
    const modal = document.getElementById('leafletViewModal');
    const titleEl = document.getElementById('leafletViewTitle');
    const contentEl = document.getElementById('leafletViewContent');
    
    if (!modal || !titleEl || !contentEl) return;
    
    titleEl.textContent = leaflet.title || 'Folheto';
    contentEl.innerHTML = leaflet.html;
    
    modal.style.display = 'flex';
    
    // Guardar índice atual para imprimir
    modal.dataset.currentLeafletIdx = idx;
  }
  
  // Imprimir folheto
  function printLeaflet(idx) {
    if (idx < 0 || idx >= savedLeaflets.length) return;
    
    const leaflet = savedLeaflets[idx];
    
    // Criar janela temporária para imprimir
    const printWindow = // window.open popup removido na v0.9.3;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${leaflet.title || 'Folheto'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 1cm 1cm 1cm 2cm;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .leaflet-cols {
            column-count: 2;
            column-gap: 1.4rem;
            font-size: 0.85rem;
          }
          .leaflet-song {
            break-inside: avoid;
            break-inside: avoid-column;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
            display: inline-block;
            width: 100%;
            margin-bottom: 0.5rem;
          }
          .leaflet-song-title {
            font-weight: 600;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .leaflet-song-meta {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0.15rem;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .leaflet-song-lyrics {
            margin: 0;
            white-space: pre-wrap;
            font-family: inherit;
            font-size: 0.8rem;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .leaflet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.6rem;
            padding: 0.4rem 0.6rem;
            border-radius: 0.6rem;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            gap: 1rem;
          }
          .leaflet-header-left img,
          .leaflet-header-right img {
            max-height: 80px;
            max-width: 150px;
            object-fit: contain;
            flex-shrink: 0;
          }
          .leaflet-header-center {
            flex: 1;
            text-align: center;
            min-width: 0;
          }
          .leaflet-header-center h2 {
            margin: 0;
            font-size: 1.35rem;
            word-wrap: break-word;
            hyphens: auto;
          }
          .leaflet-header-center .meta {
            font-size: 0.8rem;
            color: #4b5563;
          }
          .leaflet-line {
            height: 3px;
            width: 65%;
            margin: 0.35rem auto 0.15rem auto;
            border-radius: 999px;
            background: #e5e7eb;
          }
          .leaflet-note {
            font-size: 0.75rem;
            color: #6b7280;
            text-align: center;
            margin-bottom: 0.4rem;
          }
          .leaflet-footer {
            position: absolute;
            bottom: 0.5cm;
            left: 1.6cm;
            right: 1cm;
            font-size: 0.7rem;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        ${leaflet.html}
      </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
  
  // Eliminar folheto
  function deleteLeaflet(idx) {
    if (idx < 0 || idx >= savedLeaflets.length) return;
    
    const leaflet = savedLeaflets[idx];
    
    if (!confirm(`Tens a certeza que queres eliminar o folheto "${leaflet.title || 'Sem título'}"?`)) {
      return;
    }
    
    savedLeaflets.splice(idx, 1);
    saveSavedLeaflets();
    renderSavedLeaflets();
    
    showToast('Folheto eliminado com sucesso.', 'success');
  }
  
  // Limpar todos os folhetos
  function clearAllLeaflets() {
    loadSavedLeaflets();
    
    if (!savedLeaflets || savedLeaflets.length === 0) {
      showToast('Não há folhetos para eliminar.', 'info');
      return;
    }
    
    const count = savedLeaflets.length;
    
    if (!confirm(`⚠️ ATENÇÃO: Vai eliminar TODOS os ${count} folhetos guardados!\n\nEsta ação NÃO PODE ser desfeita.\n\nTem a certeza absoluta?`)) {
      return;
    }
    
    savedLeaflets = [];
    saveSavedLeaflets();
    renderSavedLeaflets();
    
    showToast(`${count} folheto(s) eliminado(s) com sucesso.`, 'success');
  }
  
  // Event listeners
  const saveBtn = document.getElementById('saveCurrentLeafletBtn');
  const clearAllBtn = document.getElementById('clearAllLeafletsBtn');
  const modalCloseBtn = document.getElementById('leafletViewClose');
  const modalPrintBtn = document.getElementById('leafletViewPrint');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCurrentLeaflet);
  }
  
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllLeaflets);
  }
  
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      const modal = document.getElementById('leafletViewModal');
      if (modal) modal.style.display = 'none';
    });
  }
  
  if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', () => {
      const modal = document.getElementById('leafletViewModal');
      const idx = modal ? parseInt(modal.dataset.currentLeafletIdx, 10) : -1;
      if (idx >= 0) {
        printLeaflet(idx);
      }
    });
  }
  
  // Renderizar quando a tab for aberta
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && target.dataset && target.dataset.tab === 'tab-folhetos') {
      setTimeout(renderSavedLeaflets, 100);

  
  // Exportar funções
  window.renderSavedLeaflets = renderSavedLeaflets;
  window.saveCurrentLeaflet = saveCurrentLeaflet;
})();
// ===== CÂNTICOS PERSONALIZADOS =====
(function() {
  const STORAGE_KEY = 'coroCustomSongs_v1';
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  let customSongs = [];
  let currentFile = null;
  
  // Carregar cânticos personalizados
  function loadCustomSongs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      customSongs = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Erro ao carregar cânticos personalizados:', e);
      customSongs = [];
    }
  }
  
  // Guardar cânticos personalizados
  function saveCustomSongs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customSongs));
    } catch (e) {
      console.error('Erro ao guardar cânticos personalizados:', e);
      if (e.name === 'QuotaExceededError') {
        showToast('Erro: Espaço de armazenamento cheio. Remove alguns folhetos ou cânticos antigos.', 'error');
      }
    }
  }
  
  // Renderizar lista de cânticos personalizados
  function renderCustomSongs() {
    const container = document.getElementById('customSongsContainer');
    if (!container) return;
    
    if (customSongs.length === 0) {
      container.innerHTML = '<p class="small muted">Ainda não tens cânticos personalizados. Clica em "Adicionar Cântico" para começar.</p>';
      return;
    }
    
    let html = '<div style="display: grid; gap: 0.75rem;">';
    
    customSongs.forEach((song, index) => {
      const hasFile = song.fileData ? '📄' : '⚠️';
      const fileType = song.fileType || 'Sem ficheiro';
      
      html += `
        <div style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 0.25rem;">
              ${hasFile} ${song.title}
            </div>
            <div class="small muted">
              ${song.section ? song.section + ' • ' : ''}
              ${song.author || 'Autor desconhecido'}
              ${song.fileType ? ' • ' + song.fileType : ''}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn secondary small" onclick="viewCustomSong(${index})">
              👁️ Ver
            </button>
            <button type="button" class="btn secondary small" onclick="deleteCustomSong(${index})">
              🗑️
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }
  
  // Abrir modal de adicionar
  function openAddModal() {
    const modal = document.getElementById('customSongModal');
    const form = document.getElementById('customSongForm');
    
    if (!modal || !form) return;
    
    // Reset form
    form.reset();
    currentFile = null;
    
    const filePreview = document.getElementById('filePreview');
    if (filePreview) filePreview.style.display = 'none';
    
    modal.style.display = 'flex';
  }
  
  // Fechar modal de adicionar
  function closeAddModal() {
    const modal = document.getElementById('customSongModal');
    if (modal) modal.style.display = 'none';
    currentFile = null;
  }
  
  // Processar upload de ficheiro
  async function handleFileUpload(file) {
    if (!file) return;
    
    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      showToast('Erro: Ficheiro muito grande. Máximo 5MB.', 'error');
      return;
    }
    
    // Validar tipo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Erro: Tipo de ficheiro não suportado. Use PDF, JPG ou PNG.', 'error');
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        currentFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result
        };
        
        showFilePreview(currentFile);
      };
      
      reader.onerror = function() {
        showToast('Erro ao ler ficheiro.', 'error');
      };
      
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Erro ao processar ficheiro:', e);
      showToast('Erro ao processar ficheiro.', 'error');
    }
  }
  
  // Mostrar preview do ficheiro
  function showFilePreview(file) {
    const preview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!preview || !fileName || !fileSize) return;
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    if (file.type.startsWith('image/')) {
      imagePreview.src = file.data;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }
    
    preview.style.display = 'block';
  }
  
  // Formatar tamanho de ficheiro
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  // Guardar cântico personalizado
  function saveCustomSong(e) {
    e.preventDefault();
    
    const title = document.getElementById('customSongTitle').value.trim();
    const section = document.getElementById('customSongSection').value;
    const author = document.getElementById('customSongAuthor').value.trim();
    const notes = document.getElementById('customSongNotes').value.trim();
    
    if (!title) {
      showToast('Por favor, preenche o título do cântico.', 'error');
      return;
    }
    
    const song = {
      id: Date.now(),
      title: title,
      section: section,
      author: author,
      notes: notes,
      createdAt: new Date().toISOString()
    };
    
    if (currentFile) {
      song.fileData = currentFile.data;
      song.fileName = currentFile.name;
      song.fileType = currentFile.type;
      song.fileSize = currentFile.size;
    }
    
    customSongs.push(song);
    saveCustomSongs();
    renderCustomSongs();
    closeAddModal();
    
    showToast('Cântico "' + title + '" adicionado com sucesso!', 'success');
  }
  
  // Ver cântico personalizado
  window.viewCustomSong = function(index) {
    const song = customSongs[index];
    if (!song) return;
    
    const modal = document.getElementById('viewCustomSongModal');
    const title = document.getElementById('viewCustomSongTitle');
    const section = document.getElementById('viewSongSection');
    const author = document.getElementById('viewSongAuthor');
    const notes = document.getElementById('viewSongNotes');
    const notesContainer = document.getElementById('viewSongNotesContainer');
    const fileContainer = document.getElementById('viewSongFileContainer');
    const pdfViewer = document.getElementById('pdfViewer');
    const imageViewer = document.getElementById('imageViewer');
    const pdfEmbed = document.getElementById('pdfEmbed');
    const imageView = document.getElementById('imageView');
    
    if (!modal) return;
    
    title.textContent = song.title;
    section.textContent = song.section || 'N/A';
    author.textContent = song.author || 'Desconhecido';
    
    if (song.notes) {
      notes.textContent = song.notes;
      notesContainer.style.display = 'block';
    } else {
      notesContainer.style.display = 'none';
    }
    
    // Mostrar ficheiro
    if (song.fileData) {
      fileContainer.style.display = 'block';
      
      if (song.fileType === 'application/pdf') {
        pdfEmbed.src = song.fileData;
        pdfViewer.style.display = 'block';
        imageViewer.style.display = 'none';
      } else if (song.fileType.startsWith('image/')) {
        imageView.src = song.fileData;
        imageViewer.style.display = 'block';
        pdfViewer.style.display = 'none';
      }
      
      // Configurar botões de download/abrir
      const downloadBtn = document.getElementById('downloadSongFileBtn');
      const openBtn = document.getElementById('openSongFileBtn');
      
      if (downloadBtn) {
        downloadBtn.onclick = function() {
          const link = document.createElement('a');
          link.href = song.fileData;
          link.download = song.fileName;
          link.click();
        };
      }
      
      if (openBtn) {
        openBtn.onclick = function() {
          // window.open popup removido na v0.9.3;
        };
      }
    } else {
      fileContainer.style.display = 'none';
    }
    
    modal.style.display = 'flex';
  };
  
  // Apagar cântico personalizado
  window.deleteCustomSong = function(index) {
    const song = customSongs[index];
    if (!song) return;
    
    if (!confirm('Tens a certeza que queres apagar "' + song.title + '"?\n\nEsta ação não pode ser desfeita.')) {
      return;
    }
    
    customSongs.splice(index, 1);
    saveCustomSongs();
    renderCustomSongs();
    
    showToast('Cântico "' + song.title + '" apagado.', 'info');
  };
  
  // Event listeners
  const addBtn = document.getElementById('addCustomSongBtn');
  const closeBtn = document.getElementById('customSongModalClose');
  const form = document.getElementById('customSongForm');
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const takePictureBtn = document.getElementById('takePictureBtn');
  const fileInput = document.getElementById('customSongFile');
  const cameraInput = document.getElementById('customSongCamera');
  const removeFileBtn = document.getElementById('removeFileBtn');
  const viewCloseBtn = document.getElementById('viewCustomSongClose');
  
  if (addBtn) {
    addBtn.addEventListener('click', openAddModal);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAddModal);
  }
  
  if (form) {
    form.addEventListener('submit', saveCustomSong);
  }
  
  if (uploadFileBtn && fileInput) {
    uploadFileBtn.addEventListener('click', function() {
      fileInput.click();
    });
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        handleFileUpload(this.files[0]);
      }
    });
  }
  
  if (takePictureBtn && cameraInput) {
    takePictureBtn.addEventListener('click', function() {
      cameraInput.click();
    });
    cameraInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        handleFileUpload(this.files[0]);
      }
    });
  }
  
  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', function() {
      currentFile = null;
      const preview = document.getElementById('filePreview');
      if (preview) preview.style.display = 'none';
      if (fileInput) fileInput.value = '';
      if (cameraInput) cameraInput.value = '';
    });
  }
  
  if (viewCloseBtn) {
    viewCloseBtn.addEventListener('click', function() {
      const modal = document.getElementById('viewCustomSongModal');
      if (modal) modal.style.display = 'none';
    });
  }
  
  // Fechar modais ao clicar fora
  const customModal = document.getElementById('customSongModal');
  const viewModal = document.getElementById('viewCustomSongModal');
  
  if (customModal) {
    customModal.addEventListener('click', function(e) {
      if (e.target === this) closeAddModal();
    });
  }
  
  if (viewModal) {
    viewModal.addEventListener('click', function(e) {
      if (e.target === this) this.style.display = 'none';
    });
  }
  
  // Inicializar
  loadCustomSongs();
  renderCustomSongs();
  
  // Renderizar quando a tab catálogo for aberta
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && target.dataset && target.dataset.tab === 'tab-catalogo') {
      setTimeout(renderCustomSongs, 100);

})();

// ===== GESTÃO DE IMAGEM DO DOMINGO =====
(function() {
  const uploadInput = document.getElementById('uploadSundayImage');
  const removeBtn = document.getElementById('removeSundayImage');
  const preview = document.getElementById('sundayImagePreview');
  const previewImg = document.getElementById('sundayImagePreviewImg');

  // URL temporário da imagem do domingo (não persiste entre sessões)
  if (typeof window !== 'undefined') {
    window.__sundayImageUrl = '';
  }

  function clearSundayImage() {
    if (typeof window !== 'undefined' && window.__sundayImageUrl) {
      try {
        URL.revokeObjectURL(window.__sundayImageUrl);
      } catch (e) {
        // Ignorar erros ao revogar URL
      }
    }
    if (typeof window !== 'undefined') {
      window.__sundayImageUrl = '';
    }
    if (previewImg) {
      previewImg.src = '';
    }
    if (preview) {
      preview.style.display = 'none';
    }
    if (removeBtn) {
      removeBtn.style.display = 'none';
    }
  }

  // Event listener para upload
  if (uploadInput) {
    uploadInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Validar tipo de ficheiro
      if (!file.type || !/^image\//i.test(file.type)) {
        alert('Por favor escolhe um ficheiro de imagem válido (PNG, JPG, etc.).');
        return;
      }

      // Validar tamanho (máx ~5MB para evitar problemas de desempenho)
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagem demasiado grande. Escolhe uma imagem até 5MB.');
        return;
      }

      // Limpar imagem anterior
      clearSundayImage();

      // Criar URL temporário
      const objectUrl = URL.createObjectURL(file);
      if (typeof window !== 'undefined') {
        window.__sundayImageUrl = objectUrl;
      }

      // Mostrar preview
      if (previewImg && preview) {
        previewImg.src = objectUrl;
        preview.style.display = 'block';
      }

      // Mostrar botão de remover
      if (removeBtn) {
        removeBtn.style.display = 'inline-block';
      }
    });
  }

  // Botão para remover imagem
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      if (!confirm('Tens a certeza que queres remover a imagem do domingo?')) {
        return;
      }
      clearSundayImage();
    });
  }
})();


// === v0.7: Botões da ABA PROGRAMA a usar o modal ===
document.getElementById('assemblySheetBtn')?.addEventListener('click', () => openLeafletModal(true));
document.getElementById('assemblySheetBtnNoLyrics')?.addEventListener('click', () => openLeafletModal(false));



// === v0.8: Sistema automático de pesquisa de letras ===
function openLyricsSearchModal(title, author){
    const backdrop=document.getElementById("lyricsSearchBackdrop");
    const list=document.getElementById("lyricsSearchList");
    const titleEl=document.getElementById("lyricsSearchTitle");
    if(!title) return;
    titleEl.textContent = "Procurar letra de: " + title;

    const queryBase = '"' + title + '"';
    const qa = author ? '"' + title + '" "' + author + '" letra' : queryBase + ' letra';
    const enc = encodeURIComponent;

    const links = [
        {label:"Liturgia.pt", url:"https://www.liturgia.pt/?s=" + enc(title)},
        {label:"Cantemus Domino", url:"https://cantemusdomino.net/?s=" + enc(title)},
        {label:"Google", url:"https://www.google.com/search?q=" + enc(qa)},
        {label:"YouTube", url:"https://www.youtube.com/results?search_query=" + enc(qa)},
        {label:"CifraClub", url:"https://www.cifraclub.com.br/?q=" + enc(title)}
    ];

    list.innerHTML = links.map(
        l => `<p><a href="${l.url}" target="_blank">${l.label}</a></p>`
    ).join("");

    backdrop.hidden=false;
}

document.getElementById("lyricsSearchCloseBtn")?.addEventListener("click",()=>{
    document.getElementById("lyricsSearchBackdrop").hidden=true;
});
document.getElementById("lyricsSearchBackdrop")?.addEventListener("click",(e)=>{
    if(e.target.id==="lyricsSearchBackdrop") e.target.hidden=true;
});

// Adicionar botão de procurar letra junto a cada cântico
(function(){
    (window.PROGRAM_PARTS||[]).forEach(part=>{
        const sel=document.getElementById(part.id);
        if(!sel) return;

        let btn=document.getElementById("lyricsBtn_"+part.id);
        if(!btn){
            btn=document.createElement("button");
            btn.id="lyricsBtn_"+part.id;
            btn.className="btn tiny";
            btn.textContent="Procurar letra";
            sel.insertAdjacentElement("afterend",btn);
        }

        btn.addEventListener("click",()=>{
            const title = sel.value || "";
            if (!title) {
                if (typeof showToast === "function") {
                    showToast("Escolhe primeiro um cântico para esta parte.", "warning");
                }
                return;
            }
            let author = "";
            try {
                if (Array.isArray(window.songs)) {
                    const match = window.songs.find(s => {
                        const st = s.Título || s.Titulo || s.titulo || s.tituloOriginal || "";
                        return st === title;
                    });
                    if (match) {
                        author = match.Autor || match.autor || match.Compositor || "";
                    }
                }
            } catch(e) {
                console.error("Erro ao procurar autor para pesquisa de letra:", e);
            }
            openLyricsSearchModal(title, author);
        });
    });
})();;
