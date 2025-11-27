// ===== Constantes da Aplicação =====

// Partes do Programa Litúrgico
const PROGRAM_PARTS = [
  { id: 'entrada', label: 'Entrada', icon: 'ti-door-enter' },
  { id: 'atoPenitencial', label: 'Ato Penitencial', icon: 'ti-pray' },
  { id: 'gloria', label: 'Glória', icon: 'ti-sparkles' },
  { id: 'salmo', label: 'Salmo Responsorial', icon: 'ti-book' },
  { id: 'aclamacao', label: 'Aclamação ao Evangelho', icon: 'ti-quote' },
  { id: 'ofertorio', label: 'Ofertório', icon: 'ti-gift' },
  { id: 'santo', label: 'Santo', icon: 'ti-stars' },
  { id: 'paiNosso', label: 'Pai Nosso', icon: 'ti-hands' },
  { id: 'paz', label: 'Paz', icon: 'ti-peace' },
  { id: 'cordeiro', label: 'Cordeiro de Deus', icon: 'ti-heartbeat' },
  { id: 'comunhao', label: 'Comunhão', icon: 'ti-bread' },
  { id: 'acaoGracas', label: 'Ação de Graças', icon: 'ti-heart' },
  { id: 'final', label: 'Final', icon: 'ti-door-exit' }
];

// Tempos Litúrgicos
const LITURGICAL_TIMES = {
  tempocomum: {
    label: 'Tempo Comum',
    color: '#16a34a',
    className: 'liturgic-tempocomum'
  },
  advento: {
    label: 'Advento',
    color: '#7c3aed',
    className: 'liturgic-advento'
  },
  natal: {
    label: 'Natal',
    color: '#eab308',
    className: 'liturgic-natal'
  },
  quaresma: {
    label: 'Quaresma',
    color: '#7c2d12',
    className: 'liturgic-quaresma'
  },
  pascoa: {
    label: 'Páscoa',
    color: '#fafafa',
    className: 'liturgic-pascoa'
  }
};

// Chaves do LocalStorage
const STORAGE_KEYS = {
  SONGS: 'coroSJB_songs_v2',
  HISTORY: 'coroSJB_history_v2',
  SONG_USAGE: 'coroSJB_songUsage_v2',
  REHEARSALS: 'coroSJB_rehearsals_v2',
  SETTINGS: 'coroSJB_settings_v2',
  CURRENT_PROGRAM: 'coroSJB_currentProgram_v2'
};

// Configurações padrão
const DEFAULT_SETTINGS = {
  darkMode: false,
  autoSave: true,
  showSuggestions: true,
  liturgicalTime: 'tempocomum',
  defaultPresider: '',
  notifications: true
};

// Sugestões de celebrações comuns
const CELEBRATION_SUGGESTIONS = [
  'Domingo da Palavra de Deus',
  'Domingo de Ramos',
  'Quinta-feira Santa',
  'Sexta-feira Santa',
  'Vigília Pascal',
  'Domingo de Páscoa',
  'Ascensão do Senhor',
  'Pentecostes',
  'Santíssima Trindade',
  'Corpo de Deus',
  'Sagrado Coração de Jesus',
  'Imaculada Conceição',
  'Natal do Senhor',
  'Santa Família',
  'Epifania do Senhor',
  'Batismo do Senhor',
  'Apresentação do Senhor',
  'Anunciação do Senhor',
  'Assunção de Nossa Senhora',
  'Exaltação da Santa Cruz',
  'Todos os Santos',
  'Fiéis Defuntos',
  'Dedicação da Basílica de Latrão',
  'Cristo Rei'
];

// Sugestões de presidentes comuns
const PRESIDER_SUGGESTIONS = [
  'Pe. José Silva',
  'Pe. António Ferreira',
  'Pe. João Santos',
  'D. Manuel Oliveira'
];

// Temas litúrgicos para sugestões
const LITURGICAL_THEMES = {
  advento: ['Esperança', 'Vigília', 'Preparação', 'Profecia', 'Maria', 'João Batista'],
  natal: ['Nascimento', 'Luz', 'Alegria', 'Encarnação', 'Glória', 'Paz'],
  quaresma: ['Conversão', 'Penitência', 'Jejum', 'Oração', 'Deserto', 'Cruz'],
  pascoa: ['Ressurreição', 'Vida Nova', 'Aleluia', 'Vitória', 'Esperança', 'Pentecostes'],
  tempocomum: ['Missão', 'Palavra', 'Comunidade', 'Caridade', 'Fé', 'Esperança']
};

// Configurações de exportação
const EXPORT_CONFIG = {
  pdf: {
    format: 'a4',
    orientation: 'portrait',
    unit: 'mm',
    compress: true
  },
  excel: {
    sheetName: 'Programa Litúrgico',
    creator: 'Coro Paroquial São João Batista'
  }
};

// Mensagens do sistema
const MESSAGES = {
  success: {
    programSaved: 'Programa guardado com sucesso!',
    songAdded: 'Cântico adicionado ao catálogo!',
    songUpdated: 'Cântico atualizado com sucesso!',
    songDeleted: 'Cântico removido do catálogo.',
    programLoaded: 'Programa carregado do histórico.',
    exported: 'Ficheiro exportado com sucesso!'
  },
  error: {
    requiredFields: 'Por favor, preencha todos os campos obrigatórios.',
    saveFailed: 'Erro ao guardar. Tente novamente.',
    loadFailed: 'Erro ao carregar dados.',
    exportFailed: 'Erro ao exportar ficheiro.',
    notFound: 'Item não encontrado.',
    invalidData: 'Dados inválidos.'
  },
  warning: {
    unsavedChanges: 'Tem alterações não guardadas. Deseja continuar?',
    deleteConfirm: 'Tem a certeza que deseja eliminar este item?',
    clearConfirm: 'Isto irá limpar todos os dados. Continuar?'
  },
  info: {
    noResults: 'Nenhum resultado encontrado.',
    loading: 'A carregar...',
    empty: 'Ainda não há dados para mostrar.'
  }
};

// Validação de dados
const VALIDATION = {
  songTitle: {
    minLength: 2,
    maxLength: 200,
    required: true
  },
  songAuthor: {
    minLength: 2,
    maxLength: 100,
    required: false
  },
  programDate: {
    required: true
  },
  programCelebration: {
    minLength: 3,
    maxLength: 200,
    required: true
  }
};

// Formatação de datas
const DATE_FORMAT = {
  locale: 'pt-PT',
  options: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  shortOptions: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
};

// Configuração de toast notifications
const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-right',
  maxVisible: 3
};

// Debounce delay para pesquisas
const DEBOUNCE_DELAY = 300;

// Número máximo de itens por página
const ITEMS_PER_PAGE = 20;

// Exportar todas as constantes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PROGRAM_PARTS,
    LITURGICAL_TIMES,
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    CELEBRATION_SUGGESTIONS,
    PRESIDER_SUGGESTIONS,
    LITURGICAL_THEMES,
    EXPORT_CONFIG,
    MESSAGES,
    VALIDATION,
    DATE_FORMAT,
    TOAST_CONFIG,
    DEBOUNCE_DELAY,
    ITEMS_PER_PAGE
  };
}
