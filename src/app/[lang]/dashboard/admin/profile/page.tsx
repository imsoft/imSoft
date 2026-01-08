import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User, Mail, Building, Shield, Calendar, Hash } from 'lucide-react'
import { ProfileForm } from './profile-form'

export default async function AdminProfilePage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/${lang}/login`)
  }

  const metadata = user.user_metadata || {}
  const fullName = metadata.full_name || 
                   (metadata.first_name && metadata.last_name
                     ? `${metadata.first_name} ${metadata.last_name}`
                     : null)
  const companyName = metadata.company_name || ''
  const role = metadata.role || 'client'
  
  // Formatear fecha de creación
  const createdAt = user.created_at 
    ? new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.common.profile}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Manage your administrator profile' : 'Gestiona tu perfil de administrador'}
        </p>
      </div>

      <ProfileForm dict={dict} lang={lang} user={user} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {lang === 'en' ? 'Personal Information' : 'Información Personal'}
            </CardTitle>
            <CardDescription>
              {lang === 'en' ? 'Your personal details' : 'Tus datos personales'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fullName ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {lang === 'en' ? 'Full Name' : 'Nombre Completo'}
                </label>
                <p className="text-sm font-medium mt-1">{fullName}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {lang === 'en' ? 'No personal information available' : 'No hay información personal disponible'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {lang === 'en' ? 'Account Information' : 'Información de Cuenta'}
            </CardTitle>
            <CardDescription>
              {lang === 'en' ? 'Your account details' : 'Detalles de tu cuenta'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {lang === 'en' ? 'Email' : 'Correo Electrónico'}
              </label>
              <p className="text-sm font-medium mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {lang === 'en' ? 'User ID' : 'ID de Usuario'}
              </label>
              <p className="text-sm font-mono text-xs mt-1 break-all">{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {lang === 'en' ? 'Role' : 'Rol'}
              </label>
              <p className="text-sm font-medium mt-1 capitalize">
                {role === 'admin' 
                  ? (lang === 'en' ? 'Administrator' : 'Administrador')
                  : (lang === 'en' ? 'Client' : 'Cliente')
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {lang === 'en' ? 'Account Created' : 'Cuenta Creada'}
              </label>
              <p className="text-sm font-medium mt-1">{createdAt}</p>
            </div>
          </CardContent>
        </Card>

        {companyName && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {lang === 'en' ? 'Company Information' : 'Información de Empresa'}
              </CardTitle>
              <CardDescription>
                {lang === 'en' ? 'Your company details' : 'Detalles de tu empresa'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {lang === 'en' ? 'Company Name' : 'Nombre de la Empresa'}
                </label>
                <p className="text-sm font-medium mt-1">{companyName}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
