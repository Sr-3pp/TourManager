<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const { loginUser, fetchSession } = useAuth()
const seo = useSeo()

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const loginFields: AuthFormField[] = [
    {
        name: 'email',
        type: 'email',
        label: 'Correo electrónico',
        placeholder: 'Ingresa tu correo electrónico',
        required: true,
    },
    {
        name: 'password',
        type: 'password',
        label: 'Contraseña',
        placeholder: 'Ingresa tu contraseña',
        required: true,
    },
]

async function onSubmit(event: FormSubmitEvent<z.output<typeof loginSchema>>) {
    const { email, password } = event.data

    try {
        await loginUser(email, password)
        await fetchSession()
        await navigateTo('/profile')
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error)
    }
}

seo.noIndex()

useSeoMeta({
  title: `Iniciar sesión | ${seo.siteName.value}`,
  description: 'Accede a tu cuenta de Tour Manager.',
})
</script>

<template>
  <section aria-labelledby="login-heading">
    <UContainer class="py-8">
      <h1 id="login-heading" class="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <p class="text-gray-600 mb-4">Accede a tu cuenta.</p>

      <UAuthForm
        :schema="loginSchema"
        :fields="loginFields"
        title="Bienvenido de nuevo"
        description="Ingresa tus credenciales para continuar."
        icon="i-lucide-user"
        class="max-w-md"
        @submit="onSubmit"
      />
    </UContainer>
  </section>
</template>
