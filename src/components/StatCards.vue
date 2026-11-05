<script setup>
import { computed } from 'vue'
import { summary } from '../utils/stats'
import { money } from '../utils/format'

const props = defineProps({ invoices: { type: Array, required: true } })
const s = computed(() => summary(props.invoices))
</script>

<template>
    <div class="stats">
        <div class="card stat">
        <span>Total Sales</span>
        <strong>{{ money.format(s.total) }}</strong>
        </div>
        <div class="card stat">
        <span>Invoices</span>
        <strong>{{ s.count }}</strong>
        </div>
        <div class="card stat">
        <span>Avg. Order</span>
        <strong>{{ money.format(s.average) }}</strong>
        </div>
        <div class="card stat">
        <span>Top Customer</span>
        <strong class="small">{{ s.topCustomer }}</strong>
        </div>
    </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.stat span { display: block; font-size: 13px; color: #888; margin-bottom: 6px; }
.stat strong { font-size: 24px; }
.stat strong.small { font-size: 18px; }
</style>