/* Capa de medición con Google Analytics 4.
   - Solo carga gtag.js si el ID tiene formato G-... y no es el marcador.
   - Expone window.Analitica con dos funciones:
       enviarEvento(nombre, parametros)
       enviarYNavegar(nombre, parametros, url)
   - Cada evento también se registra en el monitor (js/monitor.js). */
(function () {
  "use strict";

  var cfg = window.TIENDA_CONFIG || {};
  var id = String(cfg.GA_MEASUREMENT_ID || "").trim();
  var activo = /^G-[A-Z0-9]+$/.test(id) && id !== "G-XXXXXXXXXX";

  window.dataLayer = window.dataLayer || [];
  // Sin ID válido, gtag no hace nada (y no se carga ninguna librería externa).
  window.gtag = activo
    ? function () { window.dataLayer.push(arguments); }
    : function () {};

  if (activo) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);

    window.gtag("js", new Date());
    if (cfg.DEBUG_MODE === true) {
      window.gtag("config", id, { debug_mode: true });
    } else {
      window.gtag("config", id);
    }
  }

  function registrarEnMonitor(nombre, parametros) {
    if (window.Monitor && typeof window.Monitor.registrar === "function") {
      window.Monitor.registrar(nombre, parametros);
    }
  }

  /* Envía un evento a GA4 (si hay ID válido) y lo muestra en el monitor. */
  function enviarEvento(nombre, parametros) {
    var p = parametros || {};
    registrarEnMonitor(nombre, p);
    if (activo) window.gtag("event", nombre, p);
  }

  /* Envía el evento y después navega a la URL indicada.
     Navega cuando GA4 confirma el envío (event_callback), cuando vence
     event_timeout (1000 ms) o, como respaldo, a los 1200 ms. Solo navega una vez. */
  function enviarYNavegar(nombre, parametros, url) {
    var p = parametros || {};
    registrarEnMonitor(nombre, p);

    var navegado = false;
    function ir() {
      if (navegado) return;
      navegado = true;
      window.location.href = url;
    }

    if (!activo) { ir(); return; }

    var conCallback = {};
    Object.keys(p).forEach(function (k) { conCallback[k] = p[k]; });
    conCallback.event_callback = ir;
    conCallback.event_timeout = 1000;

    window.gtag("event", nombre, conCallback);
    setTimeout(ir, 1200);
  }

  window.Analitica = {
    activo: activo,
    id: activo ? id : "",
    depuracion: cfg.DEBUG_MODE === true,
    enviarEvento: enviarEvento,
    enviarYNavegar: enviarYNavegar
  };
})();
