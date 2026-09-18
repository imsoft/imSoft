import { correoBlog } from './plantillas'

interface BlogNotificationParams {
  recipientName: string
  postTitle: string
  postExcerpt?: string | null
  postImageUrl?: string | null
  postUrl: string
  unsubscribeUrl: string
  companyAddress?: string | null
  lang?: string
}

/** HTML del correo de aviso de nuevo artículo del blog (plantilla unica de imSoft). */
export function buildBlogNotificationHtml(params: BlogNotificationParams): string {
  return correoBlog({
    nombre: params.recipientName,
    titulo: params.postTitle,
    resumen: params.postExcerpt,
    imagen: params.postImageUrl,
    enlace: params.postUrl,
    bajaUrl: params.unsubscribeUrl,
    direccion: params.companyAddress,
    lang: params.lang,
  }).html
}
