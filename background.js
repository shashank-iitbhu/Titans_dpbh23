// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
      text: 'OFF'
  });
});

const extensions = 'https://www.amazon.com';

async function executeScriptOnTab(tabId, scriptFunction) {
  const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: scriptFunction
  });

  return result && result.length > 0 ? result[0].result : null;
}

async function sendDataToServer(data) {
  const serverUrl = 'http://127.0.0.1:5000'; // Adjust the URL based on your server

  try {
      const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'text/plain',
          },
          body: data,
      });

      console.log('Request sent successfully');

      if (response.ok) {
          const responseData = await response.json();
          console.log(responseData);
      } else {
          console.error('Error receiving response from the server');
      }
  } catch (error) {
      console.error('Error sending request:', error);
  }
}

async function handleExtensionClick(tab) {
  if (!tab.url.startsWith(extensions)) {
      return;
  }

  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState
  });

  if (nextState === 'ON') {
      const resultRightCol = await executeScriptOnTab(tab.id, () => {
          const targetElement = document.getElementById('rightCol');
          return targetElement ? targetElement.innerText.trim() : null;
      });

      const resultCenterCol = await executeScriptOnTab(tab.id, () => {
          const targetElement = document.getElementById('centerCol');
          return targetElement ? targetElement.innerText.trim() : null;
      });

      const resultSelectQuantity = await executeScriptOnTab(tab.id, () => {
          const targetElement = document.getElementById('selectQuantity');
          return targetElement ? targetElement.innerText.trim() : null;
      });

      const resultFeatureBullets = await executeScriptOnTab(tab.id, () => {
          const targetElement = document.getElementById('feature-bullets');
          return targetElement ? targetElement.innerText.trim() : null;
      });

      const elementsTextContent = [resultRightCol, resultCenterCol].filter(Boolean).join('\n');
      const joinedTextContent = elementsTextContent.replace(resultSelectQuantity, '');
      const joinedTextContentFinal = joinedTextContent.replace(resultFeatureBullets, '');

      console.log(joinedTextContentFinal);

      sendDataToServer(joinedTextContentFinal);
  } else if (nextState === 'OFF') {
      await chrome.scripting.removeCSS({
          files: ['focus-mode.css'],
          target: { tabId: tab.id }
      });
  }
}

// When the user clicks on the extension action
chrome.action.onClicked.addListener(async (tab) => {
  await handleExtensionClick(tab);
});

// Listen for messages from the popup or other components
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === 'detect') {
      chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
          const tab = tabs[0];
          await handleExtensionClick(tab);
      });
  }
});
