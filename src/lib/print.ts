/**
 * Opens the print dialog AFTER the browser paints the next frame. `window.print()`
 * blocks the main thread while the dialog is open, and if it is called inside the click
 * handler, the INP metric counts all that time (tens of seconds).
 */
export function printPage(): void {
  requestAnimationFrame(() => setTimeout(() => window.print(), 0))
}
