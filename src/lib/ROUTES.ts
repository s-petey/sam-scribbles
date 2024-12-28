/* eslint-disable */
/**
 * This file was generated by 'vite-plugin-kit-routes'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

/**
 * PAGES
 */
const PAGES = {
  "/": `/`,
  "/about": `/about`,
  "/admin": `/admin`,
  "/admin/links": `/admin/links`,
  "/admin/links/[shortId]": (params: { shortId: (string | number) }) => {
    return `/admin/links/${params.shortId}`
  },
  "/admin/posts": `/admin/posts`,
  "/admin/posts/[slug]": (params: { slug: (string | number) }) => {
    return `/admin/posts/${params.slug}`
  },
  "/login": `/login`,
  "/posts": `/posts`,
  "/posts/[slug]": (params: { slug: (string | number) }) => {
    return `/posts/${params.slug}`
  },
  "/social": `/social`,
  "/tags": `/tags`
}

/**
 * SERVERS
 */
const SERVERS = {
  
}

/**
 * ACTIONS
 */
const ACTIONS = {
  "logout /": `/?/logout`,
  "create /admin/links": `/admin/links?/create`,
  "delete /admin/links": `/admin/links?/delete`,
  "update /admin/links/[shortId]": (params: { shortId: (string | number) }) => {
    return `/admin/links/${params.shortId}?/update`
  },
  "delete /admin/links/[shortId]": (params: { shortId: (string | number) }) => {
    return `/admin/links/${params.shortId}?/delete`
  },
  "syncPosts /admin/posts": `/admin/posts?/syncPosts`,
  "delete /admin/posts": `/admin/posts?/delete`,
  "default /admin/posts/[slug]": (params: { slug: (string | number) }) => {
    return `/admin/posts/${params.slug}`
  },
  "default /login": `/login`,
  "default /logout": `/logout`
}

/**
 * LINKS
 */
const LINKS = {
  
}

type ParamValue = string | number | undefined

/**
 * Append search params to a string
 */
export const appendSp = (sp?: Record<string, ParamValue | ParamValue[]>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''

  const params = new URLSearchParams()
  const append = (n: string, v: ParamValue) => {
    if (v !== undefined) {
      params.append(n, String(v))
    }
  }

  for (const [name, val] of Object.entries(sp)) {
    if (Array.isArray(val)) {
      for (const v of val) {
        append(name, v)
      }
    } else {
      append(name, val)
    }
  }

  const formatted = params.toString()
  if (formatted) {
    return `${prefix}${formatted}`
  }
  return ''
}

/**
 * get the current search params
 * 
 * Could be use like this:
 * ```
 * route("/cities", { page: 2 }, { ...currentSP() })
 * ```
 */ 
export const currentSp = () => {
  const params = new URLSearchParams(window.location.search)
  const record: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    record[key] = value
  }
  return record
}

// route function helpers
type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
type AllTypes = typeof AllObjs

export type Routes = keyof AllTypes extends `${string}/${infer Route}` ? `/${Route}` : keyof AllTypes
export const routes = [
	...new Set(Object.keys(AllObjs).map((route) => /^\/.*|[^ ]?\/.*$/.exec(route)?.[0] ?? route)),
] as Routes[]

/**
 * To be used like this: 
 * ```ts
 * import { route } from './ROUTES'
 * 
 * route('site_id', { id: 1 })
 * ```
 */
export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
  if (AllObjs[key] as any instanceof Function) {
    const element = (AllObjs as any)[key] as (...args: any[]) => string
    return element(...params)
  } else {
    return AllObjs[key] as string
  }
}

/**
* Add this type as a generic of the vite plugin `kitRoutes<KIT_ROUTES>`.
*
* Full example:
* ```ts
* import type { KIT_ROUTES } from '$lib/ROUTES'
* import { kitRoutes } from 'vite-plugin-kit-routes'
*
* kitRoutes<KIT_ROUTES>({
*  PAGES: {
*    // here, key of object will be typed!
*  }
* })
* ```
*/
export type KIT_ROUTES = {
  PAGES: { '/': never, '/about': never, '/admin': never, '/admin/links': never, '/admin/links/[shortId]': 'shortId', '/admin/posts': never, '/admin/posts/[slug]': 'slug', '/login': never, '/posts': never, '/posts/[slug]': 'slug', '/social': never, '/tags': never }
  SERVERS: Record<string, never>
  ACTIONS: { 'logout /': never, 'create /admin/links': never, 'delete /admin/links': never, 'update /admin/links/[shortId]': 'shortId', 'delete /admin/links/[shortId]': 'shortId', 'syncPosts /admin/posts': never, 'delete /admin/posts': never, 'default /admin/posts/[slug]': 'slug', 'default /login': never, 'default /logout': never }
  LINKS: Record<string, never>
  Params: { shortId: never, slug: never }
}
