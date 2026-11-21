/* Carrito. Eventos: view_cart, add_to_cart (botón +), remove_from_cart (botón − y Quitar). */
(function () {
  "use strict";

  var cont = document.getElementById("carrito-contenido");

  function filaHTML(l, conCupon) {
    var p = l.producto;
    var desc = conCupon ? Math.round(p.precio * Carrito.PORCENTAJE) : 0;
    var unit = p.precio - desc;
    return '<li class="linea">' +
      '<a class="linea-visual" href="producto.html?id=' + p.id + '">' + Comun.svgProducto(p, "ilustracion") + '</a>' +
      '<div class="linea-info">' +
        '<a class="linea-nombre" href="producto.html?id=' + p.id + '">' + Comun.esc(p.nombre) + '</a>' +
        '<span class="categoria">' + Comun.esc(p.categoria) + '</span>' +
        '<span class="linea-precio">' +
          (conCupon ? '<s>' + Comun.cop(p.precio) + '</s> ' : '') + Comun.cop(unit) + ' c/u' +
        '</span>' +
      '</div>' +
      '<div class="selector selector-linea">' +
        '<button type="button" data-accion="menos" data-id="' + p.id + '" aria-label="Disminuir cantidad de ' + Comun.esc(p.nombre) + '">−</button>' +
        '<span class="selector-valor" aria-live="polite">' + l.cantidad + '</span>' +
        '<button type="button" data-accion="mas" data-id="' + p.id + '" aria-label="Aumentar cantidad de ' + Comun.esc(p.nombre) + '">+</button>' +
      '</div>' +
      '<div class="linea-total">' + Comun.cop(unit * l.cantidad) + '</div>' +
      '<button type="button" class="enlace-boton" data-accion="quitar" data-id="' + p.id + '">Quitar</button>' +
    '</li>';
  }

  function cuponHTML(mensaje, ok) {
    var activo = Carrito.cuponActivo();
    return '<div class="cupon-caja">' +
      '<h2>Cupón de descuento</h2>' +
      (activo
        ? '<p class="cupon-activo">Cupón <strong>' + Carrito.CODIGO_CUPON + '</strong> aplicado: 10 % de descuento en tus productos. ' +
          '<button type="button" class="enlace-boton" data-accion="quitar-cupon">Quitar cupón</button></p>'
        : '<div class="cupon-fila">' +
            '<label for="codigo-cupon" class="visualmente-oculto">Código de cupón</label>' +
            '<input id="codigo-cupon" type="text" placeholder="Escribe BIENVENIDA10" autocomplete="off" maxlength="20">' +
            '<button type="button" class="boton boton-secundario" data-accion="aplicar-cupon">Aplicar cupón</button>' +
          '</div>') +
      '<p id="mensaje-cupon" class="mensaje ' + (ok === false ? 'mensaje-error' : '') + '" role="status">' + (mensaje ? Comun.esc(mensaje) : '') + '</p>' +
    '</div>';
  }

  function dibujar(mensajeCupon, okCupon, enfocar) {
    var r = Carrito.resumen();
    Comun.actualizarContador();

    if (!r.lineas.length) {
      cont.innerHTML =
        '<div class="vacio"><h2>Tu carrito está vacío</h2>' +
        '<p>' + (r.cupon ? 'Tu cupón ' + Carrito.CODIGO_CUPON + ' ya está aplicado y se descontará cuando agregues productos.' : 'Agrega productos del catálogo para empezar.') + '</p>' +
        '<a class="boton" href="index.html">Ver el catálogo</a></div>';
      return;
    }

    cont.innerHTML =
      '<div class="carrito-grid">' +
        '<div>' +
          '<ul class="lineas">' + r.lineas.map(function (l) { return filaHTML(l, r.cupon); }).join("") + '</ul>' +
          cuponHTML(mensajeCupon, okCupon) +
        '</div>' +
        '<aside class="resumen" aria-label="Resumen del pedido">' +
          '<h2>Resumen</h2>' +
          '<dl>' +
            '<div><dt>Productos (' + r.unidades + ')</dt><dd>' + Comun.cop(r.subtotalLista) + '</dd></div>' +
            (r.cupon ? '<div class="descuento"><dt>Cupón ' + Carrito.CODIGO_CUPON + '</dt><dd>− ' + Comun.cop(r.descuento) + '</dd></div>' : '') +
            '<div class="total"><dt>Total productos</dt><dd>' + Comun.cop(r.productos) + '</dd></div>' +
          '</dl>' +
          '<p class="nota">El envío se calcula en el siguiente paso según tu país y servicio.</p>' +
          '<a class="boton boton-ancho" href="checkout.html">Ir a pagar</a>' +
          '<a class="enlace-centro" href="index.html">Seguir comprando</a>' +
        '</aside>' +
      '</div>';

    if (enfocar) {
      var el = cont.querySelector(enfocar);
      if (el) el.focus();
    }
  }

  function paramsMovimiento(producto, unidades) {
    var items = Carrito.itemsGA([{ producto: producto, cantidad: unidades }]);
    return { currency: "COP", value: Carrito.valorItems(items), items: items };
  }

  cont.addEventListener("click", function (e) {
    var b = e.target.closest("[data-accion]");
    if (!b) return;
    var accion = b.dataset.accion, id = b.dataset.id;
    var producto = id ? window.PRODUCTOS_POR_ID[id] : null;

    if (accion === "mas") {
      var n = Carrito.agregar(id, 1);
      if (n) Analitica.enviarEvento("add_to_cart", paramsMovimiento(producto, n));
      else Comun.aviso("Máximo " + Carrito.MAX_UNIDADES + " unidades por producto");
      dibujar(null, null, '[data-accion="mas"][data-id="' + id + '"]');
    } else if (accion === "menos") {
      var q = Carrito.restar(id, 1);
      if (q) Analitica.enviarEvento("remove_from_cart", paramsMovimiento(producto, q));
      dibujar(null, null, '[data-accion="menos"][data-id="' + id + '"]');
    } else if (accion === "quitar") {
      var u = Carrito.quitar(id);
      if (u) Analitica.enviarEvento("remove_from_cart", paramsMovimiento(producto, u));
      dibujar();
    } else if (accion === "aplicar-cupon") {
      var campo = document.getElementById("codigo-cupon");
      var res = Carrito.aplicarCupon(campo ? campo.value : "");
      dibujar(res.ok ? null : res.mensaje, res.ok, res.ok ? "[data-accion=quitar-cupon]" : "#codigo-cupon");
    } else if (accion === "quitar-cupon") {
      Carrito.quitarCupon();
      dibujar("Cupón quitado.", true, "#codigo-cupon");
    }
  });

  cont.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.id === "codigo-cupon") {
      e.preventDefault();
      var res = Carrito.aplicarCupon(e.target.value);
      dibujar(res.ok ? null : res.mensaje, res.ok, res.ok ? "[data-accion=quitar-cupon]" : "#codigo-cupon");
    }
  });

  dibujar();

  /* ---------- view_cart: al abrir el carrito con productos ---------- */
  var ls = Carrito.lineas();
  if (ls.length) {
    var items = Carrito.itemsGA(ls);
    var params = { currency: "COP", value: Carrito.valorItems(items), items: items };
    if (Carrito.cuponActivo()) params.coupon = Carrito.CODIGO_CUPON;
    Analitica.enviarEvento("view_cart", params);
  }
})();
