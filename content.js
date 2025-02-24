/* window.onload = () => {
    chrome.storage.local.get(['cookieDestroyerExcludeList'], function (result) {
        if (result.cookieDestroyerExcludeList) {
            let excludeList = result.cookieDestroyerExcludeList;

            let isThisSiteExcludet = false;
            for (const site of excludeList) {
                if (location.href.includes(site)) {
                    isThisSiteExcludet = true;
                    break;
                }
            }
            if (!isThisSiteExcludet) {
                githubApi = new GithubAPI("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", "JAcoder7", "SyncProj");
                setTimeout(() => {
                    githubApi.getContentInfo("cookieDestroyer/log.json").then(info => {
                        let json = JSON.parse(atob(info.content));
                        if (!json[location.origin]) {
                            json[location.origin] = [];
                            githubApi.updateFile("cookieDestroyer/log.json", JSON.stringify(json), info.sha);
                        }
                    });
                }, 2000);


                findCookieRejectButtons(document.body, false)

                // Options for the observer (which mutations to observe)
                const config = { childList: true, subtree: true };

                // Callback function to execute when mutations are observed
                const callback = function (mutationsList, observer) {
                    let addedNodes = [];
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            addedNodes.push(...mutation.addedNodes);
                        }
                    }
                    for (const node of addedNodes) {
                        const excludeTags = ["SCRIPT", "STYLE"];
                        if (node.nodeType == Node.ELEMENT_NODE && !excludeTags.includes(node.tagName)) {
                            findCookieRejectButtons(node);
                        }
                    }
                };
                // Create an observer instance linked to the callback function
                const observer = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                observer.observe(document.body, config);

            }
        }
    });


}
 */

window.addEventListener("pointerup",e=>{
    console.log(e.target)
})

function get(params) {
    
}

/**
 * Returns the text content of an element without text content in its children
 * @param {Element} element 
 */
function getElementText(element) {
    let text = "";
    for (const child of element.childNodes) {
        if (child.nodeType == Node.TEXT_NODE) {
            text += child.textContent.replace(/^\n+|\n+$/gm, "");
        }
    }
    return text;
}

let allRejectBtns = [];

function findCookieRejectButtons(rootElement, firstScan = false) {
    if (!rootElement.innerHTML.toLowerCase().includes("cookie")) {
        return;
    }

    let checkedElements = [];
    let elements = Array.from(rootElement.querySelectorAll("*:not(script)"));
    let cookieElements = elements.filter(a => getElementText(a).toLowerCase().includes("cookie"));

    let rejectbtns = []
    for (const element of cookieElements) {
        let foundBtns = null;
        let searchedElement = element;
        while (foundBtns == null) {
            let btns = Array.from(searchedElement.querySelectorAll("button"));
            btns = btns.filter(b => {
                return !allRejectBtns.includes(b) &&
                    !(b.getBoundingClientRect().width == 0 && b.getBoundingClientRect().height == 0 && b.getBoundingClientRect().x == 0 && b.getBoundingClientRect().y == 0)
                    && /ablehnen|reject|necessary|allow selection/.test(b.innerHTML.toLowerCase());
            });
            if (btns.length > 0) {
                foundBtns = btns;
            }

            if (searchedElement == rootElement || checkedElements.includes(searchedElement)) {
                break;
            }
            checkedElements.push(searchedElement);
            searchedElement = searchedElement.parentElement;
        }
        if (foundBtns) {
            rejectbtns.push(...foundBtns);
        }
    }
    checkedElements.push(rootElement);

    rejectbtns = Array.from(new Set(rejectbtns)); // Delete Dublicates

    allRejectBtns.push(...rejectbtns);
    allRejectBtns = Array.from(new Set(allRejectBtns));

    if (allRejectBtns.length > 1) {
        alert("Two buttons found")
    }

    for (const btn of rejectbtns) {
        btn.style.background = "red";

        //btn.click();
    }
    console.log(rejectbtns);
    if (rejectbtns.length > 0) {
        githubApi.getContentInfo("cookieDestroyer/log.json").then(info => {
            let json = JSON.parse(atob(info.content));
            if (!json[location.origin]) {
                json[location.origin] = allRejectBtns.map(btn => btn.textContent.replace(/^[\n ]+|[\n ]+$/gm, ""));
            } else {
                json[location.origin] = Array.from(new Set([...json[location.origin], ...(allRejectBtns.map(btn => btn.textContent.replace(/^[\n ]+|[\n ]+$/gm, "")))]));
            }
            githubApi.updateFile("cookieDestroyer/log.json", JSON.stringify(json), info.sha);
        });
    }

}