/**
 * Script para crear y configurar todos los buckets de Supabase Storage
 *
 * Este script crea los siguientes buckets:
 * - company-logos: Logos de empresas (estructura: /<company_id>/logo.ext)
 * - images: Imágenes generales (servicios, blog, portfolio, proyectos, perfil)
 *
 * Estructura de archivos: /<id>/imagen.ext
 *
 * Uso:
 * 1. Asegúrate de tener SUPABASE_SERVICE_ROLE_KEY en tu .env.local
 * 2. Ejecuta: npx tsx scripts/setup-storage-buckets.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Configuración de buckets
const BUCKETS_CONFIG = [
  {
    id: 'company-logos',
    name: 'company-logos',
    description: 'Logos de empresas',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ]
  },
  {
    id: 'profile-images',
    name: 'profile-images',
    description: 'Imágenes de perfil de usuarios',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  },
  {
    id: 'blog-images',
    name: 'blog-images',
    description: 'Imágenes de artículos del blog (covers, contenido)',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ]
  },
  {
    id: 'service-images',
    name: 'service-images',
    description: 'Imágenes de servicios (hero images, iconos)',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ]
  },
  {
    id: 'portfolio-images',
    name: 'portfolio-images',
    description: 'Imágenes de portfolio (thumbnails, capturas)',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  },
  {
    id: 'project-images',
    name: 'project-images',
    description: 'Imágenes de proyectos (screenshots, demos)',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  },
  {
    id: 'testimonial-images',
    name: 'testimonial-images',
    description: 'Imágenes de testimonios (avatares de clientes)',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  }
]

async function createBucket(config: typeof BUCKETS_CONFIG[number]) {
  console.log(`\n📦 Configurando bucket: ${config.id}`)

  try {
    // Verificar si el bucket ya existe
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw new Error(`Error al listar buckets: ${listError.message}`)
    }

    const bucketExists = existingBuckets?.some(b => b.id === config.id)

    if (bucketExists) {
      console.log(`   ℹ️  El bucket '${config.id}' ya existe`)

      // Actualizar configuración del bucket existente
      const { error: updateError } = await supabase.storage.updateBucket(config.id, {
        public: config.public,
        fileSizeLimit: config.fileSizeLimit,
        allowedMimeTypes: config.allowedMimeTypes
      })

      if (updateError) {
        console.log(`   ⚠️  No se pudo actualizar la configuración: ${updateError.message}`)
      } else {
        console.log(`   ✅ Configuración actualizada`)
      }
    } else {
      // Crear nuevo bucket
      const { error: createError } = await supabase.storage.createBucket(config.id, {
        public: config.public,
        fileSizeLimit: config.fileSizeLimit,
        allowedMimeTypes: config.allowedMimeTypes
      })

      if (createError) {
        throw new Error(`Error al crear bucket: ${createError.message}`)
      }

      console.log(`   ✅ Bucket creado exitosamente`)
    }

    console.log(`   📋 Descripción: ${config.description}`)
    console.log(`   🌐 Público: ${config.public ? 'Sí' : 'No'}`)
    console.log(`   📏 Tamaño máximo: ${(config.fileSizeLimit / 1024 / 1024).toFixed(1)}MB`)
    console.log(`   🎨 Tipos permitidos: ${config.allowedMimeTypes.join(', ')}`)

  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`)
    throw error
  }
}

async function setupPolicies() {
  console.log('\n🔐 Configurando políticas de acceso (RLS)...')
  console.log('   ℹ️  Las políticas se deben configurar manualmente en Supabase Dashboard o via SQL')
  console.log('   📄 Archivos SQL disponibles en /scripts:')
  console.log('      - setup-storage-policies-simple.sql (Recomendado)')
  console.log('      - setup-storage-policies.sql (Con documentación)')
  console.log('\n   💡 Políticas recomendadas:')
  console.log('      1. SELECT (lectura pública): Todos pueden leer')
  console.log('      2. INSERT (subida): Solo usuarios autenticados')
  console.log('      3. UPDATE (actualización): Solo el propietario o admin')
  console.log('      4. DELETE (eliminación): Solo el propietario o admin')
  console.log('\n   📁 Estructura de carpetas (/<resource_id>/imagen.ext):')
  console.log('      - company-logos: /<company_id>/logo.ext')
  console.log('      - profile-images: /<user_id>/avatar.ext')
  console.log('      - blog-images: /<blog_id>/cover.ext, /<blog_id>/image-1.ext')
  console.log('      - service-images: /<service_id>/hero.ext, /<service_id>/icon.ext')
  console.log('      - portfolio-images: /<portfolio_id>/thumbnail.ext')
  console.log('      - project-images: /<project_id>/screenshot.ext')
  console.log('      - testimonial-images: /<testimonial_id>/avatar.ext')
}

async function testBuckets() {
  console.log('\n🧪 Verificando buckets creados...')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      throw new Error(`Error al listar buckets: ${error.message}`)
    }

    console.log(`\n   ✅ Total de buckets encontrados: ${buckets?.length || 0}`)

    BUCKETS_CONFIG.forEach(config => {
      const bucket = buckets?.find(b => b.id === config.id)
      if (bucket) {
        console.log(`   ✓ ${config.id} - ${bucket.public ? 'Público' : 'Privado'}`)
      } else {
        console.log(`   ✗ ${config.id} - No encontrado`)
      }
    })
  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`)
  }
}

async function main() {
  console.log('�� Iniciando configuración de Storage en Supabase...\n')
  console.log('='.repeat(60))

  try {
    // Crear todos los buckets
    for (const config of BUCKETS_CONFIG) {
      await createBucket(config)
    }

    // Mostrar información sobre políticas
    await setupPolicies()

    // Verificar que todo está correcto
    await testBuckets()

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ ¡Configuración completada exitosamente!')
    console.log('\n📝 Siguientes pasos:')
    console.log('   1. Revisa los buckets en Supabase Dashboard > Storage')
    console.log('   2. Configura las políticas RLS ejecutando los scripts SQL')
    console.log('   3. Prueba subiendo una imagen desde tu aplicación')
    console.log('\n💾 Ejemplos de uso en código:')
    console.log(`
   // 1. Subir logo de empresa
   const filePath = \`\${companyId}/logo.png\`
   await supabase.storage.from('company-logos').upload(filePath, file, { upsert: true })

   // 2. Subir avatar de perfil
   const filePath = \`\${userId}/avatar.jpg\`
   await supabase.storage.from('profile-images').upload(filePath, file, { upsert: true })

   // 3. Subir cover de blog
   const filePath = \`\${blogId}/cover.png\`
   await supabase.storage.from('blog-images').upload(filePath, file, { upsert: true })

   // 4. Subir imagen de servicio
   const filePath = \`\${serviceId}/hero.jpg\`
   await supabase.storage.from('service-images').upload(filePath, file, { upsert: true })

   // 5. Subir thumbnail de portfolio
   const filePath = \`\${portfolioId}/thumbnail.webp\`
   await supabase.storage.from('portfolio-images').upload(filePath, file, { upsert: true })

   // 6. Subir screenshot de proyecto
   const filePath = \`\${projectId}/screenshot-1.png\`
   await supabase.storage.from('project-images').upload(filePath, file, { upsert: true })

   // 7. Subir avatar de testimonio
   const filePath = \`\${testimonialId}/avatar.jpg\`
   await supabase.storage.from('testimonial-images').upload(filePath, file, { upsert: true })
    `)

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
