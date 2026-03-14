<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const { registerUser, loginUser } = useAuth()

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    verifyPassword: z.string().min(6),
}).refine((data) => data.password === data.verifyPassword, {
    message: "Passwords don't match",
    path: ['verifyPassword'],
})

const registerFields: AuthFormField[] = [
    {
        name: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
    },
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
        placeholder: 'Create a password',
        required: true,
    },
    {
        name: 'verifyPassword',
        type: 'password',
        label: 'Confirm Password',
        placeholder: 'Repeat your password',
        required: true,
    },
]

type RegisterSchema = z.output<typeof registerSchema>

function onSubmit(event: FormSubmitEvent<RegisterSchema>) {
    const { email, password, name } = event.data
    registerUser(email, password, name)
        .then(() => loginUser(email, password))
        .catch((error) => {
            console.error('Error during registration or login:', error)
        })
}
</script>

<template>
<UContainer class="py-8">
    <h1 class="text-2xl font-bold mb-4">Register</h1>
        <p class="text-gray-600 mb-4">Create your account to continue.</p>

        <UAuthForm
            :schema="registerSchema"
            :fields="registerFields"
            title="Create account"
            description="Fill in your details to get started."
            icon="i-lucide-user-plus"
            :submit="{ label: 'Create account' }"
            class="max-w-md"
            @submit="onSubmit"
        />
    </UContainer>
</template>