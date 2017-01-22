const state = {
  enabled: false,
  injected: false,
  port: false
};

const grayIcon = { path: "assets/icon_gray38x38.png" };
const colorfulIcon = { path: "assets/icon38x38.png" };

chrome.browserAction.onClicked.addListener(function(tab) {
  const enabled = state.enabled
  const injected = state.injected
  if (enabled) {
    state.port.postMessage({enabled: false});
    chrome.browserAction.setIcon(grayIcon)
    state.enabled = false;
  } else {
    if (!injected) {
      chrome.tabs.executeScript(null, {file: "contentScript.bundle.js"});
      state.injected = true;
    }

    setTimeout(() => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const port = chrome.tabs.connect(tabs[0].id);

        port.postMessage({enabled: true});
        port.onMessage.addListener(function getResp(response) {
          console.log('XXXXXXXXXXXXXXXXXXXXXX', response)
        });

        state.port = port;
        state.enabled = true;
        chrome.browserAction.setIcon(colorfulIcon)
      });
    }, 100)
  }
});
