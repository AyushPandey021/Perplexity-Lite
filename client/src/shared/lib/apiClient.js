const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = async (path, options = {}) => {
  let response
  const token = localStorage.getItem('token')

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
  } catch {
    throw new Error('Cannot connect to backend. Make sure the server is running on port 3000.')
  }

  const responseText = await response.text()
  let data = {}

  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: responseText }
    }
  }

  if (!response.ok) {
    const validationMessage = data.errors?.[0]?.msg
    const serverMessage = typeof data.message === 'string' ? data.message.trim() : ''
    const isProxyError =
      response.status >= 500 &&
      /proxy|ECONNREFUSED|backend|localhost:3000/i.test(serverMessage)

    if (isProxyError) {
      throw new Error('Backend is not reachable. Start the server on port 3000 and try again.')
    }

    if (!validationMessage && !serverMessage && [502, 503].includes(response.status)) {
      throw new Error('Could not send verification email. Check the server Gmail OAuth settings and try again.')
    }

    throw new Error(
      validationMessage ||
        serverMessage ||
        `Request failed with status ${response.status}`
    )
  }

  return data
}
