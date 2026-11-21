/* Monitor de eventos: ayuda didáctica del laboratorio.
   Panel fijo a la derecha (abajo en pantallas pequeñas) que muestra el estado
   de la conexión con GA4, el origen de la visita (UTM) y los últimos 12 eventos.
   Los eventos se guardan en sessionStorage para que persistan entre páginas. */
(function () {
  "use strict";

  var K_EVENTOS = "frisby_eventos";
  var K_ORIGEN = "frisby_origen";
  var K_OCULTO = "frisby_monitor_oculto";
  var K_TIPO = "frisby_tipo_cliente";
  var MAX = 12;

  var fmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  function cop(n) { return typeof n === "number" ? fmt.format(n).replace(/\u00a0/g, " ") : ""; }

  function leer(almacen, clave, defecto) {
    try { var v = almacen.getItem(clave); return v ? JSON.parse(v) : defecto; } catch (e) { return defecto; }
  }
  function escribir(almacen, clave, valor) {
    try { almacen.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function unidades(items) {
    return (items || []).reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
  }
  function nombres(items) {
    if (!items || !items.length) return "";
    return items[0].item_name + (items.length > 1 ? " y " + (items.length - 1) + " más" : "");
  }

  /* Resumen legible de cada evento */
  function resumen(n, p) {
    p = p || {};
    var it = p.items || [];
    var cupon = p.coupon ? " · cupón " + p.coupon : "";
    switch (n) {
      case "page_view":
        return "Página: " + (p.page_title || p.page_path || "");
      case "view_item_list":
        return (p.item_list_name || "Lista") + " · " + it.length + " productos";
      case "view_promotion":
      case "select_promotion":
        return (p.promotion_name || p.promotion_id) + " · espacio " + (p.creative_slot || "—");
      case "select_item":
        return nombres(it) + " · desde " + (p.item_list_name || "lista");
      case "view_item":
        return nombres(it) + " · " + cop(p.value);
      case "add_to_cart":
      case "remove_from_cart":
        return unidades(it) + " × " + nombres(it) + " · " + cop(p.value);
      case "view_cart":
      case "begin_checkout":
        return unidades(it) + " unidades · " + cop(p.value) + cupon;
      case "add_shipping_info":
        return p.shipping_tier + " · " + cop(p.value) + cupon;
      case "add_payment_info":
        return p.payment_type + " · " + cop(p.value) + cupon;
      case "purchase":
        return "Pedido " + p.transaction_id + " · productos " + cop(p.value) + " + envío " + cop(p.shipping) +
          " · " + p.tipo_cliente + cupon;
      default:
        return p.value !== undefined ? cop(p.value) : "";
    }
  }

  function registrar(nombre, parametros) {
    var params;
    try { params = JSON.parse(JSON.stringify(parametros || {})); } catch (e) { params = {}; }
    var lista = leer(sessionStorage, K_EVENTOS, []);
    lista.unshift({
      h: new Date().toLocaleTimeString("es-CO", { hour12: false }),
      n: nombre,
      r: resumen(nombre, params),
      p: params
    });
    escribir(sessionStorage, K_EVENTOS, lista.slice(0, MAX));
    pintarEventos();
  }

  /* ---------- Origen de la visita (UTM de la primera página de la sesión) ---------- */
  function origen() {
    var o = leer(sessionStorage, K_ORIGEN, null);
    if (!o) {
      var q = new URLSearchParams(window.location.search);
      var s = q.get("utm_source"), m = q.get("utm_medium"), c = q.get("utm_campaign");
      o = (s || m || c) ? { s: s, m: m, c: c } : { directo: true };
      escribir(sessionStorage, K_ORIGEN, o);
    }
    if (o.directo) return "directo (sin UTM)";
    return (o.s || "(sin source)") + " / " + (o.m || "(sin medium)") + " · " + (o.c || "(sin campaña)");
  }

  /* ---------- Simular nuevo visitante ---------- */
  function borrarCookiesGA() {
    var host = window.location.hostname;
    var partes = host.split(".");
    var dominios = [null, host, "." + host];
    for (var i = 1; i < partes.length - 1; i++) {
      var sub = partes.slice(i).join(".");
      dominios.push(sub, "." + sub);
    }
    var caminos = ["/", window.location.pathname.replace(/[^\/]*$/, "") || "/"];
    document.cookie.split(";").forEach(function (c) {
      var nombre = c.split("=")[0].trim();
      if (nombre.indexOf("_ga") !== 0) return;
      dominios.forEach(function (d) {
        caminos.forEach(function (ruta) {
          document.cookie = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=" + ruta +
            (d ? "; domain=" + d : "");
        });
      });
    });
  }

  function simularNuevoVisitante() {
    borrarCookiesGA();
    try {
      localStorage.removeItem("frisby_carrito");
      localStorage.removeItem("frisby_cupon");
    } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    window.location.href = "index.html";
  }

  /* ---------- Interfaz ---------- */
  var panel, botonAbrir;

  function aplicarOculto(oculto) {
    document.documentElement.classList.toggle("monitor-oculto", oculto);
    try { localStorage.setItem(K_OCULTO, oculto ? "1" : "0"); } catch (e) {}
    var b = document.getElementById("mon-alternar");
    if (b) {
      b.textContent = "Ocultar";
      b.setAttribute("aria-expanded", oculto ? "false" : "true");
    }
    if (botonAbrir) botonAbrir.hidden = !oculto;
    if (panel) panel.hidden = oculto;
  }

  function pintarEstado() {
    var el = document.getElementById("mon-estado");
    if (!el) return;
    var A = window.Analitica || {};
    if (A.activo) {
      el.className = "mon-estado mon-ok";
      el.textContent = "Conectado a " + A.id + (A.depuracion ? " · modo depuración" : " · sin modo depuración");
    } else {
      el.className = "mon-estado mon-error";
      el.textContent = "Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.";
    }
  }

  function pintarTipo() {
    var el = document.getElementById("mon-tipo");
    if (!el) return;
    var t = null;
    try { t = sessionStorage.getItem(K_TIPO); } catch (e) {}
    el.textContent = t ? t : "aún sin definir (se asigna al confirmar el envío)";
  }

  function pintarEventos() {
    var ul = document.getElementById("mon-eventos");
    if (!ul) return;
    var lista = leer(sessionStorage, K_EVENTOS, []).slice(0, MAX);
    if (!lista.length) {
      ul.innerHTML = '<li class="mon-vacio">Aún no hay eventos en esta sesión.</li>';
    } else {
      ul.innerHTML = lista.map(function (e) {
        var cls = "mon-ev" + (e.n === "purchase" ? " mon-ev-compra" : "") + (e.n === "page_view" ? " mon-ev-pv" : "");
        return '<li class="' + cls + '"><details><summary>' +
          '<span class="mon-hora">' + esc(e.h) + '</span> ' +
          '<span class="mon-nombre">' + esc(e.n) + '</span>' +
          '<span class="mon-resumen">' + esc(e.r) + '</span>' +
          '</summary><pre>' + esc(JSON.stringify(e.p, null, 1)) + '</pre></details></li>';
      }).join("");
    }
    pintarTipo();
  }

  function construir() {
    panel = document.createElement("aside");
    panel.id = "monitor";
    panel.setAttribute("aria-label", "Monitor de eventos de Google Analytics 4");
    panel.innerHTML =
      '<div class="mon-cabecera">' +
        '<strong>Monitor de eventos GA4</strong>' +
        '<button type="button" id="mon-alternar" class="mon-boton" aria-expanded="true">Ocultar</button>' +
      '</div>' +
      '<div class="mon-cuerpo">' +
        '<p id="mon-estado" class="mon-estado"></p>' +
        '<div class="mon-bloque"><span class="mon-etiqueta">Origen de la visita</span>' +
          '<span id="mon-origen" class="mon-valor"></span></div>' +
        '<div class="mon-bloque"><span class="mon-etiqueta">Propiedad de usuario tipo_cliente</span>' +
          '<span id="mon-tipo" class="mon-valor"></span></div>' +
        '<div class="mon-bloque"><span class="mon-etiqueta">Últimos 12 eventos (toca uno para ver sus parámetros)</span></div>' +
        '<ul id="mon-eventos" class="mon-eventos"></ul>' +
      '</div>' +
      '<div class="mon-pie">' +
        '<button type="button" id="mon-reiniciar" class="mon-boton mon-boton-ancho">Simular nuevo visitante</button>' +
      '</div>';
    document.body.appendChild(panel);

    botonAbrir = document.createElement("button");
    botonAbrir.type = "button";
    botonAbrir.id = "monitor-abrir";
    botonAbrir.textContent = "Mostrar monitor";
    botonAbrir.hidden = true;
    document.body.appendChild(botonAbrir);

    document.getElementById("mon-alternar").addEventListener("click", function () { aplicarOculto(true); });
    botonAbrir.addEventListener("click", function () { aplicarOculto(false); });
    document.getElementById("mon-reiniciar").addEventListener("click", simularNuevoVisitante);

    document.getElementById("mon-origen").textContent = origen();
    pintarEstado();
    pintarEventos();

    var oculto = false;
    try { oculto = localStorage.getItem(K_OCULTO) === "1"; } catch (e) {}
    aplicarOculto(oculto);
  }

  window.Monitor = { registrar: registrar, simularNuevoVisitante: simularNuevoVisitante };

  construir();
  // page_view de esta página (GA4 lo envía solo al configurar; aquí lo mostramos).
  registrar("page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
})();
