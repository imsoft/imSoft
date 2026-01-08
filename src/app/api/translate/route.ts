import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { text, targetLanguage = 'en' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Translate API key is not configured' },
        { status: 500 }
      )
    }

    // Google Cloud Translation API endpoint
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        source: 'es', // Asumimos que siempre traducimos de español a inglés
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Google Translate API error:', errorData)
      return NextResponse.json(
        { error: 'Translation service error', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.data || !data.data.translations || data.data.translations.length === 0) {
      return NextResponse.json(
        { error: 'No translation returned' },
        { status: 500 }
      )
    }

    const translatedText = data.data.translations[0].translatedText

    // Registrar el uso de caracteres en la base de datos
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const charactersCount = text.length

        await supabase
          .from('translation_logs')
          .insert({
            user_id: user.id,
            characters_count: charactersCount,
            source_language: 'es',
            target_language: targetLanguage,
          })
      }
    } catch (logError) {
      // No fallar la traducción si hay error al registrar el log
      console.error('Error logging translation usage:', logError)
    }

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

