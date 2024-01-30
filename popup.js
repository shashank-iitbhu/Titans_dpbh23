// You can add JavaScript code here if needed
document.getElementById('close-popup').addEventListener('click', () => {
    window.close();
});

document.addEventListener('DOMContentLoaded', function () {
    const detectButton = document.getElementById('detect-popup');

    detectButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.runtime.sendMessage({ command: 'detect', tab: activeTab });
        });
    });
});
