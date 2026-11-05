import express from 'express'
import session from 'express-session'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRouter, { requireAuth } from './auth.js'
import aiRouter from './ai.js'

const { ERP_URL, SESSION_SECRET, NODE_ENV, PORT = 3000 } = process.env
const isProd = NODE_ENV === 'production'

// Fail fast if configuration is missing
if (!ERP_URL || !SESSION_SECRET) {
    console.error('❌ Missing ERP_URL or SESSION_SECRET')
    process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const ALLOWED_DOCTYPES = new Set(['Sales Invoice', 'Customer', 'Item'])

const app = express()
app.disable('x-powered-by')
if (isProd) app.set('trust proxy', 1) // behind Nginx / a cloud load balancer with HTTPS

// Sessions: the browser only gets a signed, httpOnly cookie
app.use(
    session({
        name: 'flower.sid', // different from ERPNext's "sid" (cookies are shared across localhost ports)
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false, // no session until the user logs in
        cookie: {
            httpOnly: true, // JavaScript can't read it → safe from XSS theft
            sameSite: 'lax', // not sent on cross-site POSTs → basic CSRF protection
            secure: isProd, // HTTPS only in production
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
        },
    })
)

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/auth', authRouter)
app.use('/ai', requireAuth, aiRouter)

// Guard: logged in, read-only, allowed DocTypes only
app.use('/api', requireAuth, (req, res, next) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'This API is read-only' })
    }
    const match = req.path.match(/^\/resource\/([^/]+)/)
    const doctype = match && decodeURIComponent(match[1])
    if (!ALLOWED_DOCTYPES.has(doctype)) {
        return res.status(403).json({ error: 'Not allowed' })
    }
    next()
})

// Forward to ERPNext AS THE LOGGED-IN USER
app.use(
    createProxyMiddleware({
        target: ERP_URL,
        changeOrigin: true,
        pathFilter: '/api',
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.removeHeader('cookie') // drop everything the browser sent
                proxyReq.setHeader('Cookie', `sid=${req.session.erp.sid}`) // add only the user's ERPNext session
            },
        },
    })
)

app.use(express.static(DIST))

// SPA fallback: let Vue Router handle /login, /dashboard, etc.
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, () => {
    console.log(`🌸 Dashboard server running on http://localhost:${PORT}`)
})