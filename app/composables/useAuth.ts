import { apiFetch } from '~~/app/utils/api'
import type { AuthSessionResponse } from '~~/types/auth'

export const useAuth = () => {
  const session = useState<AuthSessionResponse | null>('session', () => null)

  const registerUser = async (
    email: string,
    password: string,
    name: string,
    lastname?: string,
    username?: string,
  ) => {
    try {
      return await apiFetch('/api/auth/sign-up/email', {
        method: 'POST',
        body: {
          email,
          password,
          name,
          lastname,
          username,
        },
      })
    } catch (error) {
      console.error('Error registering user:', error)
      throw error
    }
  }

  const fetchSession = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (!force && session.value) {
      return session.value
    }

    try {
      const data = await apiFetch<AuthSessionResponse>('/api/auth/get-session')
      session.value = data
      return session.value
    } catch (error) {
      console.error('Error fetching session:', error)
      session.value = null
      return null
    }
  }

  const loginUser = async (email: string, password: string) => {
    try {
      const response = await apiFetch('/api/auth/sign-in/email', {
        method: 'POST',
        body: {
          email,
          password,
        },
      })

      await fetchSession({ force: true })

      return response
    } catch (error) {
      console.error('Error logging in user:', error)
      throw error
    }
  }

  const logoutUser = async () => {
    try {
      await apiFetch('/api/auth/sign-out', {
        method: 'POST',
        body: {},
      })
    } catch (error) {
      console.error('Error logging out user:', error)
      throw error
    } finally {
      session.value = null
    }
  }

  return {
    registerUser,
    loginUser,
    logoutUser,
    session,
    fetchSession,
  }
}
