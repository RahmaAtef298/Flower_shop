<template>
  <RouterView />
</template>

<style>
body { margin: 0; background: #f6f7f9; font-family: system-ui, sans-serif; color: #222; }
.page { max-width: 1100px; margin: 0 auto; padding: 32px 16px; display: grid; gap: 24px; }
.card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.error { color: #b42318; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.topbar h1 { margin: 0; }
@media (max-width: 640px) { .topbar h1 { font-size: 22px; } }
</style>