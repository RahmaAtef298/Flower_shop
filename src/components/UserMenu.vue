<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ user: { type: Object, default: null } })
const emit = defineEmits(['logout'])

const open = ref(false)
const rootEl = ref(null)

const name = computed(() => props.user?.fullName || props.user?.username || '')
const initials = computed(() =>
    name.value
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('')
)

// Close when clicking outside the menu or pressing Escape
function onDocClick(e) {
    if (!rootEl.value?.contains(e.target)) open.value = false
}
function onKeydown(e) {
    if (e.key === 'Escape') open.value = false
}
onMounted(() => {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <div ref="rootEl" class="user-menu">
        <button
            class="trigger"
            aria-haspopup="menu"
            :aria-expanded="open"
            @click="open = !open"
        >
            <span class="avatar" aria-hidden="true">{{ initials }}</span>
            <span class="name">{{ name }}</span>
            <svg class="chevron" :class="{ up: open }" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>

        <div v-if="open" class="dropdown" role="menu">
            <div class="account">
                <span class="avatar lg" aria-hidden="true">{{ initials }}</span>
                <div class="account-text">
                    <strong>{{ name }}</strong>
                    <span v-if="user?.username && user.username !== name">{{ user.username }}</span>
                </div>
            </div>
            <hr />
            <button class="item danger" role="menuitem" @click="emit('logout')">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 14l4-4-4-4M17 10H8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Log out
            </button>
        </div>
    </div>
</template>

<style scoped>
.user-menu { position: relative; }
.trigger {
    display: flex; align-items: center; gap: 10px;
    padding: 4px 10px 4px 4px; border: 1px solid #e5e4e7; border-radius: 999px;
    background: #fff; color: #222; font: inherit; font-size: 14px; cursor: pointer;
    transition: background .15s, box-shadow .15s;
}
.trigger:hover { background: #fafafa; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.avatar {
    display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #f472b6, #e8577d); color: #fff;
    font-size: 13px; font-weight: 600; letter-spacing: .5px; flex-shrink: 0;
}
.avatar.lg { width: 40px; height: 40px; font-size: 15px; }
.name { font-weight: 500; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chevron { width: 16px; height: 16px; color: #888; transition: transform .15s; }
.chevron.up { transform: rotate(180deg); }

.dropdown {
    position: absolute; right: 0; top: calc(100% + 8px); z-index: 1100;
    min-width: 240px; padding: 8px; border-radius: 12px; background: #fff;
    border: 1px solid #eee; box-shadow: 0 8px 30px rgba(0,0,0,.12);
}
.account { display: flex; align-items: center; gap: 12px; padding: 8px; }
.account-text { display: flex; flex-direction: column; min-width: 0; }
.account-text strong { font-size: 14px; }
.account-text span { font-size: 13px; color: #888; overflow: hidden; text-overflow: ellipsis; }
hr { border: none; border-top: 1px solid #eee; margin: 6px 0; }
.item {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 8px 10px; border: none; border-radius: 8px; background: none;
    font: inherit; font-size: 14px; text-align: left; cursor: pointer;
}
.item svg { width: 18px; height: 18px; }
.item.danger { color: #b42318; }
.item.danger:hover { background: #fdecea; }

/* Phones: show just the avatar in the top bar */
@media (max-width: 640px) {
    .name, .chevron { display: none; }
    .trigger { padding: 3px; }
}
</style>
