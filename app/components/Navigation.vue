<script setup lang="ts">
const { session, fetchSession } = useAuth()

await fetchSession()

const user = computed(() => session.value?.user || null)

</script>

<template>
    <header>
        <nav class="bg-gray-800 text-white p-4">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-xl font-bold">Tour Manager</h1>
                <ul class="flex space-x-4">
                    <li><NuxtLink to="/">Home</NuxtLink></li>
                    <li v-if="!user"><NuxtLink to="/auth/login">Login</NuxtLink></li>
                    <li v-if="user"><NuxtLink to="/panel/users">Users</NuxtLink></li>
                    <li v-if="user"><NuxtLink to="/profile">Profile</NuxtLink></li>
                </ul>
                <span>
                    {{ user ? `Logged in as ${user.name}` : 'Not logged in' }}
                </span>
            </div>
        </nav>
    </header>
</template>
