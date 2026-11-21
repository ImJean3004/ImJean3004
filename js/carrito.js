/* Carrito de compras guardado en localStorage, cupón y tarifas de envío.
   Solo se guardan ids de producto y cantidades: ningún dato personal. */
(function () {
  "use strict";

  var CLAVE_CARRITO = "frisby_carrito";
  var CLAVE_CUPON = "frisby_cupon";
  var CODIGO_CUPON = "BIENVENIDA10";
  var PORCENTAJE = 0.10;
  var UMBRAL_ENVIO_GRATIS = 150000; // Nacional Estándar gratis desde este valor en productos
  var MAX_UNIDADES = 20;

  var PAISES = ["Colombia", "México", "Perú", "Chile", "Argentina", "Ecuador", "España", "Estados Unidos"];

  var TARIFAS = {
    "Nacional": { "Estándar": 12000, "Express": 25000 },
    "Internacional": { "Estándar": 95000, "Express": 160000 }
  };

  var PLAZOS = {
    "Nacional": { "Estándar": "3 a 5 días hábiles", "Express": "1 a 2 días hábiles" },
    "Internacional": { "Estándar": "8 a 12 días hábiles", "Express": "3 a 5 días hábiles" }
  };

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
      if (!Array.isArray(d)) return [];
      return d.filter(function (l) {
        return l && window.PRODUCTOS_POR_ID[l.id] && l.cantidad > 0;
      });
    } catch (e) { return []; }
  }

  function guardar(arr) {
    try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(arr)); } catch (e) {}
    window.dispatchEvent(new Event("carrito:cambio"));
  }

  /* [{ producto, cantidad }] */
  function lineas() {
    return leer().map(function (l) {
      return { producto: window.PRODUCTOS_POR_ID[l.id], cantidad: l.cantidad };
    });
  }

  function cantidadTotal() {
    return leer().reduce(function (s, l) { return s + l.cantidad; }, 0);
  }

  /* Devuelve cuántas unidades se agregaron realmente. */
  function agregar(id, n) {
    if (!window.PRODUCTOS_POR_ID[id]) return 0;
    var arr = leer();
    var linea = arr.filter(function (l) { return l.id === id; })[0];
    var actual = linea ? linea.cantidad : 0;
    var nuevas = Math.max(0, Math.min(n || 1, MAX_UNIDADES - actual));
    if (nuevas === 0) return 0;
    if (linea) linea.cantidad += nuevas; else arr.push({ id: id, cantidad: nuevas });
    guardar(arr);
    return nuevas;
  }

  /* Resta unidades; devuelve cuántas se quitaron. */
  function restar(id, n) {
    var arr = leer();
    var linea = arr.filter(function (l) { return l.id === id; })[0];
    if (!linea) return 0;
    var quitar = Math.min(n || 1, linea.cantidad);
    linea.cantidad -= quitar;
    guardar(arr.filter(function (l) { return l.cantidad > 0; }));
    return quitar;
  }

  /* Quita la línea completa; devuelve las unidades que tenía. */
  function quitar(id) {
    var linea = leer().filter(function (l) { return l.id === id; })[0];
    return linea ? restar(id, linea.cantidad) : 0;
  }

  function vaciar() { guardar([]); }

  function cuponActivo() {
    try { return localStorage.getItem(CLAVE_CUPON) === CODIGO_CUPON; } catch (e) { return false; }
  }

  function aplicarCupon(texto) {
    var codigo = String(texto || "").trim().toUpperCase();
    if (codigo === CODIGO_CUPON) {
      try { localStorage.setItem(CLAVE_CUPON, CODIGO_CUPON); } catch (e) {}
      window.dispatchEvent(new Event("carrito:cambio"));
      return { ok: true, mensaje: "Cupón " + CODIGO_CUPON + " aplicado: 10 % de descuento en tus productos." };
    }
    return { ok: false, mensaje: codigo ? "Ese cupón no es válido. Prueba con " + CODIGO_CUPON + "." : "Escribe un código de cupón." };
  }

  function quitarCupon() {
    try { localStorage.removeItem(CLAVE_CUPON); } catch (e) {}
    window.dispatchEvent(new Event("carrito:cambio"));
  }

  /* Convierte [{producto, cantidad}] en items de GA4.
     Con cupón: price = precio unitario con descuento, discount = descuento por unidad y coupon. */
  function itemsGA(lineasX, opciones) {
    var opc = opciones || {};
    var conCupon = opc.cupon === undefined ? cuponActivo() : !!opc.cupon;
    return lineasX.map(function (l, i) {
      var p = l.producto;
      var d = conCupon ? Math.round(p.precio * PORCENTAJE) : 0;
      var item = {
        item_id: p.id,
        item_name: p.nombre,
        item_brand: window.MARCA,
        item_category: p.categoria,
        price: p.precio - d,
        quantity: l.cantidad,
        index: i
      };
      if (conCupon) { item.discount = d; item.coupon = CODIGO_CUPON; }
      return item;
    });
  }

  function lineasDe(productos, cantidad) {
    return productos.map(function (p) { return { producto: p, cantidad: cantidad || 1 }; });
  }

  /* value = suma de price × quantity de los items */
  function valorItems(items) {
    return items.reduce(function (s, it) { return s + it.price * it.quantity; }, 0);
  }

  function resumen() {
    var ls = lineas();
    var conCupon = cuponActivo();
    var lista = 0, desc = 0, unidades = 0;
    ls.forEach(function (l) {
      lista += l.producto.precio * l.cantidad;
      if (conCupon) desc += Math.round(l.producto.precio * PORCENTAJE) * l.cantidad;
      unidades += l.cantidad;
    });
    return { lineas: ls, unidades: unidades, subtotalLista: lista, descuento: desc, productos: lista - desc, cupon: conCupon };
  }

  /* Tarifa de envío según país y servicio. valorProductos = productos ya con descuento. */
  function envio(pais, servicio, valorProductos) {
    var tipo = pais === "Colombia" ? "Nacional" : "Internacional";
    var costo = TARIFAS[tipo][servicio];
    var gratis = false;
    if (tipo === "Nacional" && servicio === "Estándar" && valorProductos >= UMBRAL_ENVIO_GRATIS) {
      costo = 0; gratis = true;
    }
    return { tipo: tipo, servicio: servicio, tier: tipo + " - " + servicio, costo: costo, gratis: gratis, plazo: PLAZOS[tipo][servicio] };
  }

  window.Carrito = {
    CODIGO_CUPON: CODIGO_CUPON,
    PORCENTAJE: PORCENTAJE,
    UMBRAL_ENVIO_GRATIS: UMBRAL_ENVIO_GRATIS,
    MAX_UNIDADES: MAX_UNIDADES,
    PAISES: PAISES,
    TARIFAS: TARIFAS,
    lineas: lineas,
    cantidadTotal: cantidadTotal,
    agregar: agregar,
    restar: restar,
    quitar: quitar,
    vaciar: vaciar,
    cuponActivo: cuponActivo,
    aplicarCupon: aplicarCupon,
    quitarCupon: quitarCupon,
    itemsGA: itemsGA,
    lineasDe: lineasDe,
    valorItems: valorItems,
    resumen: resumen,
    envio: envio
  };
})();
