<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import Dashboard from '../components/Dashboard.vue'
import UserMenu from '../components/UserMenu.vue'

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
        <UserMenu :user="user" @logout="onLogout" />
        </header>
        <Dashboard />
    </main>
</template>