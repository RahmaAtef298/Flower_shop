<script setup>
import { ref, computed, onMounted } from 'vue'
import { getInvoices, getInvoiceLines } from '../api/erp'
import { salesByMonth, topItems, salesByGroup } from '../utils/stats'
import StatCards from './StatCards.vue'
import ChartCard from './ChartCard.vue'
import ChatPanel from './ChatPanel.vue'
import InvoicesTable from './InvoicesTable.vue'

const invoices = ref([])
const lines = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    try {
        ;[invoices.value, lines.value] = await Promise.all([getInvoices(), getInvoiceLines()])
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})

const monthly = computed(() => salesByMonth(invoices.value))
const top = computed(() => topItems(lines.value))
const groups = computed(() => salesByGroup(lines.value))
</script>

<template>
    <div class="dashboard">
        <p v-if="loading">Loading dashboard…</p>
        <p v-else-if="error" class="error">⚠️ {{ error }}</p>

        <template v-else>
        <StatCards :invoices="invoices" />

        <div class="charts">
            <ChartCard title="Sales per Month" :rows="monthly" type="bar" />
            <ChartCard title="Top 5 Flowers" :rows="top" type="hbar" />
            <ChartCard title="Sales by Category" :rows="groups" type="doughnut" />
        </div>

        <InvoicesTable :invoices="invoices" />
        </template>

        <ChatPanel />
    </div>
</template>

<style scoped>
.dashboard { display: grid; gap: 24px; padding-bottom: 72px; /* room for the chat button */ }
.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
</style>