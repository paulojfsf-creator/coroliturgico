// ============================================
// 🎵 GESTÃO LITÚRGICA - CORO PAROQUIAL
// Versão 15.0 - JavaScript Completo
// ============================================

// ============================================
// CONFIGURAÇÃO GLOBAL
// ============================================

const PROGRAM_PARTS = [
  {id:'entrada', label:'Entrada'},
  {id:'atoPenitencial', label:'Ato Penitencial'},
  {id:'gloria', label:'Glória'},
  {id:'salmo', label:'Salmo Responsorial'},
  {id:'aclamacao', label:'Aclamação ao Evangelho'},
  {id:'ofertorio', label:'Ofertório'},
  {id:'santo', label:'Santo'},
  {id:'paiNosso', label:'Pai Nosso'},
  {id:'paz', label:'Paz'},
  {id:'cordeiro', label:'Cordeiro de Deus'},
  {id:'comunhao', label:'Comunhão'},
  {id:'acaoGracas', label:'Ação de Graças'},
  {id:'final', label:'Final'}
];

window.PROGRAM_PARTS = PROGRAM_PARTS;

let songs = [];
let history = [];
let savedLeaflets = [];
let customSongs = [];
let songUsageHistory = [];
let partLyricsOverrides = {};

// ============================================
// SISTEMA DE TABS
// ============================================

