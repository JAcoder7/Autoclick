var excludeList = [];

chrome.storage.local.get(['cookieDestroyerExcludeList'], function (result) {
    if (result.cookieDestroyerExcludeList) {
        excludeList = result.cookieDestroyerExcludeList;
        reloadList();
    }
});

let newItemInput = document.querySelector("input#newItemInput");
newItemInput.addEventListener("keydown", e => {
    if (e.key == "Enter" && newItemInput.value != "") {
        addItem(newItemInput.value);
        newItemInput.value = ""
    }
})

function reloadList() {
    for (const item of excludeList) {
        if (!Array.from(document.querySelectorAll("#excludeList div div"))?.map(e => e.innerHTML).includes(item)) {
            let newItem = document.createElement("div");

            let itemText = document.createElement("div");
            itemText.innerHTML = item;

            let itemDeleteButton = document.createElement("button");
            itemDeleteButton.classList.add("fluentIcon", "flat");
            itemDeleteButton.addEventListener("click", () => deleteItem(item));
            itemDeleteButton.innerText = "";

            newItem.append(itemText)
            newItem.append(itemDeleteButton)

            document.querySelector("#excludeList").append(newItem);
        }

    }
}

function saveExcludeList() {
    excludeList = Array.from(new Set(excludeList))
    chrome.storage.local.set({ cookieDestroyerExcludeList: excludeList }, function () {
        console.log('Data saved');
    });
}

function deleteItem(item) {
    const index = excludeList.indexOf(item);
    if (index > -1) {
        excludeList.splice(index, 1)
    }
    console.log(Array.from(document.querySelectorAll("#excludeList div div")), Array.from(document.querySelectorAll("#excludeList div div")).filter(e => { e.innerHTML == item }));
    Array.from(document.querySelectorAll("#excludeList div div")).forEach(e => {
        if (e.innerHTML == item) {
            e.parentElement.remove();
        }
    })

    saveExcludeList();
    reloadList();
}

function addItem(item) {
    excludeList.push(item);
    saveExcludeList();
    reloadList();
}

function reportIssue() {
    
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        console.log(tabs);
        let url = tabs[0].url;

        githubApi = new GithubAPI("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", "JAcoder7", "SyncProj");
        githubApi.getContentInfo("cookieDestroyer/issues.txt").then(info => {
            let text = atob(info.content);
            githubApi.updateFile("cookieDestroyer/issues.txt", text + "\n" + url, info.sha);
        });
    });
}

document.querySelector("#reportIssue").onclick = reportIssue;
