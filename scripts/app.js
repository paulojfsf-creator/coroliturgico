// ===== Aplicação Principal =====

(function() {
  'use strict';

  // Estado global da aplicação
  const AppState = {
    currentTab: 'programa',
    darkMode: false,
    currentProgram: {},
    songs: [],
    history: [],
    settings: DEFAULT_SETTINGS,
    initialized: false
  };

  // ===== Inicialização =====
  function init() {
    if (AppState.initialized) return;
    
    console.log('🎵 Inicializando aplicação...');
    
    // Carregar configurações
    loadSettings();
    
    // Configurar interface
    setupUI();
    
    // Carregar dados
    loadData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Aplicar tema
    applyTheme();
    
    // Renderizar interface inicial
    renderProgramParts();
    renderCurrentDate();
    
    AppState.initialized = true;
    console.log('✅ Aplicação inicializada com sucesso!');
  }

  // ===== Configuração da UI =====
  function setupUI() {
    // Configurar navegação por tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Configurar botão de modo escuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }
  }

  // ===== Event Listeners =====
  function setupEventListeners() {
    // Botão de guardar programa
    const saveProgramBtn = document.getElementById('saveProgramBtn');
    if (saveProgramBtn) {
      saveProgramBtn.addEventListener('click', saveProgram);
    }

    // Botão de limpar programa
    const clearProgramBtn = document.getElementById('clearProgramBtn');
    if (clearProgramBtn) {
      clearProgramBtn.addEventListener('click', clearProgram);
    }

    // Botão de imprimir
    const printPreviewBtn = document.getElementById('printPreviewBtn');
    if (printPreviewBtn) {
      printPreviewBtn.addEventListener('click', () => window.print());
    }

    // Mudança de tempo litúrgico
    const liturgicalSelect = document.getElementById('programLiturgicalTime');
    if (liturgicalSelect) {
      liturgicalSelect.addEventListener('change', updateLiturgicalTheme);
    }

    // Auto-save ao digitar
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (AppState.settings.autoSave) {
          autoSaveProgram();
        }
      });
    });

    // Atalhos de teclado
    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  // ===== Navegação =====
  function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
    }

    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
      tab.hidden = true;
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.hidden = false;
    }

    AppState.currentTab = tabName;

    // Carregar dados específicos da tab se necessário
    switch(tabName) {
      case 'catalogo':
        renderCatalog();
        break;
      case 'historico':
        renderHistory();
        break;
      case 'sugestoes':
        renderSuggestions();
        break;
      case 'preview':
        renderPreview();
        break;
    }
  }

  // ===== Tema =====
  function toggleDarkMode() {
    AppState.darkMode = !AppState.darkMode;
    applyTheme();
    saveSettings();
    
    showToast(
      AppState.darkMode ? 'Modo escuro ativado' : 'Modo claro ativado',
      'success'
    );
  }

  function applyTheme() {
    if (AppState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function updateLiturgicalTheme() {
    const select = document.getElementById('programLiturgicalTime');
    if (!select) return;
    
    const time = select.value;
    const liturgical = LITURGICAL_TIMES[time];
    
    if (!liturgical) return;

    // Remover classes anteriores
    Object.values(LITURGICAL_TIMES).forEach(lt => {
      document.body.classList.remove(lt.className);
    });
    
    // Adicionar nova classe
    document.body.classList.add(liturgical.className);
    
    // Atualizar badge
    const badge = document.getElementById('liturgicalText');
    if (badge) {
      badge.textContent = liturgical.label;
    }
  }

  // ===== Renderização =====
  function renderProgramParts() {
    const container = document.getElementById('programPartsContainer');
    if (!container) return;

    container.innerHTML = '';

    PROGRAM_PARTS.forEach(part => {
      const partElement = createProgramPartElement(part);
      container.appendChild(partElement);
    });
  }

  function createProgramPartElement(part) {
    const div = document.createElement('div');
    div.className = 'program-part';
    div.dataset.partId = part.id;

    div.innerHTML = `
      <div class="program-part-header">
        <div class="program-part-title">
          <i class="${part.icon}"></i>
          <span>${part.label}</span>
        </div>
        <div class="program-part-actions">
          <button class="btn-icon btn-sm" onclick="selectSongForPart('${part.id}')" title="Selecionar cântico">
            <i class="ti ti-plus"></i>
          </button>
          <button class="btn-icon btn-sm" onclick="togglePart('${part.id}')" title="Expandir/Colapsar">
            <i class="ti ti-chevron-down"></i>
          </button>
        </div>
      </div>
      <div class="program-part-body" id="part-${part.id}-body">
        <p class="text-muted text-small">Nenhum cântico selecionado</p>
      </div>
    `;

    return div;
  }

  function renderCurrentDate() {
    const dateInput = document.getElementById('programDate');
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
  }

  function renderCatalog() {
    const catalogList = document.getElementById('catalogList');
    if (!catalogList) return;

    if (AppState.songs.length === 0) {
      catalogList.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-music-off"></i>
          <h3>Catálogo Vazio</h3>
          <p>Ainda não há cânticos no catálogo.</p>
          <button class="btn btn-primary" id="addFirstSong">
            <i class="ti ti-plus"></i>
            Adicionar Primeiro Cântico
          </button>
        </div>
      `;
      return;
    }

    catalogList.innerHTML = AppState.songs.map(song => `
      <div class="catalog-item" data-song-id="${song.id}">
        <div class="catalog-item-header">
          <div>
            <h3 class="catalog-item-title">${song.title}</h3>
            <div class="catalog-item-meta">
              ${song.author ? `<span><i class="ti ti-user"></i> ${song.author}</span>` : ''}
              ${song.tone ? `<span><i class="ti ti-music"></i> Tom: ${song.tone}</span>` : ''}
            </div>
          </div>
          <button class="btn-icon" onclick="toggleFavorite('${song.id}')">
            <i class="ti ${song.favorite ? 'ti-star-filled' : 'ti-star'}"></i>
          </button>
        </div>
        ${song.tags ? `
          <div class="catalog-item-tags">
            ${song.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        <div class="catalog-item-actions">
          <button class="btn btn-sm btn-secondary" onclick="editSong('${song.id}')">
            <i class="ti ti-edit"></i> Editar
          </button>
          <button class="btn btn-sm btn-error" onclick="deleteSong('${song.id}')">
            <i class="ti ti-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderHistory() {
    const timeline = document.getElementById('historyTimeline');
    if (!timeline) return;

    if (AppState.history.length === 0) {
      timeline.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-history-off"></i>
          <h3>Sem Histórico</h3>
          <p>Ainda não há programas guardados.</p>
        </div>
      `;
      return;
    }

    // Ordenar por data (mais recente primeiro)
    const sortedHistory = [...AppState.history].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    timeline.innerHTML = sortedHistory.map(program => `
      <div class="history-item">
        <div class="history-item-date">${formatDate(program.date)}</div>
        <div class="history-item-card">
          <h3 class="history-item-title">${program.celebration}</h3>
          <div class="history-item-meta">
            <span><i class="ti ti-clock"></i> ${program.time}</span>
            <span><i class="ti ti-palette"></i> ${LITURGICAL_TIMES[program.liturgicalTime]?.label}</span>
            ${program.presider ? `<span><i class="ti ti-user"></i> ${program.presider}</span>` : ''}
          </div>
          <div class="history-item-actions">
            <button class="btn btn-sm btn-secondary" onclick="loadProgramFromHistory('${program.id}')">
              <i class="ti ti-reload"></i> Reutilizar
            </button>
            <button class="btn btn-sm btn-secondary" onclick="viewProgram('${program.id}')">
              <i class="ti ti-eye"></i> Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderSuggestions() {
    console.log('Renderizando sugestões...');
    // Implementar sistema de sugestões
  }

  function renderPreview() {
    const container = document.getElementById('previewContainer');
    if (!container) return;

    const program = getCurrentProgramData();
    
    container.innerHTML = `
      <div class="preview-header">
        <div>
          <div class="preview-title">
            Coro Paroquial São João Batista de Rio Caldo
          </div>
          <div class="preview-meta">
            ${program.celebration} • ${formatDate(program.date)} • ${program.time}
          </div>
        </div>
        <div class="preview-meta">
          ${LITURGICAL_TIMES[program.liturgicalTime]?.label || ''}
          ${program.presider ? ` • ${program.presider}` : ''}
        </div>
      </div>
      <div class="preview-content">
        ${PROGRAM_PARTS.map(part => {
          const song = program.parts?.[part.id];
          if (!song || !song.title) return '';
          
          return `
            <div class="preview-section">
              <div class="preview-section-title">${part.label}</div>
              <div class="preview-song-title">${song.title}</div>
              ${song.author ? `<div class="preview-song-meta">Autor: ${song.author}</div>` : ''}
              ${song.tone ? `<div class="preview-song-meta">Tom: ${song.tone}</div>` : ''}
              ${song.lyrics ? `<div class="preview-song-lyrics">${song.lyrics}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ===== Gestão de Dados =====
  function loadData() {
    try {
      // Carregar cânticos
      const songsData = localStorage.getItem(STORAGE_KEYS.SONGS);
      AppState.songs = songsData ? JSON.parse(songsData) : [];

      // Carregar histórico
      const historyData = localStorage.getItem(STORAGE_KEYS.HISTORY);
      AppState.history = historyData ? JSON.parse(historyData) : [];

      // Carregar programa atual
      const currentProgramData = localStorage.getItem(STORAGE_KEYS.CURRENT_PROGRAM);
      if (currentProgramData) {
        AppState.currentProgram = JSON.parse(currentProgramData);
        populateProgramForm(AppState.currentProgram);
      }

      console.log(`📊 Dados carregados: ${AppState.songs.length} cânticos, ${AppState.history.length} programas`);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados', 'error');
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(AppState.songs));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(AppState.history));
    } catch (error) {
      console.error('Erro ao guardar dados:', error);
      showToast('Erro ao guardar dados', 'error');
    }
  }

  function loadSettings() {
    try {
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      AppState.settings = settingsData ? 
        { ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) } : 
        { ...DEFAULT_SETTINGS };
      
      AppState.darkMode = AppState.settings.darkMode;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      AppState.settings = { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      AppState.settings.darkMode = AppState.darkMode;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(AppState.settings));
    } catch (error) {
      console.error('Erro ao guardar configurações:', error);
    }
  }

  // ===== Programas =====
  function getCurrentProgramData() {
    const data = {
      id: AppState.currentProgram.id || generateId(),
      date: document.getElementById('programDate')?.value || '',
      time: document.getElementById('programTime')?.value || '10:00',
      celebration: document.getElementById('programCelebration')?.value || '',
      liturgicalTime: document.getElementById('programLiturgicalTime')?.value || 'tempocomum',
      presider: document.getElementById('programPresider')?.value || '',
      comments: document.getElementById('programComments')?.value || '',
      parts: {},
      createdAt: AppState.currentProgram.createdAt || new Date().toISOString()
    };

    // Coletar dados de cada parte
    PROGRAM_PARTS.forEach(part => {
      // Implementar coleta de dados das partes
      data.parts[part.id] = AppState.currentProgram.parts?.[part.id] || {};
    });

    return data;
  }

  function saveProgram() {
    const program = getCurrentProgramData();

    // Validar
    if (!program.date || !program.celebration) {
      showToast('Por favor, preencha a data e a celebração', 'warning');
      return;
    }

    // Adicionar ao histórico
    const existingIndex = AppState.history.findIndex(p => p.id === program.id);
    if (existingIndex >= 0) {
      AppState.history[existingIndex] = program;
    } else {
      AppState.history.push(program);
    }

    // Guardar
    AppState.currentProgram = program;
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROGRAM, JSON.stringify(program));
    saveData();

    showToast('Programa guardado com sucesso!', 'success');
  }

  function autoSaveProgram() {
    const program = getCurrentProgramData();
    AppState.currentProgram = program;
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROGRAM, JSON.stringify(program));
  }

  function clearProgram() {
    if (!confirm('Tem a certeza que deseja limpar o programa atual?')) {
      return;
    }

    AppState.currentProgram = {};
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROGRAM);
    
    // Limpar formulário
    document.getElementById('programDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('programTime').value = '10:00';
    document.getElementById('programCelebration').value = '';
    document.getElementById('programPresider').value = '';
    document.getElementById('programComments').value = '';

    // Rerender partes
    renderProgramParts();

    showToast('Programa limpo', 'info');
  }

  function populateProgramForm(program) {
    if (!program) return;

    const fields = {
      programDate: program.date,
      programTime: program.time,
      programCelebration: program.celebration,
      programLiturgicalTime: program.liturgicalTime,
      programPresider: program.presider,
      programComments: program.comments
    };

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element && value) {
        element.value = value;
      }
    });

    updateLiturgicalTheme();
  }

  // ===== Utilitários =====
  function showToast(message, type = 'info', duration = TOAST_CONFIG.duration) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'ti-check',
      error: 'ti-x',
      warning: 'ti-alert-triangle',
      info: 'ti-info-circle'
    };

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="ti ${icons[type] || icons.info}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="ti ti-x"></i>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-PT', DATE_FORMAT.options);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function handleKeyboardShortcuts(event) {
    // Ctrl + S: Guardar
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      saveProgram();
    }
    
    // Ctrl + P: Imprimir
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      switchTab('preview');
      setTimeout(() => window.print(), 100);
    }
    
    // Esc: Fechar modais
    if (event.key === 'Escape') {
      closeAllModals();
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.remove();
    });
  }

  // ===== Funções Globais (para uso em HTML) =====
  window.selectSongForPart = function(partId) {
    console.log('Selecionando cântico para', partId);
    showToast('Funcionalidade em desenvolvimento', 'info');
  };

  window.togglePart = function(partId) {
    const part = document.querySelector(`[data-part-id="${partId}"]`);
    if (part) {
      part.classList.toggle('expanded');
    }
  };

  window.toggleFavorite = function(songId) {
    const song = AppState.songs.find(s => s.id === songId);
    if (song) {
      song.favorite = !song.favorite;
      saveData();
      renderCatalog();
      showToast(
        song.favorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos',
        'success'
      );
    }
  };

  window.editSong = function(songId) {
    console.log('Editando cântico', songId);
    showToast('Funcionalidade em desenvolvimento', 'info');
  };

  window.deleteSong = function(songId) {
    if (!confirm('Tem a certeza que deseja eliminar este cântico?')) {
      return;
    }

    AppState.songs = AppState.songs.filter(s => s.id !== songId);
    saveData();
    renderCatalog();
    showToast('Cântico eliminado', 'success');
  };

  window.loadProgramFromHistory = function(programId) {
    const program = AppState.history.find(p => p.id === programId);
    if (program) {
      AppState.currentProgram = { ...program, id: generateId() };
      populateProgramForm(AppState.currentProgram);
      switchTab('programa');
      showToast('Programa carregado', 'success');
    }
  };

  window.viewProgram = function(programId) {
    console.log('Visualizando programa', programId);
    showToast('Funcionalidade em desenvolvimento', 'info');
  };

  // ===== Iniciar quando o DOM estiver pronto =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