function initTabs() {
  const tabButtons = document.querySelectorAll('.tabs button[data-tab]');
  const tabContents = document.querySelectorAll('.tab[data-tab]');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Remove active de todos
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Adiciona active ao clicado
      button.classList.add('active');
      const targetContent = document.querySelector(`.tab[data-tab="${targetTab}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Salva tab ativa
      localStorage.setItem('coroActiveTab', targetTab);
      
      // Atualiza conteúdo se necessário
      if (targetTab === 'catalogo') {
        renderSongsTable();
      } else if (targetTab === 'historico') {
        renderHistory();
      } else if (targetTab === 'folhetos') {
        renderSavedLeaflets();
      }
    });
  });
  
  // Restaura última tab ativa
  const lastTab = localStorage.getItem('coroActiveTab') || 'inicio';
  const lastButton = document.querySelector(`button[data-tab="${lastTab}"]`);
  if (lastButton) {
    lastButton.click();
  } else {
    // Se não encontrar, ativa a primeira
    if (tabButtons.length > 0) {
      tabButtons[0].click();
    }
  }
}

// ============================================
// TEMA ESCURO/CLARO
// ============================================

function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;
  
  const savedTheme = localStorage.getItem('coroTheme') || 'dark';
  document.documentElement.className = savedTheme;
  updateThemeIcon(savedTheme);
  
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.className || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.className = newTheme;
    localStorage.setItem('coroTheme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ============================================
// CALENDÁRIO LITÚRGICO
// ============================================

const LITURGICAL_CALENDAR = {
  '2024-12-01': {title: 'I Domingo do Advento', color: 'Roxo', season: 'advento'},
  '2024-12-08': {title: 'II Domingo do Advento', color: 'Roxo', season: 'advento'},
  '2024-12-15': {title: 'III Domingo do Advento', color: 'Rosa', season: 'advento'},
  '2024-12-22': {title: 'IV Domingo do Advento', color: 'Roxo', season: 'advento'},
  '2024-12-25': {title: 'Natal do Senhor', color: 'Branco', season: 'natal'},
  '2024-12-29': {title: 'Sagrada Família', color: 'Branco', season: 'natal'},
  '2025-01-01': {title: 'Santa Maria, Mãe de Deus', color: 'Branco', season: 'natal'},
  '2025-01-05': {title: 'II Domingo do Natal', color: 'Branco', season: 'natal'},
  '2025-01-06': {title: 'Epifania do Senhor', color: 'Branco', season: 'natal'},
};

function getLiturgicalInfo(dateStr) {
  if (LITURGICAL_CALENDAR[dateStr]) {
    return LITURGICAL_CALENDAR[dateStr];
  }
  
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  
  if (day === 0) {
    return {title: 'Domingo do Tempo Comum', color: 'Verde', season: 'tempocomum'};
  } else {
    return {title: 'Dia Ferial', color: 'Verde', season: 'tempocomum'};
  }
}

function updateLiturgicalFromDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput || !dateInput.value) return;
  
  const info = getLiturgicalInfo(dateInput.value);
  
  const titleInput = document.getElementById('liturgicalTitle');
  const colorInput = document.getElementById('liturgicalColor');
  
  if (titleInput) titleInput.value = info.title;
  if (colorInput) colorInput.value = info.color;
  
  // Atualiza cor do tema
  updateBodyLiturgicalClass(info.season);
}

function updateBodyLiturgicalClass(season) {
  document.body.className = document.body.className
    .replace(/liturgic-\w+/g, '')
    .trim();
  
  if (season) {
    document.body.classList.add(`liturgic-${season}`);
  }
}

function updateDashboard() {
  const container = document.getElementById('upcomingCelebrations');
  if (!container) return;
  
  const today = new Date();
  const upcoming = [];
  
  Object.entries(LITURGICAL_CALENDAR).forEach(([dateStr, info]) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (date >= today) {
      upcoming.push({date: dateStr, ...info});
    }
  });
  
  upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let html = '<ul>';
  upcoming.slice(0, 5).forEach(item => {
    const dateObj = new Date(item.date + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long'
    });
    html += `<li><strong>${formatted}</strong> - ${item.title} (${item.color})</li>`;
  });
  html += '</ul>';
  
  container.innerHTML = html;
}

// ============================================
// UPLOAD DE IMAGEM DO DOMINGO
// ============================================

function initSundayImage() {
  const input = document.getElementById('sundayImage');
  const preview = document.getElementById('sundayImagePreview');
  const removeBtn = document.getElementById('removeSundayImageBtn');
  
  if (!input || !preview) return;
  
  // Carrega imagem salva
  loadSavedSundayImage();
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validação
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande! Máximo 2MB.');
      input.value = '';
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione uma imagem válida.');
      input.value = '';
      return;
    }
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target.result;
      localStorage.setItem('coroSundayImage', imgData);
      displaySundayImage(imgData);
    };
    reader.readAsDataURL(file);
  });
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (confirm('Remover imagem do domingo?')) {
        localStorage.removeItem('coroSundayImage');
        preview.style.display = 'none';
        input.value = '';
      }
    });
  }
}

function loadSavedSundayImage() {
  const imgData = localStorage.getItem('coroSundayImage');
  if (imgData) {
    displaySundayImage(imgData);
  }
}

function displaySundayImage(imgData) {
  const preview = document.getElementById('sundayImagePreview');
  if (!preview) return;
  
  preview.innerHTML = `
    <img src="${imgData}" alt="Imagem do domingo" style="max-width: 100%; border-radius: 0.5rem;">
  `;
  preview.style.display = 'block';
}

// ============================================
// CATÁLOGO DE CÂNTICOS (CSV)
// ============================================

function loadCsvFromGoogleSheets() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTv7BD5eoTpio0s2Vjb6YCuZNmjCyG_leoWxl6v-IkIMV-LiJZNmCwhqA9j68IESZQJiU-H3ri3_flR/pub?gid=1808635095&single=true&output=csv";
  
  fetch(url)
    .then(r => r.text())
    .then(text => {
      const rows = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (!rows.length) {
        songs = [];
        populateProgramSelects();
        renderSongsTable();
        return;
      }
      
      const headers = rows[0].split(',');
      songs = rows.slice(1).map(line => {
        const cols = line.split(',');
        const obj = {};
        headers.forEach((h, i) => {
          obj[h.trim()] = (cols[i] || '').trim();
        });
        return obj;
      });
      
      populateProgramSelects();
      renderSongsTable();
      loadCustomSongs();
    })
    .catch(err => {
      console.error("Erro ao carregar CSV:", err);
      const container = document.getElementById('songsTableContainer');
      if (container) {
        container.innerHTML = "<p>Erro ao carregar catálogo. A usar dados locais.</p>";
      }
      songs = [];
      populateProgramSelects();
    });
}

function populateProgramSelects() {
  PROGRAM_PARTS.forEach(part => {
    const select = document.getElementById(part.id);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Selecione --</option>';
    
    // Adiciona cânticos do CSV
    songs.forEach(song => {
      const title = song["Título"] || song["Titulo"] || song["titulo"] || "";
      if (title) {
        const option = document.createElement("option");
        option.value = title;
        option.textContent = title;
        select.appendChild(option);
      }
    });
    
    // Adiciona cânticos personalizados
    customSongs.forEach(song => {
      const option = document.createElement("option");
      option.value = `[CUSTOM] ${song.title}`;
      option.textContent = `${song.title} ⭐`;
      select.appendChild(option);
    });
    
    // Restaura valor anterior
    if (currentValue) {
      select.value = currentValue;
    }
  });
}

function renderSongsTable() {
  const container = document.getElementById('songsTableContainer');
  if (!container) return;
  
  if (!songs.length && !customSongs.length) {
    container.innerHTML = "<p>Nenhum cântico disponível.</p>";
    return;
  }
  
  let html = '<table><thead><tr><th>Título</th><th>Tema</th><th>Ações</th></tr></thead><tbody>';
  
  // Cânticos do CSV
  songs.forEach((song, index) => {
    const title = song["Título"] || song["Titulo"] || song["titulo"] || "";
    const theme = song["Tema"] || "";
    if (title) {
      html += `
        <tr>
          <td>${title}</td>
          <td>${theme}</td>
          <td>
            <button class="btn small secondary" onclick="viewSongUsage('${title.replace(/'/g, "\\'")}')">
              📊 Histórico
            </button>
          </td>
        </tr>
      `;
    }
  });
  
  // Cânticos personalizados
  customSongs.forEach(song => {
    html += `
      <tr>
        <td>${song.title} ⭐</td>
        <td>${song.section || '-'}</td>
        <td>
          <button class="btn small" onclick="viewCustomSong(${song.id})">👁️ Ver</button>
          <button class="btn small secondary" onclick="deleteCustomSong(${song.id})">🗑️</button>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ============================================
// PROGRAMA
// ============================================

function collectProgramFromForm() {
  const date = document.getElementById('date')?.value || '';
  const title = document.getElementById('liturgicalTitle')?.value || '';
  const color = document.getElementById('liturgicalColor')?.value || '';
  const extraTheme = document.getElementById('extraTheme')?.value || '';
  
  const program = {};
  PROGRAM_PARTS.forEach(part => {
    const value = document.getElementById(part.id)?.value || '';
    program[part.id] = value;
  });
  
  return {date, title, color, extraTheme, program};
}

function applyProgramToForm(record) {
  if (!record) return;
  
  const dateInput = document.getElementById('date');
  const titleInput = document.getElementById('liturgicalTitle');
  const colorInput = document.getElementById('liturgicalColor');
  const extraInput = document.getElementById('extraTheme');
  
  if (dateInput) dateInput.value = record.date || '';
  if (titleInput) titleInput.value = record.title || '';
  if (colorInput) colorInput.value = record.color || '';
  if (extraInput) extraInput.value = record.extraTheme || '';
  
  PROGRAM_PARTS.forEach(part => {
    const input = document.getElementById(part.id);
    if (input) {
      input.value = record.program[part.id] || '';
    }
  });
  
  updatePreview();
}

function updatePreview() {
  const container = document.getElementById('previewContainer');
  if (!container) return;
  
  const record = collectProgramFromForm();
  container.innerHTML = buildLeafletHtml(record);
}

function buildLeafletHtml(record) {
  let html = `
    <div style="font-family: 'Noto Serif', serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
      <h1 style="text-align: center; margin-bottom: 0.5rem;">${record.title}</h1>
      <p style="text-align: center; color: #666; margin-bottom: 2rem;">
        ${new Date(record.date + 'T00:00:00').toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </p>
  `;
  
  if (record.extraTheme) {
    html += `<p style="text-align: center; font-style: italic; margin-bottom: 2rem;">${record.extraTheme}</p>`;
  }
  
  html += '<div style="line-height: 1.8;">';
  
  PROGRAM_PARTS.forEach(part => {
    const value = record.program[part.id];
    if (value) {
      html += `
        <div style="margin-bottom: 1rem;">
          <strong>${part.label}:</strong> ${value}
        </div>
      `;
    }
  });
  
  html += '</div></div>';
  return html;
}

// ============================================
// HISTÓRICO
// ============================================

function loadHistory() {
  try {
    history = JSON.parse(localStorage.getItem('coroHistory') || '[]');
  } catch (e) {
    history = [];
  }
  return history;
}

function saveHistory() {
  localStorage.setItem('coroHistory', JSON.stringify(history));
}

function saveProgram() {
  const record = collectProgramFromForm();
  
  if (!record.date) {
    alert('Por favor preencha a data.');
    return;
  }
  
  loadHistory();
  
  // Remove duplicado
  history = history.filter(h => h.date !== record.date);
  
  // Adiciona novo
  history.unshift(record);
  
  // Limita a 50
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  
  saveHistory();
  alert('Programa guardado!');
  
  // Registra uso dos cânticos
  recordSongUsage(record);
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;
  
  loadHistory();
  
  if (!history.length) {
    container.innerHTML = '<p>Nenhum programa guardado.</p>';
    return;
  }
  
  let html = '<div class="history-list">';
  
  history.forEach((record, index) => {
    const dateObj = new Date(record.date + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    html += `
      <div class="history-item" style="padding: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; margin-bottom: 0.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <strong>${formatted}</strong><br>
            <span style="color: #666;">${record.title}</span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn small" onclick="loadHistoryItem(${index})">📝 Carregar</button>
            <button class="btn small secondary" onclick="deleteHistoryItem(${index})">🗑️</button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

window.loadHistoryItem = function(index) {
  loadHistory();
  if (history[index]) {
    applyProgramToForm(history[index]);
    // Muda para tab Programa
    const programTab = document.querySelector('button[data-tab="programa"]');
    if (programTab) programTab.click();
    alert('Programa carregado!');
  }
};

window.deleteHistoryItem = function(index) {
  if (!confirm('Eliminar este programa?')) return;
  
  loadHistory();
  history.splice(index, 1);
  saveHistory();
  renderHistory();
};

// ============================================
// FOLHETOS GUARDADOS
// ============================================

function loadSavedLeaflets() {
  try {
    savedLeaflets = JSON.parse(localStorage.getItem('coroLeaflets') || '[]');
  } catch (e) {
    savedLeaflets = [];
  }
  return savedLeaflets;
}

function saveSavedLeaflets() {
  localStorage.setItem('coroLeaflets', JSON.stringify(savedLeaflets));
}

function saveCurrentLeaflet() {
  const record = collectProgramFromForm();
  
  if (!record.date) {
    alert('Por favor preencha a data primeiro.');
    return;
  }
  
  loadSavedLeaflets();
  
  const leaflet = {
    id: Date.now(),
    date: record.date,
    title: record.title,
    html: buildLeafletHtml(record),
    savedAt: new Date().toISOString()
  };
  
  savedLeaflets.unshift(leaflet);
  
  if (savedLeaflets.length > 30) {
    savedLeaflets = savedLeaflets.slice(0, 30);
  }
  
  saveSavedLeaflets();
  alert('Folheto guardado!');
  renderSavedLeaflets();
}

function renderSavedLeaflets() {
  const container = document.getElementById('savedLeafletsContainer');
  if (!container) return;
  
  loadSavedLeaflets();
  
  if (!savedLeaflets.length) {
    container.innerHTML = '<p>Nenhum folheto guardado.</p>';
    return;
  }
  
  let html = '<div class="leaflets-grid">';
  
  savedLeaflets.forEach(leaflet => {
    const dateObj = new Date(leaflet.date + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    html += `
      <div class="leaflet-card" style="border: 1px solid #ddd; padding: 1rem; border-radius: 0.5rem;">
        <strong>${formatted}</strong><br>
        <span style="color: #666; font-size: 0.9rem;">${leaflet.title}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
          <button class="btn small" onclick="viewLeaflet(${leaflet.id})">👁️ Ver</button>
          <button class="btn small secondary" onclick="deleteLeaflet(${leaflet.id})">🗑️</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

window.viewLeaflet = function(id) {
  loadSavedLeaflets();
  const leaflet = savedLeaflets.find(l => l.id === id);
  if (!leaflet) return;
  
  const modal = document.getElementById('leafletModalBackdrop');
  const content = document.getElementById('leafletModalContent');
  
  if (modal && content) {
    content.innerHTML = leaflet.html;
    modal.hidden = false;
  }
};

window.deleteLeaflet = function(id) {
  if (!confirm('Eliminar este folheto?')) return;
  
  loadSavedLeaflets();
  savedLeaflets = savedLeaflets.filter(l => l.id !== id);
  saveSavedLeaflets();
  renderSavedLeaflets();
};

// ============================================
// MODAL DO FOLHETO
// ============================================

function initLeafletModal() {
  const saveBtn = document.getElementById('saveCurrentLeafletBtn');
  const closeBtn = document.getElementById('leafletModalCloseBtn');
  const printBtn = document.getElementById('leafletModalPrintBtn');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCurrentLeaflet);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const modal = document.getElementById('leafletModalBackdrop');
      if (modal) modal.hidden = true;
    });
  }
  
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const content = document.getElementById('leafletModalContent');
      if (content) {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Folheto</title>
            <style>
              body { font-family: 'Noto Serif', serif; padding: 2rem; }
              @media print {
                body { padding: 1rem; }
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    });
  }
}

