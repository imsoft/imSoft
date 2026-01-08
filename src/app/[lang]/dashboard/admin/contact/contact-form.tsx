'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { AdminContactFormProps } from '@/types/forms'

const contactSchema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  description: z.string().optional(),
  facebook: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagram: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  youtube: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tiktok: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitch: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  spotify: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  threads: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  facebook_visible: z.boolean().optional(),
  twitter_visible: z.boolean().optional(),
  instagram_visible: z.boolean().optional(),
  linkedin_visible: z.boolean().optional(),
  youtube_visible: z.boolean().optional(),
  tiktok_visible: z.boolean().optional(),
  twitch_visible: z.boolean().optional(),
  whatsapp_visible: z.boolean().optional(),
  spotify_visible: z.boolean().optional(),
  threads_visible: z.boolean().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactForm({ dict, lang, contactData }: AdminContactFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      address: contactData?.address || '',
      phone: contactData?.phone || '',
      email: contactData?.email || '',
      description: contactData?.description || '',
      facebook: contactData?.facebook || '',
      twitter: contactData?.twitter || '',
      instagram: contactData?.instagram || '',
      linkedin: contactData?.linkedin || '',
      youtube: contactData?.youtube || '',
      tiktok: contactData?.tiktok || '',
      twitch: contactData?.twitch || '',
      whatsapp: contactData?.whatsapp || '',
      spotify: contactData?.spotify || '',
      threads: contactData?.threads || '',
      facebook_visible: contactData?.facebook_visible ?? true,
      twitter_visible: contactData?.twitter_visible ?? true,
      instagram_visible: contactData?.instagram_visible ?? true,
      linkedin_visible: contactData?.linkedin_visible ?? true,
      youtube_visible: contactData?.youtube_visible ?? true,
      tiktok_visible: contactData?.tiktok_visible ?? true,
      twitch_visible: contactData?.twitch_visible ?? true,
      whatsapp_visible: contactData?.whatsapp_visible ?? true,
      spotify_visible: contactData?.spotify_visible ?? true,
      threads_visible: contactData?.threads_visible ?? true,
    },
  })

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const data = {
        ...values,
        email: values.email || null,
        facebook: values.facebook || null,
        twitter: values.twitter || null,
        instagram: values.instagram || null,
        linkedin: values.linkedin || null,
        youtube: values.youtube || null,
        tiktok: values.tiktok || null,
        twitch: values.twitch || null,
        whatsapp: values.whatsapp || null,
        spotify: values.spotify || null,
        threads: values.threads || null,
        facebook_visible: values.facebook_visible ?? true,
        twitter_visible: values.twitter_visible ?? true,
        instagram_visible: values.instagram_visible ?? true,
        linkedin_visible: values.linkedin_visible ?? true,
        youtube_visible: values.youtube_visible ?? true,
        tiktok_visible: values.tiktok_visible ?? true,
        twitch_visible: values.twitch_visible ?? true,
        whatsapp_visible: values.whatsapp_visible ?? true,
        spotify_visible: values.spotify_visible ?? true,
        threads_visible: values.threads_visible ?? true,
      }

      if (contactData) {
        // Actualizar
        const { error } = await supabase
          .from('contact')
          .update(data)
          .eq('id', contactData.id)

        if (error) {
          console.error('Error updating contact data:', error)
          toast.error(
            lang === 'en' ? 'Error updating contact information' : 'Error al actualizar la información de contacto',
            {
              description: error.message,
            }
          )
          throw error
        } else {
          toast.success(
            lang === 'en' ? 'Contact information updated successfully' : 'Información de contacto actualizada exitosamente'
          )
        }
      } else {
        // Crear
        const { error } = await supabase
          .from('contact')
          .insert([data])

        if (error) {
          console.error('Error creating contact data:', error)
          toast.error(
            lang === 'en' ? 'Error creating contact information' : 'Error al crear la información de contacto',
            {
              description: error.message,
            }
          )
          throw error
        } else {
          toast.success(
            lang === 'en' ? 'Contact information created successfully' : 'Información de contacto creada exitosamente'
          )
        }
      }

      router.refresh()
    } catch (error) {
      console.error('Error saving contact data:', error)
      // El error ya se mostró en el toast arriba
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Address' : 'Dirección'}</FormLabel>
              <FormControl>
                <Input {...field} className="!border-2 !border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Phone' : 'Teléfono'}</FormLabel>
              <FormControl>
                <Input {...field} className="!border-2 !border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Email' : 'Correo Electrónico'}</FormLabel>
              <FormControl>
                <Input {...field} type="email" className="!border-2 !border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Description' : 'Descripción'}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} className="!border-2 !border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Social Media' : 'Redes Sociales'}
          </h3>
          <div className="space-y-4">
            {[
              { name: 'facebook', label: 'Facebook', urlField: 'facebook', visibleField: 'facebook_visible' },
              { name: 'twitter', label: 'X', urlField: 'twitter', visibleField: 'twitter_visible' },
              { name: 'instagram', label: 'Instagram', urlField: 'instagram', visibleField: 'instagram_visible' },
              { name: 'linkedin', label: 'LinkedIn', urlField: 'linkedin', visibleField: 'linkedin_visible' },
              { name: 'youtube', label: 'YouTube', urlField: 'youtube', visibleField: 'youtube_visible' },
              { name: 'tiktok', label: 'TikTok', urlField: 'tiktok', visibleField: 'tiktok_visible' },
              { name: 'twitch', label: 'Twitch', urlField: 'twitch', visibleField: 'twitch_visible' },
              { name: 'whatsapp', label: 'WhatsApp', urlField: 'whatsapp', visibleField: 'whatsapp_visible', inputType: 'tel' },
              { name: 'spotify', label: 'Spotify', urlField: 'spotify', visibleField: 'spotify_visible' },
              { name: 'threads', label: 'Threads', urlField: 'threads', visibleField: 'threads_visible' },
            ].map((social) => (
              <div key={social.name} className="flex items-center gap-4 p-4 border rounded-lg">
                <FormField
                  control={form.control}
                  name={social.visibleField as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={social.urlField as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{social.label}</FormLabel>
                        <FormControl>
                          <Input {...field} type={social.inputType || 'url'} className="!border-2 !border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : dict.dashboard.admin.crud.save}
          </Button>
        </div>
      </form>
    </Form>
  )
}

