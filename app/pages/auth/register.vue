<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const { registerUser, loginUser, fetchSession } = useAuth()

const registerSchema = z.object({
    name: z.string().min(2),
    lastname: z.string().min(2),
    username: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    email: z.string().email(),
    password: z.string().min(6),
    verifyPassword: z.string().min(6),
}).refine((data) => data.password === data.verifyPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['verifyPassword'],
})

const registerFields: AuthFormField[] = [
    {
        name: 'name',
        type: 'text',
        label: 'Nombre',
        placeholder: 'Ingresa tu nombre',
        required: true,
    },
    {
        name: 'lastname',
        type: 'text',
        label: 'Apellidos',
        placeholder: 'Ingresa tus apellidos',
        required: true,
    },
    {
        name: 'username',
        type: 'text',
        label: 'Nombre de usuario',
        placeholder: 'elige-tu-usuario',
        required: true,
    },
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
        placeholder: 'Crea una contraseña',
        required: true,
    },
    {
        name: 'verifyPassword',
        type: 'password',
        label: 'Confirmar contraseña',
        placeholder: 'Repite tu contraseña',
        required: true,
    },
]

async function onSubmit(event: FormSubmitEvent<z.output<typeof registerSchema>>) {
    const { email, password, name, lastname, username } = event.data

    try {
        await registerUser(email, password, name, lastname, username)
        let session = await fetchSession()

        if (!session) {
            await loginUser(email, password)
            session = await fetchSession()
        }

        if (session) {
            await navigateTo('/profile')
        }
    } catch (error) {
        console.error('Error durante el registro o inicio de sesión:', error)
    }
}
</script>

<template>
  <section aria-labelledby="register-heading">
    <UContainer class="py-8 flex flex-col items-center">
      <h1 id="register-heading" class="text-2xl font-bold mb-4">Registro</h1>
      <p class="text-gray-600 mb-4">Crea tu cuenta para continuar.</p>

      <UAuthForm
        :schema="registerSchema"
        :fields="registerFields"
        title="Crear cuenta"
        description="Completa tus datos para comenzar."
        icon="i-lucide-user-plus"
        :submit="{ label: 'Crear cuenta' }"
        class="max-w-md"
        @submit="onSubmit"
      />
    </UContainer>
  </section>
</template>
