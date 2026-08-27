import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolucion nativa de los paths de tsconfig (`@/...`), sin plugin.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Las pruebas de SEO comparan URLs absolutas, asi que el dominio debe ser
    // determinista y no depender del .env de la maquina donde corran.
    env: {
      NEXT_PUBLIC_SITE_URL: 'https://www.imsoft.io',
    },
  },
});
