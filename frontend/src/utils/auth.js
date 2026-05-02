const ADMIN_AUTH_KEY = 'aseman_admin_auth'

export const login = (username, password) => {
  if (username === 'admin' && password === '1234') {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({ username, role: 'admin' }))
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem(ADMIN_AUTH_KEY)
}

export const isAuthenticated = () => {
  return localStorage.getItem(ADMIN_AUTH_KEY) !== null
}

export const getCurrentAdmin = () => {
  const stored = localStorage.getItem(ADMIN_AUTH_KEY)
  return stored ? JSON.parse(stored) : null
}
