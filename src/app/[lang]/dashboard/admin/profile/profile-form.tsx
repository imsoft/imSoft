'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

interface ProfileFormProps {
  dict: Dictionary
  lang: Locale
  user: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      first_name?: string
      last_name?: string
      full_name?: string
    }
  }
}

export function ProfileForm({ dict, lang, user }: ProfileFormProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(user.user_metadata?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    setIsUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Eliminar avatar anterior si existe
      if (user.user_metadata?.avatar_url) {
        const oldPath = user.user_metadata.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('profile-images')
            .remove([`avatars/${oldPath}`])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Actualizar user_metadata con la nueva URL del avatar
      const response = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_url: data.publicUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el avatar')
      }

      setPreviewImage(data.publicUrl)
      router.refresh()
      toast.success(lang === 'en' ? 'Avatar updated successfully' : 'Avatar actualizado exitosamente')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error(lang === 'en' ? 'Error uploading avatar' : 'Error al subir el avatar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'en' ? 'Image size must be less than 5MB' : 'El tamaño de la imagen debe ser menor a 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error(lang === 'en' ? 'Please select an image file' : 'Por favor selecciona un archivo de imagen')
        return
      }
      handleFileUpload(file)
    }
  }

  async function handleRemoveAvatar() {
    try {
      const supabase = createClient()
      
      // Eliminar avatar del storage si existe
      if (user.user_metadata?.avatar_url) {
        const oldPath = user.user_metadata.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('profile-images')
            .remove([`avatars/${oldPath}`])
        }
      }

      // Actualizar user_metadata para eliminar la URL del avatar
      const response = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_url: null,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el avatar')
      }

      setPreviewImage(null)
      router.refresh()
      toast.success(lang === 'en' ? 'Avatar removed successfully' : 'Avatar eliminado exitosamente')
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error(lang === 'en' ? 'Error removing avatar' : 'Error al eliminar el avatar', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {lang === 'en' ? 'Profile Picture' : 'Foto de Perfil'}
        </CardTitle>
        <CardDescription>
          {lang === 'en' ? 'Upload or change your profile picture' : 'Sube o cambia tu foto de perfil'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            {previewImage ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                <Image
                  src={previewImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="!border-2 !border-border"
              >
                {isUploading ? (
                  lang === 'en' ? 'Uploading...' : 'Subiendo...'
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {lang === 'en' ? 'Change Picture' : 'Cambiar Foto'}
                  </>
                )}
              </Button>
              {previewImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  className="!border-2 !border-border"
                >
                  <X className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'Remove' : 'Eliminar'}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'JPG, PNG or GIF. Max size 5MB' : 'JPG, PNG o GIF. Tamaño máximo 5MB'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  )
}

