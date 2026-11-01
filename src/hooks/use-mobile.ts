import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Reads a media query without causing an extra render.
 *
 * The previous pattern was `useState(false)` + `useEffect` calling `setState` with the
 * real value right after mounting. It works, but every component using it rendered
 * twice on each load: once with the false value and once with the right one.
 * `useSyncExternalStore` is made exactly for this: React reads the value during
 * render and subscribes to changes, with a separate snapshot for the server.
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
    // There's no matchMedia on the server; the real value arrives on hydration.
    () => serverFallback,
  );
}

export { useMediaQuery };

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
