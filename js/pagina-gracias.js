/* Confirmación del pedido. Evento: purchase (una sola vez por pedido).
   El pedido se lee de sessionStorage; al enviar purchase se marca como enviado
   para que recargar la página no lo repita. */
(function () {
  "use strict";

  var cont = document.getElementById("gracias-contenido");
  var pedido = null;
  try { pedido = JSON.parse(sessionStorage.getItem("frisby_pedido") || "null"); } catch (e) {}

  if (!pedido || !pedido.params) {
    cont.innerHTML =
      '<div class="vacio"><h1>No hay un pedido reciente</h1>' +
      '<p>Cuando completes un pago simulado, aquí verás la confirmación de tu pedido.</p>' +
      '<a class="boton" href="index.html">Ir al catálogo</a></div>';
    return;
  }

  var p = pedido.params;
  var total = p.value + p.shipping;
  var yaEnviado = pedido.enviado === true;

  cont.innerHTML =
    '<div class="gracias">' +
      '<div class="sello-aura" aria-hidden="true">' +
        '<div class="sello" aria-hidden="true">✓</div>' +
        '<div class="sello-onda" aria-hidden="true"></div>' +
        '<div class="sello-onda sello-onda-2" aria-hidden="true"></div>' +
      '</div>' +
      '<h1>¡Gracias por tu compra simulada!</h1>' +
      '<p class="gracias-id">Pedido <strong>' + Comun.esc(p.transaction_id) + '</strong> · cliente ' + Comun.esc(p.tipo_cliente).toLowerCase() + '</p>' +
      '<div class="resumen resumen-gracias">' +
        '<h2>Resumen del pedido</h2>' +
        '<ul class="mini-lineas">' + p.items.map(function (it) {
          return '<li><span>' + it.quantity + ' × ' + Comun.esc(it.item_name) + '</span><span>' + Comun.cop(it.price * it.quantity) + '</span></li>';
        }).join("") + '</ul>' +
        '<dl>' +
          (p.coupon ? '<div class="descuento"><dt>Cupón</dt><dd>' + Comun.esc(p.coupon) + '</dd></div>' : '') +
          '<div><dt>Productos</dt><dd>' + Comun.cop(p.value) + '</dd></div>' +
          '<div><dt>Envío</dt><dd>' + (p.shipping === 0 ? 'Gratis' : Comun.cop(p.shipping)) + '</dd></div>' +
          '<div class="total"><dt>Total simulado</dt><dd>' + Comun.cop(total) + '</dd></div>' +
        '</dl>' +
      '</div>' +
      '<p id="nota-medicion" class="nota-medicion"></p>' +
      '<div class="acciones acciones-centro">' +
        '<a class="boton" href="index.html">Volver a la tienda</a>' +
      '</div>' +
    '</div>';

  var nota = document.getElementById("nota-medicion");

  if (yaEnviado) {
    nota.textContent = "Este pedido ya se midió: recargar la página no vuelve a enviar el evento purchase.";
    return;
  }

  // La propiedad de usuario se define antes de purchase.
  gtag("set", "user_properties", { tipo_cliente: p.tipo_cliente });
  try { sessionStorage.setItem("frisby_tipo_cliente", p.tipo_cliente); } catch (e) {}

  Analitica.enviarEvento("purchase", p);

  // Se marca como enviado después de purchase.
  pedido.enviado = true;
  try { sessionStorage.setItem("frisby_pedido", JSON.stringify(pedido)); } catch (e) {}
  nota.textContent = "Evento purchase enviado una vez para este pedido.";
})();
