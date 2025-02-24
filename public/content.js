let capture = false

let data = { items: {} }

function updateData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['autoclick_data'], function (result) {
      if (result.autoclick_data) {
        data = result.autoclick_data
      }
      resolve()
    });
  })
}
chrome.storage.local.onChanged.addListener(updateData)

chrome.runtime.onMessage.addListener(msg => {
  console.log(msg);

  if (msg == "START_CAPTURE") {
    capture = true
  }
  if (msg == "STOP_CAPTURE") {
    capture = false
  }
})

function uuidv4() {
  // Generate 16 random bytes
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  // Set the version (4) and variant (10) bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

  // Convert to base64url format
  const base64url = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64url;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addItem(selector, outerHTML) {
  data.items[uuidv4()] = {
    selector,
    urlPattern: "^" + escapeRegExp(location.origin),
    enabled: true,
    outerHTML,
    checkOuterHTML: true,
    lastError: null,
    once: true
  }

  chrome.storage.local.set({ autoclick_data: data })
}

window.addEventListener("pointerdown", e => {
  if (capture) {
    let selector = getSelector(e.target)
    let nodes = [...document.querySelectorAll(selector)]
    if (nodes.length != 1) {
      alert(`Error: Selector '${selector}' selects ${nodes.length} elements.`)
      return
    }
    console.log(selector);
    alert(selector)
    addItem(selector, nodes[0].outerHTML)
    capture = false
  }
})

let timeout

window.addEventListener("load", async () => {
  await updateData()

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      clickTheThings()
      timeout = null
    }, 200);
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    clickTheThings()
  }, 500);
})

let clickedIds = []

function clickTheThings() {
  let relevantItems = Object.entries(data.items).filter(([k, i]) => i.enabled && (new RegExp(i.urlPattern).test(location.href)))

  for (const [k, i] of relevantItems) {
    if (i.once && clickedIds.includes(k)) continue;
    let nodes = [...document.querySelectorAll(i.selector)]

    if (nodes.length > 1) {
      setError(k, `Selector matches ${nodes.length} elements`)
    }
    if (nodes.length != 1) {
      console.log(`Selector '${i.selector}' selects ${nodes.length} nodes.`);
      continue;
    }
    if (nodes[0].outerHTML != i.outerHTML) {
      setError(k, `outerHTML of selected element does not match`)
      continue
    }
    if (typeof nodes[0].click != "function") {
      setError(k, `Selected element is not clickable`)
      continue
    }
    nodes[0].click()
    console.log("Clicking", nodes[0]);
    clickedIds.push(k)

    setError(k, null)
  }
}

function setError(id, e) {
  data.items[id].lastError = e

  chrome.storage.local.set({ autoclick_data: data })
}

/**
 * 
 * @param {HTMLElement} element 
 * @returns 
 */
function getSelector(element) {
  if (element == document.body) {
    return "body"
  }
  if (element.hasAttribute("id")) {
    return "#" + element.id
  }

  let selector = getSelector(element.parentElement) + " > " + element.nodeName.toLowerCase()

  let l = document.querySelectorAll(selector).length;
  if (l == 0) throw new Error("");//TODO:Errormessage
  if (l > 1) {
    let classes = [...element.classList.values()].map(c => "." + c).join("")

    let l = document.querySelectorAll(selector + classes).length;
    if (l == 0) throw new Error("");//TODO:Errormessage
    if (l > 1) {
      let sibling = element, nth = 1;
      while (sibling = sibling.previousElementSibling) {
        nth++;
      }
      return selector + `:nth-child(${nth})`;
    } else {
      return selector + classes
    }
  } else {
    return selector
  }

}