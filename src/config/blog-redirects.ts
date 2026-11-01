/**
 * Blog consolidation (August 2026).
 *
 * The daily generator kept writing about the same ~7 topics without knowing they already
 * existed: 92 posts, 36 of which cannibalized a more complete one. None had enough weight
 * to rank, and Search Console reported 34 "Crawled - currently not indexed".
 *
 * Those 36 are unpublished (`published = false`, reversible) and their URL 301s to the
 * article that absorbs the topic, so links and accumulated authority are kept.
 * The redirects are applied in `next.config.ts` for both languages.
 *
 * Keys are the slugs of the unpublished duplicates (each slug mirrors its post title).
 */
export const BLOG_SLUG_REDIRECTS: Record<string, string> = {
  // Published by the cron on 2026-08-24, after the consolidation but before the
  // anti-duplicate gate was deployed: 71% overlap with the target.
  'responsive-web-design-the-key-to-selling-on-any-device':
    'responsive-web-design-how-to-serve-customers-on-any-device',
  '5-common-mistakes-slowing-down-your-digital-transformation-in-2026':
    '5-mistakes-halting-your-digital-transformation-and-how-to-avoid-them',
  '5-common-mistakes-when-launching-your-online-store-that-cost-money':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  '5-common-web-development-mistakes-costing-your-business-thousands':
    'why-your-website-isnt-converting-common-web-development-mistakes',
  '5-common-web-development-mistakes-that-cost-you-money':
    'why-your-website-isnt-converting-common-web-development-mistakes',
  '5-mistakes-costing-you-sales-in-your-online-store':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  '5-mistakes-sabotaging-your-online-store-and-how-to-fix-them':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  '5-mistakes-that-destroy-your-online-store-and-how-to-fix-them':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  '5-signs-your-business-needs-digital-transformation-now':
    'how-digital-transformation-increases-your-business-profits',
  'digital-transformation-for-smbs-where-to-start-in-2026':
    'digital-transformation-for-smes-where-to-start-in-2026',
  'digital-transformation-for-smes-the-practical-guide-you-need-in-2026':
    'digital-transformation-for-smes-where-to-start-in-2026',
  'digital-transformation-how-to-modernize-your-business-in-2026':
    'digital-transformation-for-smes-where-to-start-in-2026',
  'digital-transformation-the-key-for-your-smb-to-grow-in-2026':
    'digital-transformation-the-urgent-reality-your-smb-cant-ignore-in-2026',
  'how-digital-transformation-saves-smes-from-extinction':
    'digital-transformation-for-smes-where-to-start-in-2026',
  'how-to-automate-your-smb-the-practical-guide-for-2026':
    'how-to-digitalize-your-sme-in-2026-the-practical-guide-you-need',
  'how-to-build-an-online-store-that-actually-sells-in-2026':
    'how-to-build-an-online-store-with-react-practical-guide-for-2026',
  'how-to-choose-the-right-technology-for-your-digital-project-in-2026':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  'how-to-choose-the-right-technology-for-your-startup-practical-guide-2026':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  'how-to-create-an-online-store-in-2026-a-practical-guide-for-smbs':
    'how-to-build-an-online-store-with-react-practical-guide-for-2026',
  'how-to-create-an-online-store-in-2026-practical-guide-for-smes':
    'how-to-build-an-online-store-with-react-practical-guide-for-2026',
  'how-to-rank-your-smb-on-google-without-spending-on-ads':
    'seo-for-smes-how-to-rank-on-google-without-spending-on-ads',
  'mobile-app-vs-web-which-one-to-choose-for-your-business-in-2026':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  'modern-web-design-how-to-convert-visitors-into-customers':
    'modern-web-design-the-key-to-converting-visitors-into-customers',
  'modern-web-design-how-to-convert-visitors-into-customers-1784128744839':
    'modern-web-design-the-key-to-converting-visitors-into-customers',
  'responsive-web-design-the-key-to-converting-visitors-into-customers':
    'modern-web-design-the-key-to-converting-visitors-into-customers',
  'responsive-web-design-the-key-to-selling-on-every-device':
    'responsive-web-design-why-your-site-must-look-perfect-on-every-device',
  'software-trends-in-2026-what-you-need-to-know-for-your-business':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'the-5-tech-trends-that-will-transform-your-business-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'the-5-tech-trends-that-will-transform-your-business-in-2026-1784385835167':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'the-5-tech-trends-that-will-transform-your-business-in-2026-1787149413318':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'the-software-trends-that-will-transform-your-business-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'the-tech-trends-that-will-transform-your-business-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'the-technology-trends-that-will-transform-businesses-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  'why-your-smb-needs-a-mobile-app-in-2026':
    'how-to-choose-the-best-platform-for-mobile-app-development-in-2026',
  'why-your-smb-needs-a-mobile-app-in-2026-1781708631804':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  'why-your-smb-needs-a-mobile-app-in-2026-1783093749788':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  'why-your-smb-needs-a-professional-website-in-2026':
    'nextjs-in-2026-why-your-smb-must-modernize-its-website',
};
