/* ============================================
   PREDICTOR - Análisis de tendencia (regresión lineal)
   ============================================ */

const Predictor = {
  /**
   * Calcula la predicción de helada a partir del historial de lecturas.
   *
   * @param {Array} readings - Lecturas parseadas (más viejas primero)
   * @param {number} warningThreshold - Umbral de atención (°C)
   * @param {number} criticalThreshold - Umbral crítico (°C)
   * @returns {Object|null} Predicción o null si no hay datos
   */
  calculate(readings, warningThreshold, criticalThreshold) {
    const recent = readings
      .slice(-CONFIG.refresh.predictionCount)
      .filter(r => r.tempAire !== null && r.tempAire !== undefined);

    if (recent.length < 2) {
      return {
        trend: 'unknown',
        samples: recent.length,
        currentTemp: recent.length > 0 ? recent[recent.length - 1].tempAire : null,
        slope: 0,
        rSquared: 0,
        minutesToWarning: null,
        minutesToCritical: null,
        isReliable: false,
      };
    }

    // Convertir a puntos (x = minutos desde el primero, y = temperatura)
    const firstTime = recent[0].timestamp.getTime();
    const points = recent.map(r => ({
      x: (r.timestamp.getTime() - firstTime) / 60000, // minutos
      y: r.tempAire,
    }));

    const { slope, intercept, rSquared } = this.linearRegression(points);
    const lastX = points[points.length - 1].x;
    const currentTemp = points[points.length - 1].y;

    // Determinar tendencia
    let trend = 'stable';
    if (slope < -CONFIG.predictor.slopeThresholdPerMin) {
      trend = 'falling';
    } else if (slope > CONFIG.predictor.slopeThresholdPerMin) {
      trend = 'rising';
    }

    // Calcular tiempos hasta umbrales (solo si baja)
    let minutesToWarning = null;
    let minutesToCritical = null;

    if (trend === 'falling') {
      if (currentTemp > warningThreshold) {
        const xAt = (warningThreshold - intercept) / slope;
        const mins = Math.round(xAt - lastX);
        if (mins > 0 && mins < 600) minutesToWarning = mins;
      }
      if (currentTemp > criticalThreshold) {
        const xAt = (criticalThreshold - intercept) / slope;
        const mins = Math.round(xAt - lastX);
        if (mins > 0 && mins < 600) minutesToCritical = mins;
      }
    }

    const isReliable =
      recent.length >= CONFIG.predictor.minSamples &&
      rSquared > CONFIG.predictor.reliableRSquared;

    return {
      trend,
      samples: recent.length,
      currentTemp,
      slope,
      rSquared,
      minutesToWarning,
      minutesToCritical,
      isReliable,
    };
  },

  /**
   * Regresión lineal simple: y = m*x + b
   */
  linearRegression(points) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

    const xMean = points.reduce((s, p) => s + p.x, 0) / n;
    const yMean = points.reduce((s, p) => s + p.y, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (const p of points) {
      const dx = p.x - xMean;
      const dy = p.y - yMean;
      numerator += dx * dy;
      denominator += dx * dx;
    }

    if (denominator === 0) {
      return { slope: 0, intercept: yMean, rSquared: 0 };
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // R²
    let ssRes = 0;
    let ssTot = 0;
    for (const p of points) {
      const predicted = slope * p.x + intercept;
      ssRes += Math.pow(p.y - predicted, 2);
      ssTot += Math.pow(p.y - yMean, 2);
    }
    const rSquared = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

    return { slope, intercept, rSquared };
  },

  /**
   * Calcula el nivel de riesgo según los umbrales del cultivo.
   * @returns {string} 'ok' | 'attention' | 'alert' | 'critical'
   */
  calculateRiskLevel(reading, warningThreshold, criticalThreshold) {
    if (reading.tempAire === null || reading.tempAire === undefined) return 'ok';

    if (reading.tempAire <= criticalThreshold) return 'critical';

    if (reading.tempAire <= warningThreshold) {
      const soilDry = reading.humSuelo !== null && reading.humSuelo < 30;
      const dewClose = reading.dewDifference !== null && reading.dewDifference < 2;
      if (soilDry || dewClose) return 'alert';
      return 'attention';
    }

    return 'ok';
  },

  /**
   * Formato amigable para minutos.
   */
  formatMinutes(minutes) {
    if (minutes === null || minutes === undefined) return '—';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  },

  /**
   * Formato amigable para velocidad.
   */
  formatSlope(slopePerMin) {
    const abs = Math.abs(slopePerMin);
    if (abs >= 0.5) {
      return `${abs.toFixed(1)}°C/min`;
    }
    return `${(abs * 60).toFixed(1)}°C/h`;
  },
};
