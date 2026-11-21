/* =====================================================================
   CONFIGURACIÓN DE LA TIENDA FRISBY S.A
   Este es el ÚNICO archivo que necesitas editar.

   1) GA_MEASUREMENT_ID
      Pega aquí el ID de medición de tu propiedad de Google Analytics 4.
      Dónde encontrarlo:
        Google Analytics → Administrar (engranaje) → Flujos de datos →
        elige tu flujo web → "ID de medición" (empieza por G-).
      Ejemplo: "G-AB12CD34EF"
      Mientras dejes "G-XXXXXXXXXX", la tienda NO se conecta a Google
      Analytics: los eventos solo se muestran en el monitor de la derecha.

   2) DEBUG_MODE
      true  → los eventos se envían en modo depuración y los verás en
              GA4 → Administrar → DebugView (recomendado en el laboratorio).
      false → los eventos se envían sin modo depuración.
   ===================================================================== */
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // ← pega tu ID de medición entre las comillas
  DEBUG_MODE: true                    // ← true para usar DebugView, false para apagarlo
};
