import type { H3Event } from 'h3';
import { setResponseHeaders, sendStream, createError } from 'h3';
import { Readable } from 'node:stream';

import {
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getR2Client } from '~~/server/utils/r2-client'
import { getR2Config } from '~~/server/utils/r2-config'
import type { FileEntry, PutBody } from '~~/types/server';

export function useHubBlob() {
  const { isPrerender, r2 } = getR2Config()
  const s3 = getR2Client()

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
