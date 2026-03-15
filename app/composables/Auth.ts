export const useAuth = () => {
    const session = useState<{ user: { name: string; email: string, level: number }, session: {} } | null>('session', () => null)

    const registerUser = async (email: string, password: string, name: string) => {
        try {
            return await $fetch('/api/auth/sign-up/email', {
                method: 'POST',
                body: {
                    email,
                    password,
                    name,
                },
            })
        } catch (error) {
            console.error('Error registering user:', error)
            throw error
        }
    }

    const loginUser = async (email: string, password: string) => {
        try {
            const response = await $fetch('/api/auth/sign-in/email', {
                method: 'POST',
                body: {
                    email,
                    password,
                },
            })

            await fetchSession()

            return response
        } catch (error) {
            console.error('Error logging in user:', error)
            throw error
        }
    }

    const fetchSession = async () => {
        if (session.value) {
            return session.value
        }
        
        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
            const data = await $fetch<{ user: { name: string; email: string, level: number }, session: {} }>('/api/auth/get-session', {
                credentials: 'include',
                headers,
            })
            session.value = data
            return session.value
        } catch (error) {
            console.error('Error fetching session:', error)
            session.value = null
            return null
        }
    }

    return {
        registerUser,
        loginUser,
        session,
        fetchSession,
    }
}
