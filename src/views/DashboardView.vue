<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import Dashboard from '../components/Dashboard.vue'

const router = useRouter()
const { user, logout } = useAuth()

async function onLogout() {
    await logout()
    router.replace({ name: 'login' })
}
</script>

<template>
    <main class="page">
        <header class="topbar">
        <h1>🌸 Flower Shop Dashboard</h1>
        <div class="user">
            <span>{{ user?.fullName }}</span>
            <button @click="onLogout">Log out</button>
        </div>
        </header>
        <Dashboard />
    </main>
</template>