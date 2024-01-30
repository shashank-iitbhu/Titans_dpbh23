chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: 'OFF'
    });
  });
  
  const extensions = 'https://www.amazon.com';
  
  // When the user clicks on the extension action
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(extensions)) {
      // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
      const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
      // Next state will always be the opposite
      const nextState = prevState === 'ON' ? 'OFF' : 'ON';
  
      // Set the action badge to the next state
      await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState
      });
  
      if (nextState === 'ON') {
        // Execute script to log the text content of the specified element
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            const targetElement = document.getElementById('buyBoxAccordion');
            return targetElement ? targetElement.innerText.trim() : null;
          }
        });
  
        // Extract the 'result' property from the returned object
        const textContent = result && result.length > 0 ? result[0].result : null;
  
        // Log the clean text content to the console
        console.log('Clean Text Content of the Element:',textContent);
      } else if (nextState === 'OFF') {
        // Remove the CSS file when the user turns the extension off
        await chrome.scripting.removeCSS({
          files: ['focus-mode.css'],
          target: { tabId: tab.id }
        });
      }
    }
  });