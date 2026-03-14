// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? process.env.NUXT_BETTER_AUTH_SECRET ?? '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID ?? process.env.NUXT_R2_ACCESS_KEY_ID ?? '',
    r2AccountId: process.env.R2_ACCOUNT_ID ?? process.env.NUXT_R2_ACCOUNT_ID ?? '',
    r2BucketName: process.env.R2_BUCKET_NAME ?? process.env.NUXT_R2_BUCKET_NAME ?? '',
    r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? process.env.NUXT_R2_PUBLIC_BASE_URL ?? '',
    r2SecretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY ?? process.env.NUXT_R2_SECRET_ACCESS_KEY ?? '',
    mongoUri: process.env.NUXT_MONGODB_URI || '',
    mongoDbName: process.env.NUXT_MONGODB_DB_NAME || ''
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
})