import type { FetchOptions } from 'ofetch'

export type ApiFetchOptions = Omit<FetchOptions<'json'>, 'headers'> & {
  headers?: HeadersInit
}
