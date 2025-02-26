<script setup lang="ts">
import { Icon } from "lightrays/vue_components";
import { computed, ref, toRaw, watch } from "vue";
import { data } from "./data";

const search = ref("")

const currentUrl = ref<string | null>()
async function updateCurrentUrl() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  currentUrl.value = tab.url || null
}
updateCurrentUrl()
chrome.tabs.onActivated.addListener(updateCurrentUrl)

const searchedItems = computed(() => {
  return Object.fromEntries(Object.entries(data.value.items)
    .filter(e => e[1].selector.includes(search.value) || e[1].urlPattern.includes(search.value))
    .sort((a, b) => {
      if (currentUrl.value) {
        if (new RegExp(a[1].urlPattern).test(currentUrl.value)) {
          return -1
        }
        if (new RegExp(b[1].urlPattern).test(currentUrl.value)) {
          return 1
        }
      }

      return a[1].urlPattern.localeCompare(b[1].urlPattern)
    }))
})

async function send() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (!tab?.id) return
  const response = await chrome.tabs.sendMessage(tab.id, "START_CAPTURE");

  window.close()
}
</script>

<template>
  <header class="p-m flex gap-m flat-components">
    <input type="search" class="grow" placeholder="Search" v-model="search">
    <!-- <button>
      <Icon t="settings" :size="16" />
    </button> -->
    <button @click="send">
      <Icon t="cursor_hover" :size="16" />
    </button>
  </header>
  <main class="p-m flex-col gap-s">
    <div v-for="i, id in searchedItems" class="flex-center subtle small px-m gap-m">
      <Icon t="error_circle" style="color: tomato;" v-if="i.lastError" :title="i.lastError" />
      <Icon t="cursor_click" filled v-else />
      <div class="flex-col grow">
        <input class="transparent itemInput" v-model="i.selector">
        <input class="transparent itemInput subtle-text" v-model="i.urlPattern" style="font-size: 0.875em;">
      </div>
      <button class="subtle small" @click="() => { data.items[id].checkOuterHTML = false }" v-if="i.checkOuterHTML">
        <Icon t="equal_circle" :size="16" />
      </button>
      <button class="subtle small" @click="() => { data.items[id].checkOuterHTML = true }" v-else>
        <Icon t="equal_off" :size="16" />
      </button>
      <button class="subtle small" @click="() => { data.items[id].once = false }" v-if="i.once">
        <Icon t="arrow_repeat_all_off" :size="16" />
      </button>
      <button class="subtle small" @click="() => { data.items[id].once = true }" v-else>
        <Icon t="arrow_repeat_all" :size="16" />
      </button>
      <button class="subtle small" @click="() => { delete data.items[id] }">
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
