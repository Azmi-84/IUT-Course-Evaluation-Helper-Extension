/**
 * Mozilla WebExtension browser API Polyfill
 * Simple implementation that allows for cross-browser compatibility
 * For more comprehensive polyfill, see: https://github.com/mozilla/webextension-polyfill
 */

if (typeof browser === "undefined") {
  // Define browser as chrome if it doesn't exist
  window.browser = {
    // Storage API
    storage: {
      local: {
        get: function (keys) {
          return new Promise(function (resolve) {
            chrome.storage.local.get(keys, resolve);
          });
        },
        set: function (data) {
          return new Promise(function (resolve) {
            chrome.storage.local.set(data, resolve);
          });
        },
      },
    },

    // Runtime API
    runtime: {
      sendMessage: function (message) {
        return new Promise(function (resolve, reject) {
          chrome.runtime.sendMessage(message, function (response) {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      },

      onMessage: {
        addListener: function (listener) {
          chrome.runtime.onMessage.addListener(function (
            message,
            sender,
            sendResponse
          ) {
            const result = listener(message, sender);
            if (result && typeof result.then === "function") {
              result.then(sendResponse);
              return true; // Keep channel open for async response
            }
          });
        },
      },
    },

    // Tabs API
    tabs: {
      query: function (queryInfo) {
        return new Promise(function (resolve) {
          chrome.tabs.query(queryInfo, resolve);
        });
      },

      sendMessage: function (tabId, message) {
        return new Promise(function (resolve, reject) {
          chrome.tabs.sendMessage(tabId, message, function (response) {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      },
    },
  };
}
