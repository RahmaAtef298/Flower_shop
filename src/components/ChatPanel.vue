<script setup>
import { ref, nextTick } from 'vue'
import { askAI } from '../api/ai'

const SUGGESTIONS = [
    'Which customer spent the most?',
    'What are my top 3 flowers by revenue?',
    'Compare sales between the last two months',
    'Which items have never been sold?',
]

const messages = ref([]) // [{ role: 'user' | 'assistant', content }]
const input = ref('')
const loading = ref(false)
const error = ref(null)
const listEl = ref(null)

async function scrollToBottom() {
    await nextTick()
    listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' })
}

async function send(text = input.value) {
    const question = text.trim()
    if (!question || loading.value) return

    error.value = null
    input.value = ''
    messages.value.push({ role: 'user', content: question })
    loading.value = true
    scrollToBottom()

    try {
        const answer = await askAI(messages.value)
        messages.value.push({ role: 'assistant', content: answer })
    } catch (e) {
        error.value = e.message
        messages.value.pop() // remove the unanswered question
        input.value = question // give it back so the user can retry
    } finally {
        loading.value = false
        scrollToBottom()
    }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
    <section class="card chat">
        <h3>Ask about your shop 🌸</h3>

        <div ref="listEl" class="messages">
        <div v-if="!messages.length" class="empty">
            <p>Try one of these:</p>
            <button v-for="s in SUGGESTIONS" :key="s" class="chip" @click="send(s)">{{ s }}</button>
        </div>

        <div v-for="(m, i) in messages" :key="i" class="bubble" :class="m.role">
            {{ m.content }}
        </div>

        <div v-if="loading" class="bubble assistant typing">Thinking…</div>
        </div>

        <p v-if="error" class="error">⚠️ {{ error }}</p>

        <form class="composer" @submit.prevent="send()">
        <textarea
            v-model="input"
            rows="1"
            placeholder="Ask a question about your sales…"
            :disabled="loading"
            @keydown="onKeydown"
        />
        <button type="submit" :disabled="loading || !input.trim()">Send</button>
        </form>
    </section>
</template>

<style scoped>
.chat { display: flex; flex-direction: column; gap: 12px; }
h3 { margin: 0; font-size: 16px; }
.messages {
    height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
    padding: 4px;
}
.empty p { margin: 0 0 8px; color: #888; font-size: 14px; }
.chip {
    display: inline-block; margin: 0 8px 8px 0; padding: 6px 12px; border-radius: 999px;
    border: 1px solid #f3c1d0; background: #fff5f8; color: #b3375c; cursor: pointer; font-size: 13px;
}
.chip:hover { background: #ffe8ef; }
.bubble {
    max-width: 80%; padding: 10px 14px; border-radius: 14px; line-height: 1.5;
    white-space: pre-wrap; /* keeps line breaks from the answer */
}
.bubble.user { align-self: flex-end; background: #e8577d; color: #fff; border-bottom-right-radius: 4px; }
.bubble.assistant { align-self: flex-start; background: #f2f3f5; border-bottom-left-radius: 4px; }
.typing { color: #888; font-style: italic; }
.composer { display: flex; gap: 8px; }
textarea {
    flex: 1; resize: none; padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px;
    font: inherit;
}
button[type='submit'] {
    padding: 0 18px; border: none; border-radius: 10px; background: #e8577d; color: #fff;
    font-weight: 600; cursor: pointer;
}
button:disabled { opacity: .5; cursor: not-allowed; }
.error { margin: 0; color: #b42318; font-size: 14px; }
</style>