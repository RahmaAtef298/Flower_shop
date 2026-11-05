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
                <td>{{ inv.name }}</td>
                <td>{{ inv.customer }}</td>
                <td>{{ date.format(new Date(inv.posting_date)) }}</td>
                <td><span class="badge" :class="inv.status.toLowerCase()">{{ inv.status }}</span></td>
                <td class="num">{{ money.format(inv.grand_total) }}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.card-header h2 { margin: 0; }
.card-header p { margin: 0; color: #666; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
th { font-size: 13px; color: #888; text-transform: uppercase; }
.num { text-align: right; }
.badge { padding: 2px 10px; border-radius: 999px; font-size: 12px; background: #eee; }
.badge.paid { background: #e3f6e8; color: #1e7d3a; }
.badge.unpaid, .badge.overdue { background: #fdecea; color: #b42318; }
.error { color: #b42318; }
</style>