/**
 * Abre el dialogo de impresion DESPUES de que el navegador pinte el siguiente cuadro.
 * `window.print()` bloquea el hilo principal mientras el dialogo esta abierto, y si se
 * llama dentro del clic, la metrica INP cuenta todo ese tiempo (decenas de segundos).
 */
export function imprimir(): void {
  requestAnimationFrame(() => setTimeout(() => window.print(), 0))
}
