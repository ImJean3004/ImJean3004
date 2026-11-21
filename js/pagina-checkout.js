/* Checkout en dos pasos (envío y pago simulado).
   Eventos: begin_checkout, add_shipping_info, add_payment_info.
   No se pide ni se guarda correo, teléfono, documento ni datos de tarjeta. */
(function () {
  "use strict";

  var vacio = document.getElementById("checkout-vacio");
  var app = document.getElementById("checkout");
  var r = Carrito.resumen();

  if (!r.lineas.length) {
    app.hidden = true;
    vacio.hidden = false;
    return;
  }

  var AFFILIATION = "Tienda Frisby (laboratorio GA4)";
  var estado = { paso: 1, pais: "", servicio: "Estándar", pago: "" };

  var selPais = document.getElementById("pais");
  var errorEnvio = document.getElementById("error-envio");
  var errorPago = document.getElementById("error-pago");

  /* ---------- Países ---------- */
  selPais.innerHTML = '<option value="">Selecciona un país</option>' +
    Carrito.PAISES.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join("");

  /* ---------- Parámetros comunes de los eventos del embudo ---------- */
  function paramsBase() {
    var items = Carrito.itemsGA(Carrito.lineas());
    var p = { currency: "COP", value: Carrito.valorItems(items) };
    if (Carrito.cuponActivo()) p.coupon = Carrito.CODIGO_CUPON;
    p.items = items;
    return p;
  }

  /* ---------- Resumen lateral y opciones de servicio ---------- */
  function envioActual() {
    if (!estado.pais) return null;
    return Carrito.envio(estado.pais, estado.servicio, Carrito.resumen().productos);
  }

  function pintarServicios() {
    var productos = Carrito.resumen().productos;
    ["Estándar", "Express"].forEach(function (srv) {
      var el = document.getElementById("precio-" + srv);
      if (!estado.pais) { el.textContent = "Elige un país para ver la tarifa"; return; }
      var e = Carrito.envio(estado.pais, srv, productos);
      el.textContent = (e.gratis ? "Gratis" : Comun.cop(e.costo)) + " · " + e.plazo;
    });
  }

  function pintarResumen() {
    var res = Carrito.resumen();
    var e = envioActual();
    var total = res.productos + (e ? e.costo : 0);
    document.getElementById("resumen-checkout").innerHTML =
      '<h2>Tu pedido</h2>' +
      '<ul class="mini-lineas">' + res.lineas.map(function (l) {
        return '<li><span>' + l.cantidad + ' × ' + Comun.esc(l.producto.nombre) + '</span><span>' +
          Comun.cop(l.producto.precio * l.cantidad) + '</span></li>';
      }).join("") + '</ul>' +
      '<dl>' +
        '<div><dt>Productos</dt><dd>' + Comun.cop(res.subtotalLista) + '</dd></div>' +
        (res.cupon ? '<div class="descuento"><dt>Cupón ' + Carrito.CODIGO_CUPON + '</dt><dd>− ' + Comun.cop(res.descuento) + '</dd></div>' : '') +
        '<div><dt>Envío' + (e ? ' (' + e.tier + ')' : '') + '</dt><dd>' +
          (e ? (e.gratis ? 'Gratis' : Comun.cop(e.costo)) : 'Se calcula con tu país') + '</dd></div>' +
        '<div class="total"><dt>Total a pagar</dt><dd>' + Comun.cop(total) + '</dd></div>' +
      '</dl>' +
      '<p class="nota">Envío nacional estándar gratis desde ' + Comun.cop(Carrito.UMBRAL_ENVIO_GRATIS) + ' en productos (con descuento aplicado).</p>';
  }

  function refrescar() { pintarServicios(); pintarResumen(); }

  selPais.addEventListener("change", function () { estado.pais = selPais.value; refrescar(); });
  document.querySelectorAll('input[name="servicio"]').forEach(function (rb) {
    rb.addEventListener("change", function () { estado.servicio = rb.value; refrescar(); });
  });

  /* ---------- Cambio de paso ---------- */
  function irAPaso(n) {
    estado.paso = n;
    document.getElementById("paso-1").hidden = n !== 1;
    document.getElementById("paso-2").hidden = n !== 2;
    document.getElementById("ind-1").classList.toggle("activo", n === 1);
    document.getElementById("ind-2").classList.toggle("activo", n === 2);
    document.getElementById("ind-1").classList.toggle("hecho", n === 2);
    var destino = document.getElementById(n === 1 ? "titulo-paso-1" : "titulo-paso-2");
    destino.focus();
    window.scrollTo({ top: 0 });
  }

  /* ---------- Paso 1: Continuar al pago → add_shipping_info ---------- */
  document.getElementById("continuar").addEventListener("click", function () {
    var nombre = document.getElementById("nombre").value.trim();
    if (!nombre) {
      errorEnvio.textContent = "Escribe un nombre ficticio para continuar (no uses tu nombre real).";
      errorEnvio.hidden = false;
      document.getElementById("nombre").focus();
      return;
    }
    if (!estado.pais) {
      errorEnvio.textContent = "Selecciona el país de destino.";
      errorEnvio.hidden = false;
      selPais.focus();
      return;
    }
    errorEnvio.hidden = true;

    var e = envioActual();
    gtag("set", "user_properties", { tipo_cliente: e.tipo });
    try { sessionStorage.setItem("frisby_tipo_cliente", e.tipo); } catch (x) {}

    var params = paramsBase();
    params.shipping_tier = e.tier;
    Analitica.enviarEvento("add_shipping_info", params);
    irAPaso(2);
  });

  document.getElementById("volver").addEventListener("click", function () { irAPaso(1); });

  /* ---------- Paso 2: Pagar (simulado) → add_payment_info → gracias.html ---------- */
  document.querySelectorAll('input[name="pago"]').forEach(function (rb) {
    rb.addEventListener("change", function () { estado.pago = rb.value; errorPago.hidden = true; });
  });

  function nuevoIdTransaccion() {
    var azar = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "FRS-" + Date.now().toString(36).toUpperCase() + "-" + azar;
  }

  var pagando = false;
  document.getElementById("pagar").addEventListener("click", function () {
    if (pagando) return;
    if (!estado.pago) {
      errorPago.textContent = "Elige un método de pago simulado.";
      errorPago.hidden = false;
      return;
    }
    var e = envioActual();
    if (!e) { irAPaso(1); return; }
    pagando = true;
    this.disabled = true;

    var base = paramsBase();

    // 1) Guardar el pedido (sin datos personales) y vaciar el carrito
    var pedido = {
      enviado: false,
      params: {
        transaction_id: nuevoIdTransaccion(),
        affiliation: AFFILIATION,
        currency: "COP",
        value: base.value,
        shipping: e.costo,
        tipo_cliente: e.tipo,
        items: base.items
      }
    };
    if (base.coupon) pedido.params.coupon = base.coupon;
    try { sessionStorage.setItem("frisby_pedido", JSON.stringify(pedido)); } catch (x) {}
    Carrito.vaciar();

    // 2) Enviar add_payment_info y navegar a gracias.html
    var pagoParams = { currency: "COP", value: base.value };
    if (base.coupon) pagoParams.coupon = base.coupon;
    pagoParams.payment_type = estado.pago;
    pagoParams.items = base.items;
    Analitica.enviarYNavegar("add_payment_info", pagoParams, "gracias.html");
  });

  /* ---------- begin_checkout: al abrir checkout.html ---------- */
  refrescar();
  Analitica.enviarEvento("begin_checkout", paramsBase());
})();
