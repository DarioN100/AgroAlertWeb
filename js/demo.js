/* ============================================
   DEMO MODE - Simulación de bajada de temperatura
   ============================================ */

const DemoMode = {
  intervalId: null,
  startTime: null,
  startTemp: 22.0,
  endTemp: -1.0,
  duration: 8 * 60 * 1000,
  baseHumAire: 53,
  baseHumSuelo: 15,

  start() {
    if (STATE.isDemoMode) return;

    STATE.isDemoMode = true;
    this.startTime = Date.now();

    const btn = document.getElementById('demo-btn');
    if (btn) {
      btn.classList.add('is-active');
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Detener demo</span>
      `;
    }

    const indicator = document.getElementById('demo-indicator');
    if (indicator) {
      indicator.classList.add('is-active');
    }

    STATE.demoData = this.generateInitialHistory();

    this.intervalId = setInterval(() => this.tick(), CONFIG.demo.tickIntervalMs);
    this.tick();

    console.log('Modo DEMO activado');
  },

  stop() {
    if (!STATE.isDemoMode) return;

    STATE.isDemoMode = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    STATE.demoData = null;

    const btn = document.getElementById('demo-btn');
    if (btn) {
      btn.classList.remove('is-active');
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Modo demo</span>
      `;
    }

    const indicator = document.getElementById('demo-indicator');
    if (indicator) {
      indicator.classList.remove('is-active');
    }

    console.log('Modo DEMO desactivado');
    App.refresh();
  },

  toggle() {
    if (STATE.isDemoMode) {
      this.stop();
    } else {
      this.start();
    }
  },

  getCurrentTemp() {
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    return this.startTemp + (this.endTemp - this.startTemp) * eased;
  },

  generateInitialHistory() {
    const history = [];
    const now = Date.now();

    for (let i = 19; i >= 0; i--) {
      const secondsAgo = i * 30;
      const fakeTimestamp = new Date(now - secondsAgo * 1000);
      const tempOffset = i * 0.1;
      const temp = this.startTemp + tempOffset;

      history.push({
        timestamp: fakeTimestamp,
        tempAire: temp,
        humAire: this.baseHumAire + (Math.random() * 2 - 1),
        humSuelo: this.baseHumSuelo + (Math.random() * 1 - 0.5),
        puntoRocio: temp - 8,
        dewDifference: 8,
        alertState: 0,
        battery: 5.0,
        entryId: 1000 + i,
      });
    }

    return history;
  },

  getCurrentReading() {
    const currentTemp = this.getCurrentTemp();
    const dewPoint = currentTemp - 8 + (Math.random() * 0.5);

    return {
      timestamp: new Date(),
      tempAire: currentTemp,
      humAire: this.baseHumAire + (Math.random() * 2 - 1),
      humSuelo: this.baseHumSuelo,
      puntoRocio: dewPoint,
      dewDifference: currentTemp - dewPoint,
      alertState: 0,
      battery: 5.0,
      entryId: 9999,
    };
  },

  tick() {
    const currentReading = this.getCurrentReading();

    STATE.demoData.push(currentReading);
    if (STATE.demoData.length > 240) {
      STATE.demoData.shift();
    }

    App.renderData(STATE.demoData, currentReading);

    const elapsed = Date.now() - this.startTime;
    if (elapsed >= this.duration) {
      setTimeout(() => {
        if (STATE.isDemoMode) {
          this.stop();
        }
      }, 30000);
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },
};
