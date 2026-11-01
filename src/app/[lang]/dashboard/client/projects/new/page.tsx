import { redirect } from 'next/navigation'

export default async function NewClientProjectPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  // Clients can't create projects, redirect to the projects page
  redirect(`/${lang}/dashboard/client/projects`)
}

