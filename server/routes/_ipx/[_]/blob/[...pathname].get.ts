import { useHubBlob } from "~~/server/utils/r2";

export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event);
  const key = String(pathname || '').trim().replace(/^\/+/, '');
  const placeholder =
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" fill="#ddd" font-size="14" dominant-baseline="middle" text-anchor="middle">placeholder</text></svg>';

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Blob path is required',
    });
  }

  try {
    return await useHubBlob().serve(event, key);
  } catch (_err) {
    void _err;
    try {
      setResponseHeader(event, 'Content-Type', 'image/svg+xml');
      setResponseHeader(event, 'Cache-Control', 'public, max-age=300');
    } catch {
      // ignore
    }
    return placeholder;
  }
});