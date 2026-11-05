export async function askAI(messages) {
    const res = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    })

    const body = await res.json().catch(() => ({}))
    if (res.status === 401) window.dispatchEvent(new Event('auth:expired'))
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
    return body.answer
}