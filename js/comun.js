/* Utilidades compartidas por todas las páginas:
   formato de pesos, ilustraciones SVG propias de los productos, contador del carrito y avisos. */
(function () {
  "use strict";

  var fmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  function cop(n) { return fmt.format(n); } // conserva el espacio de no separación ("$ 95.000" no se parte)

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Ilustraciones: bloques de color con figuras SVG ---------- */
  var DORADO = "#E69A0E", BORDE = "#8A4D00", BRILLO = "#FFE685", MIGA = "#B56B05", HUESO = "#FFFDF5", HUESO_B = "#CDB98A";

  function presa(x, y, rot, esc_) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (esc_ || 1) + ')">' +
      '<rect x="-5" y="20" width="10" height="30" rx="4" fill="' + HUESO + '" stroke="' + HUESO_B + '" stroke-width="1.5"/>' +
      '<circle cx="-5.5" cy="52" r="6.5" fill="' + HUESO + '" stroke="' + HUESO_B + '" stroke-width="1.5"/>' +
      '<circle cx="5.5" cy="52" r="6.5" fill="' + HUESO + '" stroke="' + HUESO_B + '" stroke-width="1.5"/>' +
      '<path d="M0-34C27-34 36-8 20 18C12 30-12 30-20 18C-36-8-27-34 0-34Z" fill="' + DORADO + '" stroke="' + BORDE + '" stroke-width="2"/>' +
      '<path d="M-10-24C-2-30 12-27 16-14" fill="none" stroke="' + BRILLO + '" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="-8" cy="-2" r="2" fill="' + MIGA + '"/><circle cx="8" cy="6" r="2.2" fill="' + MIGA + '"/>' +
      '<circle cx="-2" cy="14" r="1.8" fill="' + MIGA + '"/><circle cx="10" cy="-12" r="1.8" fill="' + MIGA + '"/>' +
      '</g>';
  }

  function tira(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<rect x="-13" y="-42" width="26" height="84" rx="13" fill="' + DORADO + '" stroke="' + BORDE + '" stroke-width="2"/>' +
      '<rect x="-7" y="-34" width="5" height="40" rx="2.5" fill="' + BRILLO + '"/>' +
      '<circle cx="5" cy="-10" r="2" fill="' + MIGA + '"/><circle cx="-3" cy="14" r="2" fill="' + MIGA + '"/>' +
      '<circle cx="6" cy="26" r="1.8" fill="' + MIGA + '"/>' +
      '</g>';
  }

  function nugget(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M-22 -4C-24 -18 -6 -22 8 -20C24 -18 28 -2 22 8C16 20 -4 22 -16 14C-22 10 -22 2 -22 -4Z" fill="' + DORADO + '" stroke="' + BORDE + '" stroke-width="2"/>' +
      '<path d="M-14 -10C-8 -15 2 -15 8 -12" fill="none" stroke="' + BRILLO + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="4" cy="4" r="1.8" fill="' + MIGA + '"/><circle cx="-8" cy="6" r="1.6" fill="' + MIGA + '"/>' +
      '</g>';
  }

  function alita(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<rect x="-46" y="-5" width="22" height="9" rx="4" fill="' + HUESO + '" stroke="' + HUESO_B + '" stroke-width="1.5"/>' +
      '<circle cx="-47" cy="-3" r="5.5" fill="' + HUESO + '" stroke="' + HUESO_B + '" stroke-width="1.5"/>' +
      '<circle cx="-47" cy="4" r="5.5" fill="' + HUESO + '" stroke="' + HUESO_B + '" stroke-width="1.5"/>' +
      '<path d="M-28 4C-28 -18 8 -26 30 -10C42 0 34 22 10 24C-8 26 -28 24 -28 4Z" fill="' + DORADO + '" stroke="' + BORDE + '" stroke-width="2"/>' +
      '<path d="M-14 -8C-2 -16 14 -14 22 -6" fill="none" stroke="' + BRILLO + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="2" cy="8" r="2" fill="' + MIGA + '"/><circle cx="16" cy="12" r="1.8" fill="' + MIGA + '"/><circle cx="-10" cy="12" r="1.8" fill="' + MIGA + '"/>' +
      '</g>';
  }

  function vasito(x, y, salsa) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<path d="M-17 -10H17L13 16Q12 20 8 20H-8Q-12 20 -13 16Z" fill="#FFFFFF" stroke="#CDB98A" stroke-width="2"/>' +
      '<ellipse cx="0" cy="-10" rx="17" ry="6" fill="' + salsa + '" stroke="#8A4D00" stroke-width="1.5"/>' +
      '</g>';
  }

  var FIGURAS = {
    presa: function () { return presa(100, 68, 20, 1.2); },
    duo: function () { return presa(70, 66, -18, 1.05) + presa(132, 66, 18, 1.05); },
    bandeja: function () {
      return '<ellipse cx="100" cy="104" rx="82" ry="24" fill="#FFFFFF" stroke="#8A4D00" stroke-width="2"/>' +
        '<ellipse cx="100" cy="104" rx="64" ry="16" fill="#FFF3C9"/>' +
        presa(48, 66, -28, 0.72) + presa(84, 58, -8, 0.72) + presa(118, 58, 8, 0.72) + presa(152, 66, 28, 0.72);
    },
    tiras: function () { return tira(58, 74, -30) + tira(88, 74, -10) + tira(118, 74, 10) + tira(148, 74, 30); },
    nuggets: function () {
      return nugget(54, 52, -10) + nugget(100, 46, 12) + nugget(148, 54, -6) +
        nugget(66, 96, 14) + nugget(112, 94, -12) + nugget(152, 100, 10);
    },
    alitas: function () { return alita(112, 50, -14) + alita(100, 100, 10); },
    cubeta: function () {
      return presa(72, 40, -22, 0.8) + presa(128, 40, 22, 0.8) + presa(100, 30, 0, 0.85) +
        '<polygon points="52,60 148,60 138,136 62,136" fill="#E31B23" stroke="#A80B11" stroke-width="2.5"/>' +
        '<polygon points="76,60 88,60 86,136 74,136" fill="#FFFFFF"/>' +
        '<polygon points="112,60 124,60 126,136 114,136" fill="#FFFFFF"/>' +
        '<rect x="46" y="54" width="108" height="12" rx="6" fill="#FFFFFF" stroke="#A80B11" stroke-width="2.5"/>';
    },
    salsa: function () {
      return vasito(62, 48, "#E31B23") + vasito(138, 48, "#F0A500") +
        vasito(62, 100, "#8A4D00") + vasito(138, 100, "#C4DA5A");
    }
  };

  function svgProducto(p, clase) {
    var fondo = p.fondo;
    var textoSigla = "#A80B11";
    return '<svg class="' + (clase || "ilustracion") + '" viewBox="0 0 200 150" role="img" aria-label="' + esc(p.nombre) +
      '" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="200" height="150" fill="' + fondo + '"/>' +
      (FIGURAS[p.figura] ? FIGURAS[p.figura]() : "") +
      '<rect x="8" y="121" width="54" height="21" rx="10.5" fill="#FFFFFF"/>' +
      '<text x="35" y="136" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="11.5" font-weight="900" fill="' + textoSigla + '">' + esc(p.sigla) + '</text>' +
      '</svg>';
  }

  /* ---------- Contador del carrito en la cabecera con animación ---------- */
  function actualizarContador() {
    var el = document.getElementById("contador-carrito");
    if (el && window.Carrito) {
      var n = String(window.Carrito.cantidadTotal());
      if (el.textContent !== n) {
        el.textContent = n;
        el.classList.remove("contador-animado");
        void el.offsetWidth;
        el.classList.add("contador-animado");
      }
    }
  }

  /* ---------- Aviso breve con micro-animación ---------- */
  var temporizador;
  function aviso(texto) {
    var t = document.getElementById("aviso");
    if (!t) {
      t = document.createElement("div");
      t.id = "aviso";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.innerHTML = '<span class="aviso-icono" aria-hidden="true">✓</span><span>' + esc(texto) + '</span>';
    t.classList.add("visible");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { t.classList.remove("visible"); }, 2800);
  }

  window.addEventListener("carrito:cambio", actualizarContador);
  window.addEventListener("storage", actualizarContador);
  actualizarContador();

  window.Comun = { cop: cop, esc: esc, svgProducto: svgProducto, actualizarContador: actualizarContador, aviso: aviso };
})();
