/* Catálogo de FRISBY S.A: ocho productos ficticios.
   Precios enteros en pesos colombianos (COP). Sin imágenes externas:
   cada producto se dibuja con un SVG propio (ver js/comun.js). */
window.MARCA = "Frisby";

window.PRODUCTOS = [
  {
    id: "FRI-001",
    nombre: "Presa Crocante Individual",
    categoria: "Presas",
    precio: 11900,
    descripcion: "Una presa de pollo con apanado dorado y crujiente. Viene congelada, lista para freír u hornear en minutos.",
    sigla: "PRE", figura: "presa", fondo: "#FFC20E"
  },
  {
    id: "FRI-002",
    nombre: "Combo Dúo de Presas",
    categoria: "Combos",
    precio: 24900,
    descripcion: "Dos presas crocantes y una salsa dorada. Ideal para una comida rápida entre dos.",
    sigla: "DUO", figura: "duo", fondo: "#FFF5D6"
  },
  {
    id: "FRI-003",
    nombre: "Combo Familiar 8 Presas",
    categoria: "Combos",
    precio: 69900,
    descripcion: "Ocho presas apanadas y dos salsas doradas para compartir en familia.",
    sigla: "FAM", figura: "bandeja", fondo: "#FFC20E"
  },
  {
    id: "FRI-004",
    nombre: "Tiras de Pollo Apanado x10",
    categoria: "Tiras y nuggets",
    precio: 22900,
    descripcion: "Diez tiras de pechuga apanada, tiernas por dentro y crujientes por fuera. Perfectas para mojar en salsa.",
    sigla: "TIR", figura: "tiras", fondo: "#FFF5D6"
  },
  {
    id: "FRI-005",
    nombre: "Nuggets Crocantes x20",
    categoria: "Tiras y nuggets",
    precio: 19900,
    descripcion: "Veinte nuggets de pollo apanado para el almuerzo, el snack o la lonchera.",
    sigla: "NUG", figura: "nuggets", fondo: "#FFC20E"
  },
  {
    id: "FRI-006",
    nombre: "Alitas Apanadas x12",
    categoria: "Alitas",
    precio: 32900,
    descripcion: "Doce alitas con apanado dorado y el sabor de siempre. Se fríen o se hornean directamente del congelador.",
    sigla: "ALI", figura: "alitas", fondo: "#FFF5D6"
  },
  {
    id: "FRI-007",
    nombre: "Cubeta Fiesta 16 Presas",
    categoria: "Cubetas",
    precio: 129900,
    descripcion: "La cubeta de las celebraciones: dieciséis presas crocantes y cuatro salsas.",
    sigla: "CUB", figura: "cubeta", fondo: "#FFC20E"
  },
  {
    id: "FRI-008",
    nombre: "Pack de Salsas Doradas x4",
    categoria: "Salsas",
    precio: 8900,
    descripcion: "Cuatro salsas para acompañar el pollo: dorada, BBQ, ajo y picante suave.",
    sigla: "SAL", figura: "salsa", fondo: "#FFF5D6"
  }
];

window.PRODUCTOS_POR_ID = {};
window.PRODUCTOS.forEach(function (p) { window.PRODUCTOS_POR_ID[p.id] = p; });
