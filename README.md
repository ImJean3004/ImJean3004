# FRISBY S.A · Laboratorio de medición con Google Analytics 4

Tienda en línea **ficticia** de pollo apanado, creada para el laboratorio de GA4 del Diplomado en E-commerce y Negocios Internacionales Digitales.

- Solo HTML, CSS y JavaScript puros. Sin servidor, sin base de datos, sin npm y sin compilación.
- No procesa pagos reales y no pide ni guarda correo, teléfono, documento ni datos de tarjeta.
- Incluye un **monitor de eventos** a la derecha que muestra en vivo lo que se envía a GA4.

---

## 1. Conecta tu propiedad de GA4 (único archivo que editas)

Abre `js/config.js` y pega tu ID de medición:

```js
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // ← aquí tu ID, por ejemplo "G-AB12CD34EF"
  DEBUG_MODE: true                    // true = verás los eventos en DebugView
};
```

Dónde está el ID: Google Analytics → **Administrar** → **Flujos de datos** → tu flujo web → **ID de medición** (empieza por `G-`).

Mientras dejes `G-XXXXXXXXXX`, la tienda **no carga gtag.js** y el monitor muestra un aviso rojo. Con un ID válido el aviso pasa a verde: *"Conectado a G-... · modo depuración"*.

## 2. Publícala gratis (GitHub + Vercel)

