type HttpMethod
  = 'GET'
    | 'HEAD'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'get'
    | 'head'
    | 'patch'
    | 'post'
    | 'put'
    | 'delete'
    | 'connect'
    | 'options'
    | 'trace'

export type ApiFetchOptions = Omit<NonNullable<Parameters<typeof $fetch>[1]>, 'headers' | 'method'> & {
  headers?: HeadersInit
  method?: HttpMethod
}
