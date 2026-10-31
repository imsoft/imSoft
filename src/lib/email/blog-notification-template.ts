import { blogPostEmail } from './templates'

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

/** HTML of the new blog article notice email (single imSoft template). */
export function buildBlogNotificationHtml(params: BlogNotificationParams): string {
  return blogPostEmail({
    name: params.recipientName,
    title: params.postTitle,
    excerpt: params.postExcerpt,
    image: params.postImageUrl,
    link: params.postUrl,
    unsubscribeUrl: params.unsubscribeUrl,
    address: params.companyAddress,
    lang: params.lang,
  }).html
}
