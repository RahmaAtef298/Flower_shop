import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth'

const routes = [
    { path: '/', redirect: '/dashboard' },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { guestOnly: true, title: 'Sign in' },
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }, // unknown paths
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Only allow redirects to pages inside our own app
export function safeRedirect(value) {
    const isInternal =
        typeof value === 'string' &&
        value.startsWith('/') &&
        !value.startsWith('//') &&
        !value.startsWith('/\\')
    return isInternal ? value : '/dashboard'
}

// Navigation guard: runs before every route change
router.beforeEach(async (to) => {
    const auth = useAuth()
    await auth.ensureLoaded()

    if (to.meta.requiresAuth && !auth.user.value) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.guestOnly && auth.user.value) {
        return safeRedirect(to.query.redirect)
    }
})

// Page title per route
router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · Flower Shop` : 'Flower Shop'
})

// Session expired during use → back to login, remembering where the user was
window.addEventListener('auth:expired', () => {
    useAuth().clear()
    const current = router.currentRoute.value
    if (current.meta.requiresAuth) {
        router.push({ name: 'login', query: { redirect: current.fullPath } })
    }
})

export default router