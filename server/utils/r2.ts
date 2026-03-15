import type { H3Event } from 'h3';
import { setResponseHeaders, sendStream, createError } from 'h3';
import { Readable } from 'node:stream';

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import type { S3ClientConfig, PutObjectCommandInput } from '@aws-sdk/client-s3';

type R2Config = {
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  bucket?: string;
};

type RuntimeR2Config = {
  r2?: R2Config;
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2BucketName?: string;
};

const runtime = useRuntimeConfig() as RuntimeR2Config;
const nested = runtime.r2;
const accountId = String(runtime.r2AccountId || '').trim();

// Support both config styles:
// 1) runtimeConfig.r2.{endpoint,accessKey,secretKey,bucket}
// 2) flat runtimeConfig.{r2AccountId,r2AccessKeyId,r2SecretAccessKey,r2BucketName}
const r2: R2Config = {
  endpoint:
    nested?.endpoint ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
  accessKey: nested?.accessKey || runtime.r2AccessKeyId,
  secretKey: nested?.secretKey || runtime.r2SecretAccessKey,
  bucket: nested?.bucket || runtime.r2BucketName,
};

const isPrerender = process.env.NITRO_PRE_RENDER === '1' || process.env.NUXT_IS_PRERENDER === '1';
const hasR2 = Boolean(r2 && r2.endpoint && r2.accessKey && r2.secretKey && r2.bucket);

// If runtime config is missing or we're prerendering, avoid constructing
// a live S3 client which would error on empty bucket/credentials. We'll
// create a small wrapper that throws controlled errors or returns safe
// fallbacks for list/serve operations during prerender.
let s3: S3Client | null = null;
try {
  // Initialize S3 client only when R2 is fully configured. If we're
  // prerendering but R2 is configured (CI case), allow initialization so
  // real handlers can run; otherwise leave s3 null so we can short-circuit.
  if (hasR2) {
    // r2 is asserted present by hasR2
    const cfg: S3ClientConfig = {
      region: 'auto',
      endpoint: r2!.endpoint,
      credentials: {
        accessKeyId: r2!.accessKey as string,
        secretAccessKey: r2!.secretKey as string,
      },
    } as S3ClientConfig;

    s3 = new S3Client(cfg);
  }
} catch (e) {
  // Leave s3 as null; individual methods will handle null and either
  // return graceful fallbacks or throw createError when invoked at runtime.

  console.warn('R2 client not initialized:', (e as Error).message);
}

