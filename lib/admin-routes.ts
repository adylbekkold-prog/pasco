export const ADMIN_BASE_PATH = '/sersdp'
export const ADMIN_INTERNAL_BASE_PATH = '/admin'
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`

export function adminPath(path = '') {
  if (!path || path === '/') return ADMIN_BASE_PATH
  return `${ADMIN_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}

export function normalizeAdminPath(value: string) {
  if (value === ADMIN_INTERNAL_BASE_PATH) return ADMIN_BASE_PATH
  if (value.startsWith(`${ADMIN_INTERNAL_BASE_PATH}/`)) {
    return `${ADMIN_BASE_PATH}${value.slice(ADMIN_INTERNAL_BASE_PATH.length)}`
  }
  return value
}
