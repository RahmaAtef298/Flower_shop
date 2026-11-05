async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(body.error || `Request failed (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return body;
}

// Returns the user, or null if not logged in
export async function getMe() {
    try {
        return (await request("/auth/me")).user;
    } catch (e) {
        if (e.status === 401) return null;
        throw e;
    }
}

export async function login(username, password) {
    const body = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
    return body.user;
}

export async function logout() {
    await request("/auth/logout", { method: "POST" });
}