### Subir a GitHub desde el navegador
1. Descomprime el `.zip`.
2. Entra a [github.com](https://github.com) y crea un repositorio nuevo (**New repository**), por ejemplo `frisby-lab-ga4`. Déjalo público o privado, como prefieras.
3. En el repositorio vacío elige **uploading an existing file**.
4. Abre la carpeta descomprimida y arrastra **su contenido** (`index.html`, `producto.html`, `css/`, `js/`, etc.), **no la carpeta contenedora**. `index.html` debe quedar en la raíz del repositorio.
5. Espera a que terminen de subir los archivos y pulsa **Commit changes**.

### Publicar en Vercel
1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. **Add New… → Project** y elige tu repositorio (**Import**).
3. Configura:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build Command** y **Output Directory:** déjalos vacíos.
4. Pulsa **Deploy**. En menos de un minuto tendrás una dirección `https://tu-proyecto.vercel.app`.

Para cambiar el ID más adelante: edita `js/config.js` en GitHub (ícono del lápiz → **Commit changes**). Vercel vuelve a publicar solo.

## 3. Comprueba que llegan los datos

1. Abre tu sitio publicado y recorre la tienda.
2. En GA4 ve a **Administrar → DebugView** (requiere `DEBUG_MODE: true`). Verás los eventos en tiempo real.
3. También puedes mirar **Informes → Tiempo real**.
4. Los informes normales tardan de 24 a 48 horas en llenarse.
5. Para ver `tipo_cliente` en los informes, regístralo en **Administrar → Definiciones personalizadas** como dimensión de **alcance usuario**.
6. Marca como eventos clave (key events) los que quieras analizar, por ejemplo `purchase` y `begin_checkout`.

Antes de entregar el laboratorio o abrirlo al público, pon `DEBUG_MODE: false`.

### Probar canales con UTM
Agrega parámetros a la dirección de inicio y el monitor mostrará el origen de la visita:

```
https://tu-proyecto.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=lanzamiento_frisby
```

Se toma la **primera página de la sesión**. Si entras sin UTM, verás *"directo (sin UTM)"*.

---

## 4. Recorrido sugerido

1. Inicio → el banner del cupón se muestra (`view_promotion`) y el catálogo se carga (`view_item_list`).
2. Clic en el banner (`select_promotion`): aplica **BIENVENIDA10** y lleva al carrito.
3. Vuelve al catálogo y abre un producto (`select_item` → `view_item`).
4. Agrega unidades (`add_to_cart`), abre el carrito (`view_cart`) y prueba **+**, **−** y **Quitar** (`add_to_cart`, `remove_from_cart`).
5. **Ir a pagar** (`begin_checkout`) → elige país y servicio → **Continuar al pago** (`add_shipping_info`).
6. Elige un método → **Pagar (simulado)** (`add_payment_info`) → página de gracias (`purchase`).
7. Recarga la página de gracias: **no** se repite `purchase`.

Usa **Simular nuevo visitante** en el monitor para empezar como alguien nuevo: borra las cookies `_ga*`, el carrito, el cupón y la sesión, y vuelve al inicio.

## 5. Contrato de medición

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`, `item_brand` ("Frisby"), `item_category`, `price`, `quantity` e `index`.

| Evento | Cuándo se envía | Parámetros principales |
|---|---|---|
| `view_item_list` | Al cargar el catálogo | `item_list_id` "catalogo_principal", `item_list_name`, `items` |
| `view_promotion` | Al mostrarse el banner del cupón | `promotion_id` "BIENVENIDA10", `promotion_name`, `creative_name`, `creative_slot`, `items` |
| `select_promotion` | Clic en el banner (aplica el cupón y va al carrito) | Los mismos que `view_promotion` |
| `select_item` | Clic en un producto del catálogo, antes de navegar | `item_list_id`, `item_list_name`, `items` |
| `view_item` | Al abrir el detalle | `value`, `items` |
| `add_to_cart` | Al agregar o aumentar unidades | `value`, `items` (`quantity` = unidades agregadas) |
| `remove_from_cart` | Al quitar o disminuir unidades | `value`, `items` |
| `view_cart` | Al abrir el carrito con productos | `value`, `coupon` (si existe), `items` |
| `begin_checkout` | Al abrir `checkout.html` | `value`, `coupon`, `items` |
| `add_shipping_info` | Clic en "Continuar al pago" | `value`, `coupon`, `items`, `shipping_tier` |
| `add_payment_info` | Clic en "Pagar (simulado)" | `value`, `coupon`, `payment_type`, `items` |
| `purchase` | Al cargar `gracias.html`, una vez por pedido | `transaction_id`, `affiliation`, `value`, `shipping`, `coupon`, `tipo_cliente`, `items` |

Valores de `shipping_tier`: `Nacional - Estándar`, `Nacional - Express`, `Internacional - Estándar`, `Internacional - Express`.
Valores de `payment_type`: `Tarjeta de crédito`, `PSE`, `Nequi`, `PayPal`.

**Propiedad de usuario:** `tipo_cliente` ("Nacional" o "Internacional") se define con `gtag('set', 'user_properties', …)` al confirmar el envío y otra vez en `gracias.html`, antes de `purchase`.

### Con cupón
Cuando el cupón está aplicado, cada ítem lleva `price` = precio unitario **con descuento**, `discount` = descuento por unidad y `coupon`. El `value` de los eventos es siempre la suma de `price × quantity` de sus ítems. En `purchase`, `value` son los productos con descuento y **sin envío**; el envío va aparte en `shipping`.

### Decisiones de diseño que conviene conocer
- **Precio de lista en el catálogo:** `view_item_list`, `select_item`, `view_item` y los eventos de promoción llevan el precio de lista, sin descuento. El cupón empieza a reflejarse desde `add_to_cart` (si ya está aplicado), y siempre en `view_cart` y el embudo de pago.
- **`index` empieza en 0.** En el catálogo es la posición del producto en la lista; en el carrito y el checkout, el orden de las líneas.
- **Envío gratis nacional estándar:** se calcula sobre el valor de los productos **ya con descuento**. Con cupón, es posible quedar por debajo de los $150.000 y volver a pagar los $12.000 de envío.
- **El cupón se conserva** al terminar un pedido, para poder repetir el recorrido. "Simular nuevo visitante" lo borra.
- **`transaction_id`** es único por pedido (`FRS-…`). El pedido se guarda en `sessionStorage` sin datos personales y se marca como enviado después de `purchase`.
- **Navegación segura:** `select_item`, `select_promotion` y `add_payment_info` se envían y luego se navega, usando `event_callback`, `event_timeout` de 1000 ms y un respaldo de 1200 ms.

## 6. Productos

| ID | Producto | Categoría | Precio (COP) |
|---|---|---|---|
| FRI-001 | Presa Crocante Individual | Presas | 11.900 |
| FRI-002 | Combo Dúo de Presas | Combos | 24.900 |
| FRI-003 | Combo Familiar 8 Presas | Combos | 69.900 |
| FRI-004 | Tiras de Pollo Apanado x10 | Tiras y nuggets | 22.900 |
| FRI-005 | Nuggets Crocantes x20 | Tiras y nuggets | 19.900 |
| FRI-006 | Alitas Apanadas x12 | Alitas | 32.900 |
| FRI-007 | Cubeta Fiesta 16 Presas | Cubetas | 129.900 |
| FRI-008 | Pack de Salsas Doradas x4 | Salsas | 8.900 |

**Tarifas de envío (COP):** Nacional Estándar 12.000 (gratis desde 150.000 en productos), Nacional Express 25.000, Internacional Estándar 95.000, Internacional Express 160.000. Países: Colombia (nacional) y México, Perú, Chile, Argentina, Ecuador, España y Estados Unidos (internacional).

## 7. Estructura de archivos

```
FRISBY-SA/
├── index.html          Catálogo y banner del cupón
├── producto.html       Detalle (producto.html?id=FRI-001)
├── carrito.html        Carrito y cupón
├── checkout.html       Checkout en dos pasos
├── gracias.html        Confirmación (evento purchase)
├── README.md
├── css/
│   └── estilos.css
└── js/
    ├── config.js            ← el único archivo que editas
    ├── productos.js         Catálogo de ocho productos
    ├── analytics.js         Carga gtag.js y envía eventos
    ├── carrito.js           Carrito, cupón y tarifas (localStorage)
    ├── monitor.js           Monitor de eventos
    ├── comun.js             Formato de precios, dibujos SVG, contador
    ├── pagina-index.js
    ├── pagina-producto.js
    ├── pagina-carrito.js
    ├── pagina-checkout.js
    └── pagina-gracias.js
```

## 8. Problemas frecuentes

- **El monitor dice "Sin ID de medición":** el ID sigue siendo `G-XXXXXXXXXX` o tiene un formato inválido. Revisa `js/config.js`.
- **No veo eventos en GA4:** confirma que el ID corresponde a tu flujo web, que `DEBUG_MODE` es `true` para DebugView y que ningún bloqueador de anuncios o rastreo está activo en tu navegador. El monitor seguirá mostrando los eventos aunque GA4 no los reciba.
- **Los cambios no aparecen en Vercel:** verifica que el *commit* se guardó en GitHub y espera a que termine el despliegue. Prueba con recarga forzada (Ctrl + F5).
- **El monitor tapa contenido:** pulsa **Ocultar**. Se recuerda tu elección entre páginas.

---

*FRISBY S.A es una tienda ficticia con fines académicos. Sitio de simulación: no procesa pagos, no guarda datos personales y usa Google Analytics 4.*
