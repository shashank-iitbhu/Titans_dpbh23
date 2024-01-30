chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
      text: 'OFF'
  });
});


// Function to send data to the Python server
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
          // Execute script to log the text content of the specified elements
          const resultRightCol = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => {
                  const targetElement = document.getElementById('rightCol');
                  return targetElement ? targetElement.innerText.trim() : null;
              }
          });

          const resultCenterCol = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => {
                  const targetElement = document.getElementById('centerCol');
                  return targetElement ? targetElement.innerText.trim() : null;
              }
          });

          const resultSelectQuantity = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => {
                  const targetElement = document.getElementById('selectQuantity');
                  return targetElement ? targetElement.innerText.trim() : null;
              }
          });

          const resultFeatureBullets = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const targetElement = document.getElementById('feature-bullets');
                return targetElement ? targetElement.innerText.trim() : null;
            }
        });

          // Extract the 'result' property from the returned objects
          const textContentRightCol = resultRightCol && resultRightCol.length > 0 ? resultRightCol[0].result : null;
          const textContentCenterCol = resultCenterCol && resultCenterCol.length > 0 ? resultCenterCol[0].result : null;
          const textContentSelectQuantity = resultSelectQuantity && resultSelectQuantity.length > 0 ? resultSelectQuantity[0].result : null;
          const textContentFeatureBullets = resultFeatureBullets && resultFeatureBullets.length > 0 ? resultFeatureBullets[0].result : null;

          // Join the clean text content from specified elements
          const elementsTextContent = [textContentRightCol, textContentCenterCol].filter(Boolean).join('\n');
          // Exclude text content from selectQuantity
          const joinedTextContent = elementsTextContent.replace(textContentSelectQuantity, '');
          const joinedTextContentFinal = joinedTextContent.replace(textContentFeatureBullets, '');

          // Log the joined text content to the console
          console.log(joinedTextContentFinal);

          // Send data to the Python server
          sendDataToServer(joinedTextContentFinal);

      } else if (nextState === 'OFF') {
          // Remove the CSS file when the user turns the extension off
          await chrome.scripting.removeCSS({
              files: ['focus-mode.css'],
              target: { tabId: tab.id }
          });
      }
  }
});
