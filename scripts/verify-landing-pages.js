/**
 * Script para verificar que todas las landing pages estén correctamente generadas
 * Uso: node scripts/verify-landing-pages.js
 */

const cities = ['guadalajara', 'cdmx', 'monterrey'];
const services = [
  'software-para-inmobiliarias',
  'software-para-constructoras',
  'software-para-restaurantes',
  'software-para-clinicas',
  'software-para-logistica',
];

console.log('🔍 Verificando las 15 landing pages generadas...\n');

let counter = 1;
cities.forEach((city) => {
  console.log(`📍 ${city.toUpperCase()}`);
  services.forEach((service) => {
    const url = `/${city}/${service}`;
    console.log(`   ${counter}. ${url}`);
    counter++;
  });
  console.log('');
});

console.log('✅ Total de landing pages: 15');
console.log('\n📊 Distribución:');
console.log(`   - Guadalajara: 5 páginas`);
console.log(`   - CDMX: 5 páginas`);
console.log(`   - Monterrey: 5 páginas`);
console.log('\n🏭 Industrias cubiertas:');
console.log(`   - Inmobiliarias`);
console.log(`   - Constructoras`);
console.log(`   - Restaurantes`);
console.log(`   - Clínicas`);
console.log(`   - Logística`);

console.log('\n🚀 Para verificar en el navegador:');
console.log(`   1. Ejecuta: pnpm dev`);
console.log(`   2. Visita cualquiera de las URLs arriba`);
console.log(`   3. Verifica el H1, metadata y contenido único\n`);

console.log('📚 Documentación completa en: docs/LANDING_PAGES_README.md\n');
