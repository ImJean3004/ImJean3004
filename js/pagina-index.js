/* Página de inicio: banner del cupón y catálogo.
   Eventos: view_promotion, select_promotion, view_item_list, select_item. */
(function () {
  "use strict";

  var LISTA = { item_list_id: "catalogo_principal", item_list_name: "Catálogo principal" };
  var PROMO = {
    promotion_id: "BIENVENIDA10",
    promotion_name: "Cupón de bienvenida 10 %",
    creative_name: "banner_bienvenida_10",
    creative_slot: "inicio_superior"
  };

  /* ---------- Catálogo ---------- */
  var cont = document.getElementById("catalogo");
  cont.innerHTML = window.PRODUCTOS.map(function (p, idx) {
    return '<a class="tarjeta-producto" href="producto.html?id=' + encodeURIComponent(p.id) + '" data-id="' + p.id + '" style="--orden:' + idx + '">' +
      Comun.svgProducto(p, "ilustracion") +
      '<div class="tarjeta-cuerpo">' +
        '<span class="categoria">' + Comun.esc(p.categoria) + '</span>' +
        '<h3>' + Comun.esc(p.nombre) + '</h3>' +
        '<div class="tarjeta-pie">' +
          '<span class="precio">' + Comun.cop(p.precio) + '</span>' +
          '<span class="tarjeta-cta" aria-hidden="true">Ver producto &rarr;</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }).join("");

  /* ---------- Banner del cupón ---------- */
  var banner = document.getElementById("banner-cupon");
  var itemsPromo = Carrito.itemsGA(
    Carrito.lineasDe([window.PRODUCTOS_POR_ID["FRI-003"], window.PRODUCTOS_POR_ID["FRI-007"]]),
    { cupon: false }
  );
  function paramsPromo() {
    return Object.assign({ currency: "COP" }, PROMO, { items: itemsPromo });
  }

  function textoBanner() {
    var cta = document.getElementById("banner-cta");
    if (Carrito.cuponActivo()) cta.textContent = "Cupón aplicado · Ver mi carrito";
  }
  textoBanner();

  banner.addEventListener("click", function () {
    Carrito.aplicarCupon(PROMO.promotion_id);
    Analitica.enviarYNavegar("select_promotion", paramsPromo(), "carrito.html");
  });

  Analitica.enviarEvento("view_promotion", paramsPromo());

  /* ---------- view_item_list: al cargar el catálogo ---------- */
  var itemsLista = Carrito.itemsGA(Carrito.lineasDe(window.PRODUCTOS), { cupon: false });
  Analitica.enviarEvento("view_item_list", Object.assign({ currency: "COP" }, LISTA, { items: itemsLista }));

  /* ---------- select_item: clic en un producto, antes de navegar ---------- */
  cont.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-id]");
    if (!a) return;
    var p = window.PRODUCTOS_POR_ID[a.dataset.id];
    var items = Carrito.itemsGA([{ producto: p, cantidad: 1 }], { cupon: false });
    items[0].index = window.PRODUCTOS.indexOf(p);
    var params = Object.assign({ currency: "COP" }, LISTA, { items: items });

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      Analitica.enviarEvento("select_item", params); // se abre en otra pestaña: no se intercepta
      return;
    }
    e.preventDefault();
    Analitica.enviarYNavegar("select_item", params, a.getAttribute("href"));
  });
})();
