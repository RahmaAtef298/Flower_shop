<script setup>
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
    Chart as ChartJS, BarElement, ArcElement, CategoryScale,
    LinearScale, Tooltip, Legend,
} from 'chart.js'
import { money } from '../utils/format'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
    title: String,
    rows: { type: Array, required: true }, // [{ label, value }]
    type: { type: String, default: 'bar' }, // 'bar' | 'hbar' | 'doughnut'
})

const COLORS = ['#e8577d', '#f39bb4', '#7cc49a', '#f6c35b', '#8fa8e8', '#c49be0']

const data = computed(() => ({
    labels: props.rows.map((r) => r.label),
    datasets: [{
        data: props.rows.map((r) => r.value),
        backgroundColor: props.type === 'doughnut' ? COLORS : COLORS[0],
        borderRadius: props.type === 'doughnut' ? 0 : 6,
    }],
}))

const options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: props.type === 'hbar' ? 'y' : 'x',
    plugins: {
        legend: { display: props.type === 'doughnut', position: 'bottom' },
        tooltip: { callbacks: { label: (ctx) => money.format(ctx.raw) } },
    },
}))
</script>

<template>
    <section class="card">
        <h3>{{ title }}</h3>
        <div class="chart">
        <Doughnut v-if="type === 'doughnut'" :data="data" :options="options" />
        <Bar v-else :data="data" :options="options" />
        </div>
    </section>
</template>

<style scoped>
h3 { margin: 0 0 12px; font-size: 16px; }
.chart { height: 260px; position: relative; }
</style>