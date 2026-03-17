<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const { loginUser, fetchSession } = useAuth()

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const loginFields: AuthFormField[] = [
    {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
    },
    {
        name: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        required: true,
    },
]

type LoginSchema = z.output<typeof loginSchema>

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
    const { email, password } = event.data

    try {
        await loginUser(email, password)
        await fetchSession()
        await navigateTo('/profile')
    } catch (error) {
        console.error('Error during login:', error)
    }
}
</script>

<template>
    <UContainer class="py-8">
        <h1 class="text-2xl font-bold mb-4">Login</h1>
        <p class="text-gray-600 mb-4">Sign in to your account.</p>

        <UAuthForm
            :schema="loginSchema"
            :fields="loginFields"
            title="Welcome back"
            description="Enter your credentials to continue."
            icon="i-lucide-user"
            class="max-w-md"
            @submit="onSubmit"
        />
    </UContainer>
</template>
