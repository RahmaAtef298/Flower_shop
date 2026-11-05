<script setup>
import { ref, nextTick } from 'vue'
import { askAI } from '../api/ai'

const SUGGESTIONS = [
    'Which customer spent the most?',
    'What are my top 3 flowers by revenue?',
    'Compare sales between the last two months',
    'Which items have never been sold?',
]

const open = ref(false)
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
    <!-- v-show (not v-if) so the conversation survives closing the window -->
    <section v-show="open" class="card chat" role="dialog" aria-label="Ask about your shop">
        <header class="chat-header">
            <h3>Ask about your shop 🌸</h3>
            <button class="close" aria-label="Close chat" @click="open = false">✕</button>
        </header>

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

    <button
        class="launcher"
        :aria-label="open ? 'Close chat' : 'Ask about your shop'"
        :aria-expanded="open"
        aria-describedby="chat-tooltip"
        @click="open = !open"
    >{{ open ? '✕' : '🌸' }}</button>
    <span v-if="!open" id="chat-tooltip" role="tooltip" class="tooltip">
        Ask AI about your sales, customers &amp; flowers
    </span>
</template>

<style scoped>
/* Floating chat window pinned to the bottom-right of the screen */
.chat {
    position: fixed; right: 24px; bottom: 96px; z-index: 1000;
    width: 380px; max-height: calc(100vh - 120px);
    display: flex; flex-direction: column; gap: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,.18);
}
.chat-header { display: flex; justify-content: space-between; align-items: center; }
h3 { margin: 0; font-size: 16px; }
.close { border: none; background: none; font-size: 16px; color: #888; cursor: pointer; padding: 4px; }
.messages {
    height: 360px; min-height: 0; flex-shrink: 1; overflow-y: auto;
    display: flex; flex-direction: column; gap: 10px; padding: 4px;
}
.launcher {
    position: fixed; right: 24px; bottom: 24px; z-index: 1000;
    width: 56px; height: 56px; border: none; border-radius: 50%;
    background: #e8577d; color: #fff; font-size: 24px; cursor: pointer;
    box-shadow: 0 4px 14px rgba(232,87,125,.45);
}
.launcher:hover { background: #d9466d; }

/* Tooltip to the left of the launcher, shown on hover / keyboard focus */
.tooltip {
    position: fixed; right: 92px; bottom: 38px; z-index: 1000;
    padding: 6px 12px; border-radius: 8px; background: #333; color: #fff;
    font-size: 13px; white-space: nowrap; pointer-events: none;
    opacity: 0; transform: translateX(6px); transition: opacity .15s, transform .15s;
}
.tooltip::after {
    content: ''; position: absolute; top: 50%; right: -5px; margin-top: -5px;
    border: 5px solid transparent; border-right: 0; border-left-color: #333;
}
.launcher:focus-visible + .tooltip { opacity: 1; transform: none; }
/* Only on devices with a real mouse, so it doesn't stick after a tap on phones */
@media (hover: hover) {
    .launcher:hover + .tooltip { opacity: 1; transform: none; }
}

/* Phones: chat takes the full width above the launcher */
@media (max-width: 640px) {
    .chat { right: 12px; left: 12px; bottom: 84px; width: auto; }
    .launcher { right: 16px; bottom: 16px; }
    .tooltip { right: 84px; bottom: 30px; }
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