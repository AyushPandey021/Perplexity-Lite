import { apiClient } from '../../../shared/lib/apiClient'

export const loginUser = (payload) =>
  apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const registerUser = (payload) =>
  apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getCurrentUser = () => apiClient('/auth/get-me')

export const logoutUser = () =>
  apiClient('/auth/logout', {
    method: 'POST',
  })
