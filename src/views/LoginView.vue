<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../stores/auth'
import { safeRedirect } from '../router'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

async function submit() {
    if (loading.value) return
    error.value = null
    loading.value = true
    try {
        await auth.login(username.value.trim(), password.value)
        password.value = ''
        router.replace(safeRedirect(route.query.redirect))
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <form class="card login" @submit.prevent="submit">
        <div class="logo">🌸</div>
        <h1>Flower Shop Dashboard</h1>
        <p class="hint">Sign in with your ERPNext account</p>

        <label>
            Email or username
            <input v-model="username" type="text" autocomplete="username" required autofocus />
        </label>

        <label>
            Password
            <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="error" class="error">⚠️ {{ error }}</p>

        <button type="submit" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
        </form>
    </div>
</template>

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
.login { width: 100%; max-width: 360px; display: grid; gap: 14px; text-align: center; }
.logo { font-size: 40px; }
h1 { margin: 0; font-size: 22px; }
.hint { margin: 0; color: #888; font-size: 14px; }
label { display: grid; gap: 6px; text-align: left; font-size: 14px; color: #555; }
input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
input:focus { outline: 2px solid #f3c1d0; border-color: #e8577d; }
button {
    padding: 12px; border: none; border-radius: 10px; background: #e8577d; color: #fff;
    font-weight: 600; font-size: 15px; cursor: pointer;
}
button:disabled { opacity: .6; cursor: not-allowed; }
.error { margin: 0; color: #b42318; font-size: 14px; }
</style>