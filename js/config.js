/* ============================================
   CONFIG - Configuración general de AgroAlert
   ============================================ */

const CONFIG = {
  // ===== THINGSPEAK =====
  // CAMBIAR ESTOS VALORES POR LOS DE TU CANAL
  thingspeak: {
    channelId: '3392007',
    readApiKey: 'XPTIS5C0ASRNVJOW', // <-- pegá tu Read API Key acá
  },

  // ===== CLOUD FUNCTIONS (Firebase) =====
  cloudFunctions: {
    askAssistant: 'https://us-central1-lili-james-b6e2f.cloudfunctions.net/askAssistant',
  },

  // ===== TIEMPOS =====
  refresh: {
    intervalMs: 30000,
    chartHistoryCount: 240,
    predictionCount: 20,
  },

  // ===== PREDICTOR =====
  predictor: {
    minSamples: 10,
    slopeThresholdPerMin: 0.05,
    reliableRSquared: 0.3,
  },

  // ===== DEMO MODE =====
  demo: {
    enabled: false,
    durationMin: 8,
    initialTemp: 22.0,
    finalTemp: -1.0,
    tickIntervalMs: 2000,
  },
};

// ===== CATÁLOGO DE CULTIVOS =====
const CROPS = {
  olivos: {
    key: 'olivos',
    emoji: '🫒',
    name: 'Olivos',
    warning: 4,
    critical: 2,
    description: 'Resistentes. Variedad Arauco en La Rioja.'
  },
  vid: {
    key: 'vid',
    emoji: '🍇',
    name: 'Vid',
    warning: 2,
    critical: 0,
    description: 'Malbec, Bonarda, Torrontés.'
  },
  nogal: {
    key: 'nogal',
    emoji: '🌰',
    name: 'Nogal',
    warning: 1,
    critical: -1,
    description: 'Muy resistente. Variedad Chandler.'
  },
  carozo: {
    key: 'carozo',
    emoji: '🍑',
    name: 'Frutales de carozo',
    warning: 5,
    critical: 3,
    description: 'Durazno, ciruelo, damasco.'
  },
  pepita: {
    key: 'pepita',
    emoji: '🍎',
    name: 'Frutales de pepita',
    warning: 4,
    critical: 2,
    description: 'Manzana, pera.'
  },
  hortalizas: {
    key: 'hortalizas',
    emoji: '🍅',
    name: 'Hortalizas',
    warning: 7,
    critical: 5,
    description: 'Tomate, pimiento. Los más sensibles al frío.'
  },
  citricos: {
    key: 'citricos',
    emoji: '🍊',
    name: 'Cítricos',
    warning: 6,
    critical: 4,
    description: 'Naranja, limón, mandarina.'
  },
  general: {
    key: 'general',
    emoji: '🌾',
    name: 'General',
    warning: 4,
    critical: 2,
    description: 'Umbrales conservadores.'
  },
};

const STATE = {
  currentCrop: 'olivos',
  isDemoMode: false,
  demoData: null,
  lastFeeds: [],
};
