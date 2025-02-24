<script setup lang="ts">
import { Icon } from "lightrays/vue_components";
import { ref, toRaw, watch } from "vue";
import { data } from "./data";

async function send() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (!tab?.id) return
  const response = await chrome.tabs.sendMessage(tab.id, "START_CAPTURE");

  window.close()
}
</script>

<template>
  <header class="p-m flex gap-m flat-components">
    <input type="search" class="grow">
    <button>
      <Icon t="settings" :size="16" />
    </button>
    <button @click="send">
      <Icon t="cursor_hover" :size="16" />
    </button>
  </header>
  <main class="p-m flex-col gap-s">
    <div v-for="i, id in data.items" class="flex-center subtle small px-m gap-m">
      <Icon t="error_circle" style="color: tomato;" v-if="i.lastError" :title="i.lastError" />
      <Icon t="cursor_click" filled v-else/>
      <div class="flex-col grow">
        <input class="transparent itemInput" v-model="i.selector">
        <input class="transparent itemInput subtle-text" v-model="i.urlPattern" style="font-size: 0.875em;">
      </div>
      <button class="subtle" @click="() => { delete data.items[id] }">
        <Icon t="delete" :size="16" />
      </button>
      <input type="checkbox" v-model="i.enabled">
    </div>
  </main>
</template>

<style scoped>
header {
  border-bottom: var(--site-stroke);
}

button {
  justify-content: start;
}

.itemInput {
  padding: 0 4px;
  min-width: 0;
  flex-grow: 1;
}

.itemInput:hover, .itemInput:focus {
  outline: var(--site-stroke);
}
</style>
