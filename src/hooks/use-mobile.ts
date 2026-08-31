import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Lee una media query sin provocar un render de mas.
 *
 * El patron anterior era `useState(false)` + `useEffect` que hacia `setState` con el
 * valor real justo despues de montar. Funciona, pero cada componente que lo usaba
 * renderizaba dos veces en cada carga: una con el valor falso y otra con el bueno.
 * `useSyncExternalStore` esta hecho exactamente para esto: React lee el valor durante
 * el render y se suscribe a los cambios, con un snapshot aparte para el servidor.
 */
function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // En el servidor no hay matchMedia; el valor real llega al hidratar.
    () => serverFallback,
  );
}

export { useMediaQuery };

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
