/* Detalle de producto (producto.html?id=FRI-001).
   Eventos: view_item, add_to_cart. */
(function () {
  "use strict";

  var cont = document.getElementById("detalle");
  var id = new URLSearchParams(window.location.search).get("id");
  var p = window.PRODUCTOS_POR_ID[id];

  if (!p) {
    cont.innerHTML =
      '<div class="vacio"><h1>No encontramos ese producto</h1>' +
      '<p>El enlace no corresponde a ningún producto del catálogo.</p>' +
      '<a class="boton" href="index.html">Volver al catálogo</a></div>';
    return;
  }

  cont.innerHTML =
    '<div class="detalle-grid">' +
      '<div class="detalle-visual">' + Comun.svgProducto(p, "ilustracion-grande") + '</div>' +
      '<div class="detalle-info">' +
        '<nav class="migas" aria-label="Ruta"><a href="index.html">Catálogo</a> / ' + Comun.esc(p.categoria) + '</nav>' +
        '<h1>' + Comun.esc(p.nombre) + '</h1>' +
        '<p class="codigo">Código ' + p.id + '</p>' +
        '<p class="precio precio-grande">' + Comun.cop(p.precio) + '</p>' +
        '<p class="descripcion">' + Comun.esc(p.descripcion) + '</p>' +
        '<div class="cantidad-fila">' +
          '<label for="cantidad">Cantidad</label>' +
          '<div class="selector">' +
            '<button type="button" id="menos" aria-label="Disminuir cantidad">−</button>' +
            '<input id="cantidad" type="number" min="1" max="10" value="1" inputmode="numeric">' +
            '<button type="button" id="mas" aria-label="Aumentar cantidad">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="acciones">' +
          '<button type="button" id="agregar" class="boton">Agregar al carrito</button>' +
          '<a class="boton boton-secundario" href="carrito.html">Ir al carrito</a>' +
        '</div>' +
        '<p id="mensaje" class="mensaje" role="status"></p>' +
      '</div>' +
    '</div>';

  var input = document.getElementById("cantidad");
  function cantidad() {
    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 10) n = 10;
    input.value = n;
    return n;
  }
  document.getElementById("menos").addEventListener("click", function () { input.value = Math.max(1, cantidad() - 1); });
  document.getElementById("mas").addEventListener("click", function () { input.value = Math.min(10, cantidad() + 1); });
  input.addEventListener("change", cantidad);

  /* ---------- view_item: al abrir el detalle ---------- */
  var itemsVista = Carrito.itemsGA([{ producto: p, cantidad: 1 }], { cupon: false });
  Analitica.enviarEvento("view_item", {
    currency: "COP",
    value: Carrito.valorItems(itemsVista),
    items: itemsVista
  });

  /* ---------- add_to_cart ---------- */
  document.getElementById("agregar").addEventListener("click", function () {
    var agregadas = Carrito.agregar(p.id, cantidad());
    var msg = document.getElementById("mensaje");
    if (!agregadas) {
      msg.textContent = "Ya tienes el máximo de " + Carrito.MAX_UNIDADES + " unidades de este producto en el carrito.";
      return;
    }
    var items = Carrito.itemsGA([{ producto: p, cantidad: agregadas }]);
    Analitica.enviarEvento("add_to_cart", {
      currency: "COP",
      value: Carrito.valorItems(items),
      items: items
    });
    msg.textContent = "Agregaste " + agregadas + (agregadas === 1 ? " unidad" : " unidades") + " al carrito.";
    Comun.aviso("Producto agregado al carrito");
  });
})();
