
// Generic helper: GET /api/resource/<doctype> with options
async function getList(
    doctype, {
        fields,
        filters = [],
        orderBy,
        limit = 0
    } = {}
) {
    const params = new URLSearchParams({
        fields: JSON.stringify(fields),
        filters: JSON.stringify(filters),
        limit_page_length: String(limit),
    });
    if (orderBy) params.set("order_by", orderBy);

    const res = await fetch(
        `/api/resource/${encodeURIComponent(doctype)}?${params}`
    );
    if (res.status === 401) window.dispatchEvent(new Event('auth:expired'))
    if (!res.ok) throw new Error(`ERPNext error (${doctype}): ${res.status}`);

    const {
        data
    } = await res.json();
    return data;
}

const SUBMITTED = [
    ["docstatus", "=", 1]
];
const LINE = "`tabSales Invoice Item`";

// One row per invoice
export function getInvoices() {
    return getList("Sales Invoice", {
        fields: ["name", "customer", "posting_date", "grand_total", "status"],
        filters: SUBMITTED,
        orderBy: "posting_date desc",
    });
}

// One row per invoice LINE (joined with the child table)
export function getInvoiceLines() {
    return getList("Sales Invoice", {
        fields: [
            "name",
            "posting_date",
            `${LINE}.item_code`,
            `${LINE}.item_group`,
            `${LINE}.qty`,
            `${LINE}.amount`,
        ],
        filters: SUBMITTED,
    });
}
