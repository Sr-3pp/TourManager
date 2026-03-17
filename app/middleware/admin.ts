export default defineNuxtRouteMiddleware(async () => {
  const { fetchSession, session } = useAuth()

  if (!session.value) {
    await fetchSession()
  }

  if (!session.value) {
    return navigateTo('/auth/login')
  }

  console.log('User level:', session.value.user)

  if (session.value.user.level !== 3) {
    return navigateTo('/')
  }
})