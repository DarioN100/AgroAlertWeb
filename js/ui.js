/* ============================================
   UI - Actualización de la interfaz
   ============================================ */

const UI = {

  /**
   * Actualiza el reloj cada segundo.
   */
  updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const date = now.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    }).toUpperCase().replace('.', '');

    const clockEl = document.getElementById('clock');
    if (clockEl) {
      clockEl.innerHTML = `
        <span>${date}</span>
        <span class="clock-sep">·</span>
        <span>${time}</span>
      `;
    }
  },

  /**
   * Actualiza información del cultivo.
   */
  updateCropDisplay(cropKey) {
    const crop = CROPS[cropKey];
    if (!crop) return;

    document.getElementById('crop-emoji').textContent = crop.emoji;
    document.getElementById('crop-name').textContent = crop.name;

    document.getElementById('threshold-warning').textContent = `${crop.warning}°C`;
    document.getElementById('threshold-critical').textContent = `${crop.critical}°C`;

    const selector = document.getElementById('crop-selector');
    if (selector.value !== cropKey) {
      selector.value = cropKey;
    }
  },

  /**
   * Anima cambio de valor numérico.
   */
  animateValueChange(elementId, newValue, decimals = 1) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const oldText = el.textContent.replace(/[^\d.-]/g, '');
    const oldValue = parseFloat(oldText) || 0;
    const targetValue = parseFloat(newValue);

    if (isNaN(targetValue)) {
      el.textContent = '—';
      return;
    }

    if (Math.abs(targetValue - oldValue) < 0.05) {
      el.textContent = targetValue.toFixed(decimals);
      return;
    }

    const duration = 500;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = oldValue + (targetValue - oldValue) * eased;
      el.textContent = currentValue.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetValue.toFixed(decimals);
      }
    };

    requestAnimationFrame(update);
  },

  /**
   * Actualiza el valor principal de temperatura (hero) y las métricas secundarias.
   */
  updateReadings(reading) {
    if (reading.tempAire !== null) {
      this.animateValueChange('hero-value', reading.tempAire, 1);
    }
    if (reading.humAire !== null) {
      this.animateValueChange('metric-humidity', reading.humAire, 0);
    }
    if (reading.humSuelo !== null) {
      this.animateValueChange('metric-soil', reading.humSuelo, 0);
    }
    if (reading.puntoRocio !== null) {
      this.animateValueChange('metric-dew', reading.puntoRocio, 1);
    }
    if (reading.dewDifference !== null) {
      document.getElementById('metric-dew-diff').textContent =
        `Δ ${reading.dewDifference.toFixed(1)}°C respecto al aire`;
    }
  },

  /**
   * Actualiza el banner de estado.
   */
  updateStatusBanner(risk, reading, crop) {
    const banner = document.getElementById('status-banner');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title');
    const desc = document.getElementById('status-desc');

    // Limpiar clases previas
    banner.classList.remove('is-ok', 'is-attention', 'is-alert', 'is-critical');

    const config = {
      ok: {
        cls: 'is-ok',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        title: 'Sistema operativo · Sin alertas',
        desc: `Condiciones normales para ${crop.name.toLowerCase()}.`,
      },
      attention: {
        cls: 'is-attention',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M3.4 16.6 7.5 8.4c2.1-4.2 8.9-4.2 11 0l4.1 8.2c2 4 -.9 8.8 -5.5 8.8H8.9c-4.6 0 -7.5 -4.8 -5.5 -8.8z"/></svg>',
        title: 'Atención · Monitoreo activo',
        desc: `Temperatura cerca del umbral de ${crop.warning}°C. Monitorear de cerca.`,
      },
      alert: {
        cls: 'is-alert',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
        title: 'Alerta · Acción recomendada',
        desc: `Riesgo elevado para ${crop.name.toLowerCase()}.`,
      },
      critical: {
        cls: 'is-critical',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        title: 'Crítico · Helada inminente',
        desc: `Temperatura ${reading.tempAire?.toFixed(1)}°C — Por debajo del umbral crítico (${crop.critical}°C).`,
      },
    };

    const cfg = config[risk];
    banner.classList.add(cfg.cls);
    icon.innerHTML = cfg.iconSvg;
    title.textContent = cfg.title;
    desc.textContent = cfg.desc;
  },

  /**
   * Actualiza la sección hero con tendencia.
   */
  updateHeroTrend(prediction, crop) {
    const trendIconEl = document.getElementById('hero-trend-icon');
    const trendValueEl = document.getElementById('hero-trend-value');
    const trendLabelEl = document.getElementById('hero-trend-label');

    if (!prediction || !prediction.isReliable) {
      trendIconEl.className = 'trend-icon';
      trendIconEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      trendValueEl.className = 'trend-value';
      trendValueEl.textContent = 'Calculando…';
      trendLabelEl.textContent = `${prediction ? prediction.samples : 0} / ${CONFIG.predictor.minSamples}`;
      return;
    }

    if (prediction.trend === 'falling') {
      const isUrgent = prediction.minutesToCritical !== null && prediction.minutesToCritical < 30;
      trendIconEl.className = isUrgent ? 'trend-icon urgent' : 'trend-icon down';
      trendIconEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>';
      trendValueEl.className = isUrgent ? 'trend-value urgent' : 'trend-value down';
      trendValueEl.textContent = Predictor.formatSlope(prediction.slope);
      trendLabelEl.textContent = 'Bajando';
    } else if (prediction.trend === 'rising') {
      trendIconEl.className = 'trend-icon up';
      trendIconEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
      trendValueEl.className = 'trend-value up';
      trendValueEl.textContent = Predictor.formatSlope(prediction.slope);
      trendLabelEl.textContent = 'Subiendo';
    } else {
      trendIconEl.className = 'trend-icon';
      trendIconEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      trendValueEl.className = 'trend-value';
      trendValueEl.textContent = 'Estable';
      trendLabelEl.textContent = 'Sin cambios';
    }
  },

  /**
   * Actualiza las cards de predicción.
   */
  updatePredictionCards(prediction, crop) {
    // Card 1: estado de tendencia
    const card1 = document.getElementById('prediction-card-trend');
    const card1Value = document.getElementById('prediction-trend-value');
    const card1Suffix = document.getElementById('prediction-trend-suffix');
    const card1Desc = document.getElementById('prediction-trend-desc');

    // Card 2: tiempos hasta umbrales
    const card2 = document.getElementById('prediction-card-time');
    const card2Warning = document.getElementById('prediction-time-warning');
    const card2Critical = document.getElementById('prediction-time-critical');

    card1.classList.remove('is-warning', 'is-urgent');
    card2.classList.remove('is-warning', 'is-urgent');

    if (!prediction || prediction.samples < CONFIG.predictor.minSamples) {
      const samples = prediction ? prediction.samples : 0;
      card1Value.textContent = '—';
      card1Suffix.textContent = '';
      card1Desc.textContent = `Recopilando datos: ${samples} / ${CONFIG.predictor.minSamples} lecturas.`;
      card2Warning.textContent = '—';
      card2Critical.textContent = '—';
      return;
    }

    if (!prediction.isReliable) {
      card1Value.textContent = '?';
      card1Suffix.textContent = '';
      card1Desc.textContent = 'Datos inconsistentes, esperando lecturas más estables.';
      card2Warning.textContent = '—';
      card2Critical.textContent = '—';
      return;
    }

    if (prediction.trend === 'falling') {
      const isUrgent = prediction.minutesToCritical !== null && prediction.minutesToCritical < 30;
      const cls = isUrgent ? 'is-urgent' : 'is-warning';
      card1.classList.add(cls);
      card2.classList.add(cls);

      const absSlope = Math.abs(prediction.slope);
      card1Value.textContent = absSlope.toFixed(2);
      card1Suffix.textContent = '°C/min';
      card1Desc.textContent = isUrgent
        ? 'Bajada acelerada. Actuá ahora — quedan pocos minutos para llegar al umbral crítico.'
        : 'Temperatura descendiendo. La regresión lineal proyecta cruce de umbrales.';

      card2Warning.textContent = prediction.minutesToWarning !== null
        ? Predictor.formatMinutes(prediction.minutesToWarning)
        : '—';
      card2Critical.textContent = prediction.minutesToCritical !== null
        ? Predictor.formatMinutes(prediction.minutesToCritical)
        : '—';

    } else if (prediction.trend === 'rising') {
      const absSlope = Math.abs(prediction.slope);
      card1Value.textContent = `+${absSlope.toFixed(2)}`;
      card1Suffix.textContent = '°C/min';
      card1Desc.textContent = 'Temperatura ascendiendo. No hay riesgo a corto plazo.';
      card2Warning.textContent = '—';
      card2Critical.textContent = '—';
    } else {
      card1Value.textContent = '≈ 0';
      card1Suffix.textContent = '°C/min';
      card1Desc.textContent = 'Tendencia estable. Sin riesgo de helada según la pendiente actual.';
      card2Warning.textContent = '—';
      card2Critical.textContent = '—';
    }
  },

  /**
   * Actualiza las stats del chart header.
   */
  updateChartStats(readings, prediction) {
    const stats = ChartManager.getStats(readings);
    const minEl = document.getElementById('chart-stat-min');
    const maxEl = document.getElementById('chart-stat-max');
    const trendEl = document.getElementById('chart-stat-trend');

    if (minEl) minEl.textContent = `${stats.min.toFixed(1)}°C`;
    if (maxEl) maxEl.textContent = `${stats.max.toFixed(1)}°C`;

    if (trendEl && prediction && prediction.isReliable) {
      if (prediction.trend === 'falling') {
        trendEl.textContent = `↓ ${Predictor.formatSlope(prediction.slope)}`;
        trendEl.className = 'chart-stat-value down';
      } else if (prediction.trend === 'rising') {
        trendEl.textContent = `↑ ${Predictor.formatSlope(prediction.slope)}`;
        trendEl.className = 'chart-stat-value up';
      } else {
        trendEl.textContent = '— estable';
        trendEl.className = 'chart-stat-value';
      }
    } else if (trendEl) {
      trendEl.textContent = '—';
      trendEl.className = 'chart-stat-value';
    }
  },

  /**
   * Actualiza el timestamp de última actualización.
   */
  updateLastUpdate(reading) {
    const el = document.getElementById('last-update');
    if (!el) return;

    if (STATE.isDemoMode) {
      el.textContent = 'modo demo';
      return;
    }

    if (!reading.timestamp) {
      el.textContent = '—';
      return;
    }

    const time = reading.timestamp.toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    el.textContent = time;
  },

  hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 500);
    }
  },

  showError(message) {
    const banner = document.getElementById('error-banner');
    if (banner) {
      banner.textContent = message;
      banner.classList.add('is-visible');
      setTimeout(() => banner.classList.remove('is-visible'), 5000);
    }
  },
};
