console.log('background.js: Service worker starting');

const checkLogin = (tab) => {
  chrome.storage.local.get(['Token', 'ID'], (result) => {
    const token = result.Token;
    console.log('result', result);
    if (token || true) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['forum.js']
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('background.js: Injection error:', chrome.runtime.lastError.message);
        }
      });
    } else {
      console.log('background.js: Not logged in');
    }
  });
};

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, async function(tab) {
    if (tab && tab.url) {
      await chrome.storage.session.set({ currentURL: tab.url });
      checkLogin(tab);
    }
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.session.set({ currentURL: tab.url }, function() {
      checkLogin(tab);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.request === 'getToken') {
    chrome.storage.local.get(['Token', 'ID'], (result) => {
      console.log('Sending to forum.js:', { token: result.Token, id: result.ID });
      sendResponse({ token: result.Token, id: result.ID });
    });
    return true; // Keep channel open for async
  }
});