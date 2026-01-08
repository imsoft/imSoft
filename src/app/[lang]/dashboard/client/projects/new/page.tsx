import { redirect } from 'next/navigation'

export default async function NewClientProjectPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  // Los clientes no pueden crear proyectos, redirigir a la página de proyectos
  redirect(`/${lang}/dashboard/client/projects`)
}