export function useHubBlob() {
  type FileEntry = { pathname: string; size?: number; lastModified?: Date };

  type PutBody = Blob | Uint8Array | Buffer | ReadableStream | ArrayBuffer | string;

  const getContentType = (body: PutBody): string | undefined => {
    if (body && typeof body === 'object') {
      // Blob-like
      const b = body as { type?: unknown };
      if (typeof b.type === 'string' && b.type.length) return b.type;
    }
    return undefined;
  };

  const list = async (params: {
    prefix: string;
    limit?: number;
  }): Promise<FileEntry[] | { error: string }> => {
    const { prefix, limit } = params;
    // If prerendering or s3 is not available, return an empty list to
    // avoid build failure.
    if (isPrerender || !s3 || !r2?.bucket) {
      return [];
    }

    const command = new ListObjectsV2Command({
      Bucket: r2.bucket,
      Prefix: prefix,
      ...(limit ? { MaxKeys: limit } : {}),
    });

    try {
      const response = await s3.send(command);
      const files: FileEntry[] =
        response.Contents?.map((obj) => ({
          pathname: obj.Key ?? '',
          size: obj.Size,
          lastModified: obj.LastModified,
        })) ?? [];

      return files;
    } catch (err) {
      console.error('Failed to list objects:', err);
      return { error: 'Could not fetch blobs' };
    }
  };

  const serve = async (event: H3Event, key: string): Promise<void> => {
    if (isPrerender) {
      // Avoid streaming binary data during prerender
      throw createError({ status: 404, statusText: 'Blob not available during prerender' });
    }

    if (!s3 || !r2?.bucket) {
      throw createError({ status: 500, statusText: 'Blob storage not configured' });
    }

    const command = new GetObjectCommand({
      Bucket: r2.bucket,
      Key: key,
    });

    try {
      const response = await s3.send(command);
      const body = response.Body as unknown;

      if (!body) {
        throw createError({ status: 404, statusText: 'Blob not found' });
      }

      setResponseHeaders(event, {
        'Content-Type': response.ContentType ?? 'application/octet-stream',
        'Content-Length': response.ContentLength?.toString() ?? '',
      });

      if (body instanceof Readable) {
        return sendStream(event, body);
      }

      if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) {
        return sendStream(event, body);
      }

      if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
        return sendStream(event, Readable.from([body]));
      }

      throw createError({ status: 500, statusText: 'Unsupported blob response body type' });
    } catch (err) {
      console.error('Error serving blob:', err);
      throw createError({ status: 404, statusText: 'Blob not found' });
    }
  };

  const del = async (key: string): Promise<{ success: true; message: string } | never> => {
    if (!s3 || !r2?.bucket) {
      throw createError({ status: 500, statusText: 'Blob storage not configured' });
    }

    const command = new DeleteObjectCommand({
      Bucket: r2.bucket,
      Key: key,
    });

    try {
      await s3.send(command);
      return { success: true, message: `Deleted ${key}` };
    } catch (err) {
      console.error('Error deleting blob:', err);
      throw createError({ status: 500, statusText: 'Failed to delete blob' });
    }
  };

  const put = async (
    key: string,
    file: PutBody,
    options: { addRandomSuffix?: boolean; prefix: string; contentType?: string },
  ): Promise<{ success: true; message: string; pathname: string } | never> => {
    if (!s3 || !r2?.bucket) {
      throw createError({ status: 500, statusText: 'Blob storage not configured' });
    }

    const { prefix, contentType } = options;

    const input: PutObjectCommandInput = {
      Bucket: r2.bucket,
      Key: `${prefix}/${key}`,
      Body: file as PutObjectCommandInput['Body'],
      ContentType: contentType ?? getContentType(file),
    };

    const command = new PutObjectCommand(input);

    try {
      await s3.send(command);
      return { success: true, message: `Uploaded ${key}`, pathname: `${prefix}/${key}` };
    } catch (err) {
      console.error('Error uploading blob:', err);
      throw createError({ status: 500, statusText: 'Failed to upload blob' });
    }
  };

  const ensureBlob = (
    file: { size: number; type?: string },
    { maxSize, types }: { maxSize: number; types: string[] },
  ) => {
    if (file.size > maxSize) throw createError({ status: 400, statusText: 'File too large' });
    if (types.length > 0 && file.type && !types.includes(file.type))
      throw createError({ status: 400, statusText: 'Invalid file type' });
  };

  const mkdir = async (dirPath: string): Promise<{ success: true; pathname: string }> => {
    if (!s3 || !r2?.bucket) {
      throw createError({ status: 500, statusText: 'Blob storage not configured' });
    }

    const normalized = dirPath
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean)
      .join('/');

    if (!normalized.length) {
      throw createError({ status: 400, statusText: 'Directory name is required' });
    }

    const key = normalized.endsWith('/') ? normalized : `${normalized}/`;

    const command = new PutObjectCommand({
      Bucket: r2.bucket,
      Key: key,
      Body: '',
      ContentType: 'application/x-directory',
    });

    try {
      await s3.send(command);
      return { success: true, pathname: key };
    } catch (err) {
      console.error('Error creating directory:', err);
      throw createError({ status: 500, statusText: 'Failed to create directory' });
    }
  };

  const delPrefix = async (prefix: string): Promise<{ success: true; deleted: number }> => {
    if (!s3 || !r2?.bucket) {
      throw createError({ status: 500, statusText: 'Blob storage not configured' });
    }

    const normalized = prefix.replace(/^\/+|\/+$/g, '');
    if (!normalized.length) {
      throw createError({ status: 400, statusText: 'Invalid directory path' });
    }

    let continuationToken: string | undefined;
    let deleted = 0;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: r2.bucket,
        Prefix: `${normalized}/`,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3.send(listCommand);
      const keys =
        listResponse.Contents?.map((obj) => obj.Key).filter((k): k is string => Boolean(k)) ?? [];

      if (keys.length) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: r2.bucket,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
            Quiet: true,
          },
        });
        await s3.send(deleteCommand);
        deleted += keys.length;
      }

      continuationToken = listResponse.IsTruncated ? listResponse.NextContinuationToken : undefined;
    } while (continuationToken);

    const folderKey = normalized.endsWith('/') ? normalized : `${normalized}/`;
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: r2.bucket,
          Key: folderKey,
        }),
      );
    } catch {
      // ignore if placeholder wasn't present
    }

    return { success: true, deleted };
  };

  return {
    list,
    serve,
    put,
    del,
    ensureBlob,
    mkdir,
    delPrefix,
  };
}
