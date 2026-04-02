// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? process.env.NUXT_BETTER_AUTH_SECRET ?? '',
    betterAuthUrl:
      process.env.BETTER_AUTH_URL ??
      process.env.NUXT_BETTER_AUTH_URL ??
      process.env.NUXT_PUBLIC_BETTER_AUTH_URL ??
      '',
    betterAuthAllowedHosts:
      process.env.BETTER_AUTH_ALLOWED_HOSTS ?? process.env.NUXT_BETTER_AUTH_ALLOWED_HOSTS ?? '',
    betterAuthTrustedOrigins:
      process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.NUXT_BETTER_AUTH_TRUSTED_ORIGINS ?? '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID ?? process.env.NUXT_R2_ACCESS_KEY_ID ?? '',
    r2AccountId: process.env.R2_ACCOUNT_ID ?? process.env.NUXT_R2_ACCOUNT_ID ?? '',
    r2BucketName: process.env.R2_BUCKET_NAME ?? process.env.NUXT_R2_BUCKET_NAME ?? '',
    r2SecretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY ?? process.env.NUXT_R2_SECRET_ACCESS_KEY ?? '',
    mongoUri: process.env.NUXT_MONGODB_URI || '',
    mongoDbName: process.env.NUXT_MONGODB_DB_NAME || '',
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME ?? 'Tour Manager',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      defaultSeoDescription:
        process.env.NUXT_PUBLIC_DEFAULT_SEO_DESCRIPTION ??
        'Descubre tours destacados, organizadores y experiencias de viaje en Tour Manager.',
      defaultOgImage: process.env.NUXT_PUBLIC_DEFAULT_OG_IMAGE ?? '/og/default.svg',
    },
  },

  modules: [
    '@nuxt/a11y',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'es-MX',
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:locale', content: 'es_MX' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})
