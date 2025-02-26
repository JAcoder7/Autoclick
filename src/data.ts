import { ref, toRaw, watch } from "vue";

export const data = ref<Data>({
  items: {}
})

const wHandle = watch(data, () => {
  chrome.storage.local.set({ autoclick_data: toRaw(data.value) })
}, { deep: true })

function updateData() {
  wHandle.pause()
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.get(['autoclick_data'], function (result) {
      if (result.autoclick_data) {
        data.value = result.autoclick_data
        console.log(data.value);
      }
      wHandle.resume()
      resolve()
    });
  })
}
updateData()

chrome.storage.local.onChanged.addListener(updateData)

