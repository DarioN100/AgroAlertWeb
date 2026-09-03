/* ============================================
   THINGSPEAK - Fetch de datos del sensor
   ============================================ */

const ThingSpeak = {
  /**
   * Obtiene la última lectura del canal.
   */
  async fetchLatest() {
    const url = `https://api.thingspeak.com/channels/${CONFIG.thingspeak.channelId}/feeds/last.json?api_key=${CONFIG.thingspeak.readApiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ThingSpeak error: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Obtiene el historial de N lecturas.
   */
  async fetchHistory(count = 240) {
    const url = `https://api.thingspeak.com/channels/${CONFIG.thingspeak.channelId}/feeds.json?api_key=${CONFIG.thingspeak.readApiKey}&results=${count}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ThingSpeak error: ${response.status}`);
    }

    const data = await response.json();
    return data.feeds || [];
  },

  /**
   * Parsea una lectura de ThingSpeak a un objeto más limpio.
   */
  parseReading(feed) {
    const temp = parseFloat(feed.field1);
    const hum = parseFloat(feed.field2);
    const soil = parseFloat(feed.field3);
    const dewSensor = parseFloat(feed.field4);
    const alertState = parseInt(feed.field5);
    const battery = parseFloat(feed.field6);

    // Calcular punto de rocío si no viene
    const dew = isNaN(dewSensor) ? this.calculateDewPoint(temp, hum) : dewSensor;

    return {
      timestamp: new Date(feed.created_at),
      tempAire: isNaN(temp) ? null : temp,
      humAire: isNaN(hum) ? null : hum,
      humSuelo: isNaN(soil) ? null : soil,
      puntoRocio: isNaN(dew) ? null : dew,
      dewDifference: !isNaN(temp) && !isNaN(dew) ? temp - dew : null,
      alertState: isNaN(alertState) ? 0 : alertState,
      battery: isNaN(battery) ? null : battery,
      entryId: feed.entry_id,
    };
  },

  /**
   * Fórmula de Magnus para calcular punto de rocío.
   */
  calculateDewPoint(temp, hum) {
    if (isNaN(temp) || isNaN(hum)) return NaN;
    const a = 17.27;
    const b = 237.7;
    const h = hum <= 0 ? 0.1 : hum;
    const alpha = (a * temp) / (b + temp) + Math.log(h / 100);
    return (b * alpha) / (a - alpha);
  },
};
