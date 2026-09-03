/* ============================================
   APP - Orquestación principal
   ============================================ */

const App = {
  refreshIntervalId: null,
  clockIntervalId: null,

  async init() {
    console.log('🌱 AgroAlert v2.0');

    UI.updateClock();
    this.clockIntervalId = setInterval(() => UI.updateClock(), 1000);

    this.setupEventListeners();

    UI.updateCropDisplay(STATE.currentCrop);

    // Inicializar el asistente IA (panel interactivo)
    if (typeof Assistant !== 'undefined') {
      Assistant.init();
    }

    try {
      await this.refresh();
      UI.hideLoading();
    } catch (err) {
      console.error('Error en la carga inicial:', err);
      UI.showError('No se pudieron cargar los datos. Verificá la conexión.');
      UI.hideLoading();
    }

    this.refreshIntervalId = setInterval(() => {
      if (!STATE.isDemoMode) {
        this.refresh();
      }
    }, CONFIG.refresh.intervalMs);
  },

  setupEventListeners() {
    const selector = document.getElementById('crop-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        STATE.currentCrop = e.target.value;
        UI.updateCropDisplay(STATE.currentCrop);
        if (STATE.isDemoMode) {
          App.renderData(STATE.demoData, STATE.demoData[STATE.demoData.length - 1]);
        } else {
          App.refresh();
        }
      });
    }

    const demoBtn = document.getElementById('demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => DemoMode.toggle());
    }

    // Tecla D para demo
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'd' || e.key === 'D') &&
          e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'SELECT') {
        DemoMode.toggle();
      }
    });
  },

  async refresh() {
    try {
      const [latestRaw, historyRaw] = await Promise.all([
        ThingSpeak.fetchLatest(),
        ThingSpeak.fetchHistory(CONFIG.refresh.chartHistoryCount),
      ]);

      const latest = ThingSpeak.parseReading(latestRaw);
      const history = historyRaw.map(f => ThingSpeak.parseReading(f));

      STATE.lastFeeds = history;
      this.renderData(history, latest);
    } catch (err) {
      console.error('Error al refrescar:', err);
      UI.showError('Error al conectar con ThingSpeak');
    }
  },

  renderData(history, latest) {
    const crop = CROPS[STATE.currentCrop];

    UI.updateReadings(latest);

    const risk = Predictor.calculateRiskLevel(latest, crop.warning, crop.critical);
    UI.updateStatusBanner(risk, latest, crop);

    const prediction = Predictor.calculate(history, crop.warning, crop.critical);
    UI.updateHeroTrend(prediction, crop);
    UI.updatePredictionCards(prediction, crop);
    UI.updateChartStats(history, prediction);

    ChartManager.render(history, crop.warning, crop.critical);

    UI.updateLastUpdate(latest);
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
