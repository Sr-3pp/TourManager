import type { R2Config, RuntimeR2Config } from '~~/types/server'

export function getR2Config() {
  const runtime = useRuntimeConfig() as RuntimeR2Config
  const nested = runtime.r2
  const accountId = String(runtime.r2AccountId || '').trim()

  const r2: R2Config = {
    endpoint:
      nested?.endpoint
      || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
    accessKey: nested?.accessKey || runtime.r2AccessKeyId,
    secretKey: nested?.secretKey || runtime.r2SecretAccessKey,
    bucket: nested?.bucket || runtime.r2BucketName,
  }

  return {
    accountId,
    runtime,
    r2,
    isPrerender: process.env.NITRO_PRE_RENDER === '1' || process.env.NUXT_IS_PRERENDER === '1',
    hasR2: Boolean(r2.endpoint && r2.accessKey && r2.secretKey && r2.bucket),
  }
}
