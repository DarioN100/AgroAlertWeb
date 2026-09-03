# AgroAlert — Web de telemetría + Asistente IA

Dashboard web del sistema AgroAlert. Muestra los datos del sensor en vivo
(desde ThingSpeak), análisis predictivo, gráfico de temperatura, y el
**Agrónomo Digital**: un asistente con IA cuyo flujo de datos se visualiza
paso a paso en tiempo real.

## Novedades de esta versión
- Sección "Agrónomo Digital" con panel de pasos que se encienden en vivo:
  pregunta → lee sensores → arma contexto → procesa con IA (Gemini) → respuesta.
- Conectado a la Cloud Function real `askAssistant`.
- Preguntas sugeridas con un clic.

## Cómo correrla localmente
Abrí `index.html` en el navegador. (Para evitar problemas de CORS al leer
ThingSpeak, conviene servirla con un servidor simple en vez de doble clic:)

    python -m http.server 8000

Y entrás a http://localhost:8000

## Cómo subirla a un hosting gratuito
Tres opciones, todas gratis y sin tarjeta:

### Opción A — Netlify Drop (la más fácil)
1. Entrá a https://app.netlify.com/drop
2. Arrastrá la carpeta `agroalert_web_v2` completa a la página.
3. Listo: te da una URL pública al instante.

### Opción B — GitHub Pages
1. Subí la carpeta a un repositorio de GitHub.
2. Settings → Pages → Branch: main → carpeta /root.
3. Te queda en https://TU-USUARIO.github.io/TU-REPO

### Opción C — Vercel
1. https://vercel.com → New Project → importás el repo.
2. Deploy. Te da la URL.

## Configuración
Editá `js/config.js`:
- `thingspeak.channelId` y `thingspeak.readApiKey`: tu canal.
- `cloudFunctions.askAssistant`: la URL de tu Cloud Function del asistente.

## Estructura
- `index.html` — página principal
- `css/` — estilos (theme, main, animations, **assistant**)
- `js/` — lógica (config, thingspeak, predictor, chart, ui, demo, **assistant**, app)
