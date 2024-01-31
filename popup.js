// popup.js

document.getElementById('close-popup').addEventListener('click', () => {
    window.close();
});

document.addEventListener('DOMContentLoaded', function () {
    const detectButton = document.getElementById('detect-popup');

    detectButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            const activeTab = tabs[0];
            
            // Send a message to the background script to trigger the detection
            chrome.runtime.sendMessage({ command: 'detect', tab: activeTab });
        });
    });
    
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.results) {
            // Display the results in the popup
            displayResults(request.results);
        }
    });
});
