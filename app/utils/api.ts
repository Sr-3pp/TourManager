type BaseFetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

type ApiFetchOptions = Omit<BaseFetchOptions, 'headers'> & {
  headers?: HeadersInit
}

export function getAuthFetchHeaders() {
  return import.meta.server ? useRequestHeaders(['cookie']) : undefined
}

export function apiFetch<T>(request: Parameters<typeof $fetch<T>>[0], options: ApiFetchOptions = {}) {
  return $fetch<T>(request, {
    credentials: 'include',
    headers: {
      ...getAuthFetchHeaders(),
      ...options.headers,
    },
    ...options,
  })
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    if ('data' in error && error.data && typeof error.data === 'object' && 'statusMessage' in error.data) {
      const dataMessage = error.data.statusMessage
      if (typeof dataMessage === 'string' && dataMessage.trim()) {
        return dataMessage
      }
    }

    if ('statusMessage' in error && typeof error.statusMessage === 'string' && error.statusMessage.trim()) {
      return error.statusMessage
    }

    if ('message' in error && typeof error.message === 'string' && error.message.trim()) {
      return error.message
    }
  }

  return fallback
}
