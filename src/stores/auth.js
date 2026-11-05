import { ref } from 'vue'
import * as api from '../api/auth'

// Module-level state: shared by every component that calls useAuth()
const user = ref(null)
let loadPromise = null

export function useAuth() {
    // Ask the server "who am I?" only once per page load
    function ensureLoaded() {
        loadPromise ??= api
            .getMe()
            .then((u) => { user.value = u })
            .catch(() => { user.value = null })
        return loadPromise
    }

    async function login(username, password) {
        user.value = await api.login(username, password)
    }

    async function logout() {
        await api.logout().catch(() => { })
        user.value = null
    }

    function clear() {
        user.value = null
    }

    return { user, ensureLoaded, login, logout, clear }
}