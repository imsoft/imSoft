import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value).replace(/"/g, '""')
      }).join(',')
    ),
  ]

  return csvRows.join('\n')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const format = searchParams.get('format') || 'json'

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    let data: any[] | Record<string, any> = []

    switch (type) {
      case 'users': {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
        data = (usersData?.users || []).map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          company_name: user.user_metadata?.company_name || '',
          role: user.user_metadata?.role || 'client',
          created_at: user.created_at,
        }))
        break
      }
      case 'projects': {
        const { data: projects } = await supabase.from('projects').select('*')
        data = projects || []
        break
      }
      case 'services': {
        const { data: services } = await supabase.from('services').select('*')
        data = services || []
        break
      }
      case 'portfolio': {
        const { data: portfolio } = await supabase.from('portfolio').select('*')
        data = portfolio || []
        break
      }
      case 'blog': {
        const { data: blog } = await supabase.from('blog').select('*')
        data = blog || []
        break
      }
      case 'testimonials': {
        const { data: testimonials } = await supabase.from('testimonials').select('*')
        data = testimonials || []
        break
      }
      case 'all': {
        const [
          { data: usersData },
          { data: projects },
          { data: services },
          { data: portfolio },
          { data: blog },
          { data: testimonials },
        ] = await Promise.all([
          supabaseAdmin.auth.admin.listUsers(),
          supabase.from('projects').select('*'),
          supabase.from('services').select('*'),
          supabase.from('portfolio').select('*'),
          supabase.from('blog').select('*'),
          supabase.from('testimonials').select('*'),
        ])

        data = {
          users: (usersData?.users || []).map(user => ({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            company_name: user.user_metadata?.company_name || '',
            role: user.user_metadata?.role || 'client',
            created_at: user.created_at,
          })),
          projects: projects || [],
          services: services || [],
          portfolio: portfolio || [],
          blog: blog || [],
          testimonials: testimonials || [],
        }
        break
      }
    }

    if (format === 'csv') {
      let csvContent: string
      
      if (type === 'all') {
        // Para "all", crear un CSV con múltiples secciones
        const sections = Object.entries(data as any).map(([key, value]: [string, any]) => {
          return `\n=== ${key.toUpperCase()} ===\n${convertToCSV(Array.isArray(value) ? value : [])}`
        })
        csvContent = sections.join('\n\n')
      } else {
        csvContent = convertToCSV(Array.isArray(data) ? data : [])
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${type}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      return NextResponse.json(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="report-${type}-${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}

