const sumBy = (rows, key) => rows.reduce((total, row) => total + (row[key] || 0), 0)

// Group rows by a key and sum a value → [{ label, value }] sorted by value desc
function groupSum(rows, keyFn, valueKey) {
    const map = new Map()
    for (const row of rows) {
        const key = keyFn(row)
        map.set(key, (map.get(key) || 0) + (row[valueKey] || 0))
    }
    return [...map].map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
}

export function summary(invoices) {
    const total = sumBy(invoices, 'grand_total')
    const count = invoices.length
    const [top] = groupSum(invoices, (i) => i.customer, 'grand_total')
    return {
        total,
        count,
        average: count ? total / count : 0,
        topCustomer: top?.label ?? '—',
    }
}

export function salesByMonth(invoices) {
    const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' })
    return groupSum(invoices, (i) => i.posting_date.slice(0, 7), 'grand_total') // "2026-09"
        .sort((a, b) => a.label.localeCompare(b.label)) // chronological
        .map(({ label, value }) => ({ label: monthFmt.format(new Date(`${label}-01`)), value }))
}

export function topItems(lines, n = 5) {
    return groupSum(lines, (l) => l.item_code, 'amount').slice(0, n)
}

export function salesByGroup(lines) {
    return groupSum(lines, (l) => l.item_group || 'Other', 'amount')
}