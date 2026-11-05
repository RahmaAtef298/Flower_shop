<script setup>
import { computed } from 'vue'
import { money, shortDate as date } from '../utils/format'

const props = defineProps({ invoices: { type: Array, required: true } })
const totalSales = computed(() =>
    props.invoices.reduce((sum, inv) => sum + inv.grand_total, 0)
)
</script>

<template>
    <section class="card">
        <header class="card-header">
            <h2>Sales Invoices</h2>
            <p>
                {{ invoices.length }} invoices · {{ money.format(totalSales) }}
            </p>
        </header>

        <p v-if="!invoices.length">No submitted invoices yet.</p>

        <table v-else>
            <thead>
                <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th class="num">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="inv in invoices" :key="inv.name">
                <td class="invoice">{{ inv.name }}</td>
                <td class="customer">{{ inv.customer }}</td>
                <td class="date">{{ date.format(new Date(inv.posting_date)) }}</td>
                <td class="status"><span class="badge" :class="inv.status.toLowerCase()">{{ inv.status }}</span></td>
                <td class="num total">{{ money.format(inv.grand_total) }}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<style scoped>
.card-header { display: flex; flex-wrap: wrap; gap: 4px 16px; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.card-header h2 { margin: 0; }
.card-header p { margin: 0; color: #666; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
th { font-size: 13px; color: #888; text-transform: uppercase; }
.num { text-align: right; white-space: nowrap; }
.date, .status { white-space: nowrap; }
.badge { padding: 2px 10px; border-radius: 999px; font-size: 12px; background: #eee; }
.badge.paid { background: #e3f6e8; color: #1e7d3a; }
.badge.unpaid, .badge.overdue { background: #fdecea; color: #b42318; }
.error { color: #b42318; }

/* Phones: each row becomes a compact card instead of a squeezed table */
@media (max-width: 640px) {
    thead { display: none; }
    table, tbody { display: block; }
    tr {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas:
            "invoice  total"
            "customer customer"
            "date     status";
        gap: 4px 12px;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
    }
    td { padding: 0; border: none; }
    .invoice { grid-area: invoice; font-weight: 600; overflow-wrap: anywhere; }
    .total { grid-area: total; font-weight: 600; }
    .customer { grid-area: customer; }
    .date { grid-area: date; font-size: 14px; color: #888; }
    .status { grid-area: status; text-align: right; }
}
</style>