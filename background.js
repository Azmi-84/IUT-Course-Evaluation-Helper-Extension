// Cross-browser compatibility wrapper
const browserAPI = (function () {
  if (typeof browser !== "undefined") {
    return browser;
  }

  // If browser is undefined, provide Chrome API with Promise wrappers
  return {
    runtime: {
      onMessage: {
        addListener: chrome.runtime.onMessage.addListener.bind(
          chrome.runtime.onMessage
        ),
      },
      sendMessage: function (message) {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      },
    },
    tabs: {
      query: function (queryInfo) {
        return new Promise((resolve, reject) => {
          chrome.tabs.query(queryInfo, (tabs) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(tabs);
            }
          });
        });
      },
      sendMessage: function (tabId, message) {
        return new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      },
    },
    storage: {
      local: {
        get: function (keys) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          });
        },
        set: function (items) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.set(items, () => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          });
        },
      },
    },
  };
})();

browserAPI.runtime.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.submit) {
    // if submit is pressed
    try {
      browserAPI.tabs
        .query({ active: true, currentWindow: true })
        .then(function (tabs) {
          if (tabs && tabs.length > 0) {
            return browserAPI.tabs.sendMessage(tabs[0].id, {
              message: "Start Evaluate",
            });
          } else {
            throw new Error("No active tabs found");
          }
        })
        .then(function (response) {
          if (sendResponse) {
            sendResponse({ success: true });
          }
        })
        .catch(function (error) {
          console.error("Error:", error);
          if (sendResponse) {
            sendResponse({ success: false, error: error.message });
          }
        });
    } catch (error) {
      console.error("Critical error:", error);
      if (sendResponse) {
        sendResponse({ success: false, error: error.message });
      }
    }

    // Return true to keep the message channel open for the async response
    return true;
  }
});
