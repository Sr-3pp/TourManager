import { getR2Object } from '~~/server/utils/r2';

const PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" fill="#ddd" font-size="14" dominant-baseline="middle" text-anchor="middle">placeholder</text></svg>';

export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event);
  const key = String(pathname || '').trim().replace(/^\/+/, '');

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Blob path is required'
    });
  }

  try {
    const object = await getR2Object(key);

    if (!object.Body) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Blob not found'
      });
    }

    if (object.ContentType) {
      setResponseHeader(event, 'Content-Type', object.ContentType);
    }

    if (object.ETag) {
      setResponseHeader(event, 'ETag', object.ETag);
    }

    setResponseHeader(
      event,
      'Cache-Control',
      object.CacheControl || 'public, max-age=31536000, immutable'
    );

    return object.Body.transformToWebStream();
  } catch {
    setResponseHeader(event, 'Content-Type', 'image/svg+xml');
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300');
    return PLACEHOLDER;
  }
});
