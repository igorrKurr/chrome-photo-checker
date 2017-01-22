const state = {
  enabled: false,
  injected: false,
  port: false
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
          if (response.command === 'find') {
            chrome.tabs.create({url: 'http://www.google.com/imghp'}, function(tab) {
              chrome.tabs.executeScript(tab.id, {code: findImage(response.url)});
            });
          }
        });

        state.port = port;
        state.enabled = true;
        chrome.browserAction.setIcon(colorfulIcon)
      });
    }, 100)
  }
});
