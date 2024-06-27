chrome.action.onClicked.addListener((tab) => {
    const width = 400;
    const height = 500;
  
    // Get the current window to calculate the top-right position
    chrome.windows.getCurrent((currentWindow) => {
      const left = currentWindow.left + currentWindow.width - width;
      const top = currentWindow.top;
  
      chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: width,
        height: height,
        top: top,
        left: left
      });
    });
  });
  