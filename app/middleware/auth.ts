export default defineNuxtRouteMiddleware(async () => {
  const { fetchSession, session } = useAuth()

  if (!session.value) {
    await fetchSession()
  }

  if (!session.value) {
    return navigateTo('/auth/login')
  }
})