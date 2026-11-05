import express, { Router } from 'express'
import rateLimit from 'express-rate-limit'

const { ERP_URL } = process.env
const REQUIRED_ROLE = process.env.DASHBOARD_ROLE || 'Dashboard Reader'
const RECHECK_MS = 5 * 60 * 1000 // re-verify access every 5 minutes

const router = Router()

// Slow down password guessing: 10 attempts per 15 minutes per visitor
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again later.' },
})

// ---------- Helpers ----------

// Read ERPNext's "sid" from its Set-Cookie response headers
function extractSid(erpRes) {
    for (const cookie of erpRes.headers.getSetCookie()) {
        const match = cookie.match(/^sid=([^;]+)/)
        if (match && match[1] !== 'Guest') return match[1]
    }
    return null
}

// Ask ERPNext (via our Server Script) who this session belongs to and its roles
async function getUserInfo(sid) {
    const res = await fetch(`${ERP_URL}/api/method/get_my_roles`, {
        headers: { Cookie: `sid=${sid}`, Accept: 'application/json' },
    })
    if (!res.ok) return null // session expired, or the server script is missing
    const { message } = await res.json()
    return message // { user, roles }
}

const hasAccess = (info) => Array.isArray(info?.roles) && info.roles.includes(REQUIRED_ROLE)

// End the ERPNext session (fire and forget)
function endErpSession(sid) {
    fetch(`${ERP_URL}/api/method/logout`, { headers: { Cookie: `sid=${sid}` } }).catch(() => { })
}

// ---------- Middleware: logged in AND still has the role ----------
export async function requireAuth(req, res, next) {
    const erp = req.session.erp
    if (!erp) return res.status(401).json({ error: 'Not logged in' })

    // Roles can change after login, so re-check every few minutes
    if (Date.now() - erp.checkedAt > RECHECK_MS) {
        try {
            const info = await getUserInfo(erp.sid)
            if (!hasAccess(info)) {
                return req.session.destroy(() =>
                    res.status(401).json({ error: 'Session expired or access removed' })
                )
            }
            erp.checkedAt = Date.now()
        } catch (err) {
            console.error('Access check error:', err)
            return res.status(502).json({ error: 'Login service is unavailable' })
        }
    }
    next()
}

// ---------- POST /auth/login ----------
router.post('/login', loginLimiter, express.json({ limit: '5kb' }), async (req, res) => {
    const { username, password } = req.body ?? {}
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
    }

    try {
        // 1. Check the password with ERPNext
        const erpRes = await fetch(`${ERP_URL}/api/method/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ usr: username, pwd: password }),
        })

        const sid = erpRes.ok ? extractSid(erpRes) : null
        if (!sid) return res.status(401).json({ error: 'Invalid username or password' })

        const body = await erpRes.json()

        // 2. Check the role
        const info = await getUserInfo(sid)
        if (!info) {
            endErpSession(sid)
            console.error('❌ Could not read roles. Is the "get_my_roles" Server Script set up and enabled?')
            return res.status(502).json({ error: 'Could not verify your access. Please try again later.' })
        }
        if (!hasAccess(info)) {
            endErpSession(sid) // don't leave an unused ERPNext session behind
            return res.status(403).json({ error: "Your account doesn't have access to this dashboard." })
        }

        // 3. Create our own session (new id to prevent session fixation)
        const fullName = body.full_name || info.user
        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: 'Login failed' })
            req.session.erp = { sid, user: info.user, fullName, checkedAt: Date.now() }
            res.json({ user: { username: info.user, fullName } })
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(502).json({ error: 'Login service is unavailable' })
    }
})

// ---------- GET /auth/me ----------
// Called on every page load: also re-checks the session and the role
router.get('/me', async (req, res) => {
    const erp = req.session.erp
    if (!erp) return res.status(401).json({ error: 'Not logged in' })

    try {
        const info = await getUserInfo(erp.sid)
        if (!hasAccess(info)) {
            return req.session.destroy(() =>
                res.status(401).json({ error: 'Session expired or access removed' })
            )
        }
        erp.checkedAt = Date.now()
        res.json({ user: { username: erp.user, fullName: erp.fullName } })
    } catch (err) {
        console.error('Session check error:', err)
        res.status(502).json({ error: 'Login service is unavailable' })
    }
})

// ---------- POST /auth/logout ----------
router.post('/logout', (req, res) => {
    const sid = req.session.erp?.sid
    if (sid) endErpSession(sid)
    req.session.destroy(() => {
        res.clearCookie('flower.sid')
        res.json({ ok: true })
    })
})

export default router