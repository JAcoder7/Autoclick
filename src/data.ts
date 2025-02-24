import { ref, toRaw, watch } from "vue";

export const data = ref<Data>({
  items: {}
})

chrome.storage.local.get(['autoclick_data'], function (result) {
  if (result.autoclick_data) {
    data.value = result.autoclick_data
  }
});

watch(data, () => {
  chrome.storage.local.set({ autoclick_data: toRaw(data.value) })
}, { deep: true })
