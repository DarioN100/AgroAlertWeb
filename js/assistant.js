/* ============================================
   ASSISTANT - Asistente IA con visualización
   del flujo de datos en tiempo real.

   Muestra cómo viaja la pregunta por el sistema:
   pregunta -> sensores -> pronóstico -> IA (Gemini) -> respuesta
   Cada etapa se "enciende" a medida que ocurre.
   ============================================ */

const Assistant = {
  pasos: ['enviada', 'sensores', 'prompt', 'ia', 'respuesta'],
  enProceso: false,

  /**
   * Reinicia todos los pasos al estado inactivo.
   */
  resetPasos() {
    this.pasos.forEach((p) => {
      const el = document.getElementById(`paso-${p}`);
      if (el) {
        el.classList.remove('is-active', 'is-done');
      }
    });
    const flujo = document.getElementById('ia-flujo');
    if (flujo) flujo.classList.remove('is-running');
  },

  /**
   * Marca un paso como activo (encendido ahora).
   */
  activarPaso(nombre) {
    const el = document.getElementById(`paso-${nombre}`);
    if (el) el.classList.add('is-active');
  },

  /**
   * Marca un paso como completado.
   */
  completarPaso(nombre) {
    const el = document.getElementById(`paso-${nombre}`);
    if (el) {
      el.classList.remove('is-active');
      el.classList.add('is-done');
    }
  },

  /**
   * Pequeña pausa para que la animación se vea (no es artificial:
   * da tiempo a leer cada etapa, y las etapas reales igual tardan).
   */
  esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Envía la pregunta al asistente y va activando los pasos.
   */
  async preguntar(pregunta) {
    if (this.enProceso) return;
    if (!pregunta || !pregunta.trim()) return;

    this.enProceso = true;
    this.resetPasos();

    const flujo = document.getElementById('ia-flujo');
    if (flujo) flujo.classList.add('is-running');

    const respuestaBox = document.getElementById('ia-respuesta');
    const enviarBtn = document.getElementById('ia-enviar');
    if (enviarBtn) enviarBtn.disabled = true;
    if (respuestaBox) {
      respuestaBox.classList.remove('is-visible');
      respuestaBox.textContent = '';
    }

    try {
      // PASO 1: Pregunta enviada
      this.activarPaso('enviada');
      await this.esperar(500);
      this.completarPaso('enviada');

      // PASO 2: Leyendo sensores en vivo (mostramos los datos reales)
      this.activarPaso('sensores');
      const datosSensor = this.obtenerDatosActuales();
      this.mostrarDatosSensorEnPaso(datosSensor);
      await this.esperar(700);
      this.completarPaso('sensores');

      // PASO 3: Armando el prompt (combina datos + cultivo + pregunta)
      this.activarPaso('prompt');
      await this.esperar(600);
      this.completarPaso('prompt');

      // PASO 4: Procesando con IA (Gemini) - acá ocurre la llamada real
      this.activarPaso('ia');
      const respuesta = await this.llamarAsistente(pregunta);
      this.completarPaso('ia');

      // PASO 5: Respuesta lista
      this.activarPaso('respuesta');
      await this.esperar(300);
      this.completarPaso('respuesta');

      // Mostrar la respuesta
      if (respuestaBox) {
        respuestaBox.textContent = respuesta;
        respuestaBox.classList.add('is-visible');
      }
    } catch (err) {
      console.error('Error en el asistente:', err);
      if (respuestaBox) {
        respuestaBox.textContent =
          '⚠️ No se pudo conectar con el asistente. Verificá la conexión e intentá de nuevo.';
        respuestaBox.classList.add('is-visible');
      }
      // Marcar el paso de IA como fallido visualmente
      const iaEl = document.getElementById('paso-ia');
      if (iaEl) iaEl.classList.remove('is-active');
    } finally {
      this.enProceso = false;
      if (enviarBtn) enviarBtn.disabled = false;
      if (flujo) flujo.classList.remove('is-running');
    }
  },

  /**
   * Toma los datos actuales que ya tiene la app (última lectura).
   */
  obtenerDatosActuales() {
    const feeds = STATE.lastFeeds;
    if (feeds && feeds.length > 0) {
      return feeds[feeds.length - 1];
    }
    return null;
  },

  /**
   * Muestra los datos del sensor dentro del paso "sensores".
   */
  mostrarDatosSensorEnPaso(datos) {
    const cont = document.getElementById('paso-sensores-datos');
    if (!cont) return;
    if (!datos) {
      cont.textContent = '';
      return;
    }
    const t = datos.tempAire != null ? `${datos.tempAire.toFixed(1)}°C` : '—';
    const h = datos.humAire != null ? `${datos.humAire.toFixed(0)}%` : '—';
    const s = datos.humSuelo != null ? `${datos.humSuelo.toFixed(0)}%` : '—';
    cont.textContent = `${t} · HR ${h} · suelo ${s}`;
  },

  /**
   * Llamada real a la Cloud Function askAssistant.
   */
  async llamarAsistente(pregunta) {
    const url = CONFIG.cloudFunctions.askAssistant;
    const crop = STATE.currentCrop || 'olivos';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: pregunta,
        cultivo: crop,
      }),
    });

    if (!response.ok) {
      throw new Error(`Asistente respondió ${response.status}`);
    }

    const data = await response.json();
    if (data.ok && data.respuesta) {
      return data.respuesta;
    }
    throw new Error(data.error || 'Respuesta inesperada del asistente');
  },

  /**
   * Conecta los eventos de la UI (botón y enter).
   */
  init() {
    const input = document.getElementById('ia-input');
    const enviarBtn = document.getElementById('ia-enviar');

    if (enviarBtn && input) {
      enviarBtn.addEventListener('click', () => {
        this.preguntar(input.value);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.preguntar(input.value);
        }
      });
    }

    // Botones de preguntas sugeridas
    document.querySelectorAll('.ia-sugerencia').forEach((btn) => {
      btn.addEventListener('click', () => {
        const texto = btn.textContent.trim();
        if (input) input.value = texto;
        this.preguntar(texto);
      });
    });
  },
};
