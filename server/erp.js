const { ERP_URL } = process.env

export async function getList(sid, doctype, { fields, filters = [], limit = 0 } = {}) {
    const params = new URLSearchParams({
        fields: JSON.stringify(fields),
        filters: JSON.stringify(filters),
        limit_page_length: String(limit),
    })

    const res = await fetch(`${ERP_URL}/api/resource/${encodeURIComponent(doctype)}?${params}`, {
        headers: { Cookie: `sid=${sid}`, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`ERPNext error (${doctype}): ${res.status}`)

    const { data } = await res.json()
    return data
}