// ============================================
// HISTÓRICO DE USO DE CÂNTICOS
// ============================================

function recordSongUsage(record) {
  try {
    songUsageHistory = JSON.parse(localStorage.getItem('coroSongUsage') || '[]');
  } catch (e) {
    songUsageHistory = [];
  }
  
  PROGRAM_PARTS.forEach(part => {
    const songTitle = record.program[part.id];
    if (songTitle) {
      songUsageHistory.push({
        song: songTitle,
        date: record.date,
        part: part.label,
        liturgicalTitle: record.title,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Limita histórico
  if (songUsageHistory.length > 500) {
    songUsageHistory = songUsageHistory.slice(-500);
  }
  
  localStorage.setItem('coroSongUsage', JSON.stringify(songUsageHistory));
}

window.viewSongUsage = function(songTitle) {
  try {
    songUsageHistory = JSON.parse(localStorage.getItem('coroSongUsage') || '[]');
  } catch (e) {
    songUsageHistory = [];
  }
  
  const usage = songUsageHistory.filter(u => u.song === songTitle);
  
  const modal = document.getElementById('songUsageModal');
  const title = document.getElementById('songUsageModalTitle');
  const content = document.getElementById('songUsageModalContent');
  
  if (!modal || !title || !content) return;
  
  title.textContent = `Histórico: ${songTitle}`;
  
  if (!usage.length) {
    content.innerHTML = '<p>Este cântico ainda não foi utilizado.</p>';
  } else {
    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    usage.reverse().forEach(u => {
      const dateObj = new Date(u.date + 'T00:00:00');
      const formatted = dateObj.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      html += `
        <div style="padding: 0.75rem; border-bottom: 1px solid #eee;">
          <strong>${formatted}</strong><br>
          <span style="color: #666;">${u.liturgicalTitle}</span><br>
          <span style="font-size: 0.85rem; color: #999;">Usado como: ${u.part}</span>
        </div>
      `;
    });
    html += '</div>';
    content.innerHTML = html;
  }
  
  modal.style.display = 'flex';
};

// Fechar modal de histórico
document.addEventListener('click', (e) => {
  if (e.target.id === 'songUsageModalClose') {
    document.getElementById('songUsageModal').style.display = 'none';
  }
});

// ============================================
// CÂNTICOS PERSONALIZADOS
// ============================================

function loadCustomSongs() {
  try {
    customSongs = JSON.parse(localStorage.getItem('coroCustomSongs') || '[]');
  } catch (e) {
    customSongs = [];
  }
  populateProgramSelects();
}

function saveCustomSongs() {
  localStorage.setItem('coroCustomSongs', JSON.stringify(customSongs));
}

function initCustomSongs() {
  const openBtn = document.getElementById('openCustomSongModalBtn');
  const closeBtn = document.getElementById('customSongModalClose');
  const modal = document.getElementById('customSongModal');
  const form = document.getElementById('customSongForm');
  
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'flex';
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
      form.reset();
      document.getElementById('filePreview').style.display = 'none';
    });
  }
  
  // Upload de ficheiro
  const uploadBtn = document.getElementById('uploadFileBtn');
  const fileInput = document.getElementById('customSongFile');
  
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleCustomSongFile);
  }
  
  // Câmara
  const cameraBtn = document.getElementById('takePictureBtn');
  const cameraInput = document.getElementById('customSongCamera');
  
  if (cameraBtn && cameraInput) {
    cameraBtn.addEventListener('click', () => cameraInput.click());
    cameraInput.addEventListener('change', handleCustomSongFile);
  }
  
  // Remover ficheiro
  const removeBtn = document.getElementById('removeFileBtn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      fileInput.value = '';
      cameraInput.value = '';
      document.getElementById('filePreview').style.display = 'none';
      delete window.customSongFileData;
    });
  }
  
  // Submit form
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveCustomSong();
    });
  }
}

function handleCustomSongFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validação de tamanho
  if (file.size > 5 * 1024 * 1024) {
    alert('Ficheiro muito grande! Máximo 5MB.');
    e.target.value = '';
    return;
  }
  
  // Preview
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  document.getElementById('filePreview').style.display = 'block';
  
  const reader = new FileReader();
  reader.onload = (e) => {
    window.customSongFileData = {
      name: file.name,
      type: file.type,
      data: e.target.result
    };
    
    // Preview de imagem
    if (file.type.startsWith('image/')) {
      const img = document.getElementById('imagePreview');
      img.src = e.target.result;
      img.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function saveCustomSong() {
  const title = document.getElementById('customSongTitle').value.trim();
  const section = document.getElementById('customSongSection').value;
  const author = document.getElementById('customSongAuthor').value.trim();
  const notes = document.getElementById('customSongNotes').value.trim();
  
  if (!title) {
    alert('Por favor indique o título.');
    return;
  }
  
  loadCustomSongs();
  
  const song = {
    id: Date.now(),
    title,
    section,
    author,
    notes,
    file: window.customSongFileData || null,
    createdAt: new Date().toISOString()
  };
  
  customSongs.push(song);
  saveCustomSongs();
  
  document.getElementById('customSongModal').style.display = 'none';
  document.getElementById('customSongForm').reset();
  document.getElementById('filePreview').style.display = 'none';
  delete window.customSongFileData;
  
  populateProgramSelects();
  renderSongsTable();
  alert('Cântico personalizado guardado!');
}

window.viewCustomSong = function(id) {
  loadCustomSongs();
  const song = customSongs.find(s => s.id === id);
  if (!song) return;
  
  const modal = document.getElementById('viewCustomSongModal');
  
  document.getElementById('viewCustomSongTitle').textContent = song.title;
  document.getElementById('viewSongSection').textContent = song.section || '-';
  document.getElementById('viewSongAuthor').textContent = song.author || '-';
  
  if (song.notes) {
    document.getElementById('viewSongNotes').textContent = song.notes;
    document.getElementById('viewSongNotesContainer').style.display = 'block';
  } else {
    document.getElementById('viewSongNotesContainer').style.display = 'none';
  }
  
  if (song.file) {
    document.getElementById('viewSongFileContainer').style.display = 'block';
    
    // Download
    document.getElementById('downloadSongFileBtn').onclick = () => {
      const a = document.createElement('a');
      a.href = song.file.data;
      a.download = song.file.name;
      a.click();
    };
    
    // Abrir em nova aba
    document.getElementById('openSongFileBtn').onclick = () => {
      window.open(song.file.data, '_blank');
    };
    
    // Viewer
    if (song.file.type === 'application/pdf') {
      document.getElementById('pdfViewer').style.display = 'block';
      document.getElementById('imageViewer').style.display = 'none';
      document.getElementById('pdfEmbed').src = song.file.data;
    } else if (song.file.type.startsWith('image/')) {
      document.getElementById('imageViewer').style.display = 'block';
      document.getElementById('pdfViewer').style.display = 'none';
      document.getElementById('imageView').src = song.file.data;
    }
  } else {
    document.getElementById('viewSongFileContainer').style.display = 'none';
  }
  
  modal.style.display = 'flex';
};

window.deleteCustomSong = function(id) {
  if (!confirm('Eliminar este cântico personalizado?')) return;
  
  loadCustomSongs();
  customSongs = customSongs.filter(s => s.id !== id);
  saveCustomSongs();
  populateProgramSelects();
  renderSongsTable();
};

// Fechar modal de visualização
document.addEventListener('click', (e) => {
  if (e.target.id === 'viewCustomSongClose') {
    document.getElementById('viewCustomSongModal').style.display = 'none';
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎵 Gestão Litúrgica - Iniciando...');
  
  // Sistemas principais
  initTabs();
  initTheme();
  updateDashboard();
  
  // Programa
  const dateInput = document.getElementById('date');
  if (dateInput) {
    // Define data de hoje
    dateInput.value = new Date().toISOString().split('T')[0];
    updateLiturgicalFromDate();
    
    dateInput.addEventListener('change', updateLiturgicalFromDate);
  }
  
  // Atualiza preview ao mudar qualquer campo
  PROGRAM_PARTS.forEach(part => {
    const input = document.getElementById(part.id);
    if (input) {
      input.addEventListener('change', updatePreview);
    }
  });
  
  // Botão de guardar programa
  const saveProgramBtn = document.getElementById('saveProgramBtn');
  if (saveProgramBtn) {
    saveProgramBtn.addEventListener('click', saveProgram);
  }
  
  // Imagem do domingo
  initSundayImage();
  
  // Catálogo
  loadCsvFromGoogleSheets();
  
  // Folhetos
  initLeafletModal();
  
  // Cânticos personalizados
  loadCustomSongs();
  initCustomSongs();
  
  console.log('✅ Aplicação carregada!');
});
