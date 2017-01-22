const state = {
  enabled: {},
  injected: {},
  port: {}
};

const grayIcon = { path: "assets/icon_gray38x38.png" };
const colorfulIcon = { path: "assets/icon38x38.png" };

const findImage = (url) => `
  var interval = setInterval(function() {
    const photoIcon = document.querySelector('.gsst_e')
    if (photoIcon) {
      clearInterval(interval)
      photoIcon.click()

      interval = setInterval(function() {
        const searchInput = document.querySelector('input.lst.ktf')
        if (searchInput) {
          clearInterval(interval)
          searchInput.value = "${url}"
          document.querySelector('input.gbqfb.kpbb').click()
        }
      }, 100)
    }
  }, 100)
`

chrome.tabs.onActivated.addListener((info) => {
  const tabId = info.tabId;
  if (state.enabled[tabId]) {
    chrome.browserAction.setIcon(colorfulIcon)
  } else {
    chrome.browserAction.setIcon(grayIcon)
  }
})

chrome.browserAction.onClicked.addListener(function(tab) {
  const enabled = state.enabled[tab.id]
  const injected = state.injected[tab.id]
  const port = state.port[tab.id]

  if (enabled) {
    port.postMessage({enabled: false});
    chrome.browserAction.setIcon(grayIcon)
    state.enabled[tab.id] = false;
  } else {
    if (!injected) {
      chrome.tabs.executeScript(null, {file: "contentScript.bundle.js"});
      state.injected[tab.id] = true;
    }

    setTimeout(() => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const newPort = chrome.tabs.connect(tabs[0].id);

        newPort.postMessage({enabled: true});
        newPort.onMessage.addListener(function getResp(response) {
          if (response.command === 'find') {
            chrome.tabs.create({url: 'http://www.google.com/imghp'}, function(tab) {
              chrome.tabs.executeScript(tab.id, {code: findImage(response.url)});
            });
          }
        });

        state.port[tab.id] = newPort;
        state.enabled[tab.id] = true;
        chrome.browserAction.setIcon(colorfulIcon)
      });
    }, 100)
  }
});
