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
.user { display: flex; align-items: center; gap: 12px; color: #555; }
.user button {
  padding: 8px 14px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer;
}
.user button:hover { background: #f2f3f5; }
</style>