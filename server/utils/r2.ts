import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const getR2Config = () => {
  const config = useRuntimeConfig();

  if (
    !config.r2AccountId ||
    !config.r2AccessKeyId ||
    !config.r2SecretAccessKey ||
    !config.r2BucketName
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Cloudflare R2 is not configured'
    });
  }

  return config;
};

export const createR2Client = () => {
  const config = getR2Config();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey
    }
  });
};

export const getR2BucketName = () => getR2Config().r2BucketName;

export const uploadFlyerObject = async (key: string, body: Uint8Array, contentType: string) => {
  const client = createR2Client();

  await client.send(new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable'
  }));

  return key;
};

export const getR2Object = async (key: string) => {
  const client = createR2Client();

  return client.send(new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key
  }));
};
