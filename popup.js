let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

chrome.storage.local.get(['theme'], (data) => {
  if (data.theme) {
    isDarkMode = data.theme !== 'light';
  }
  updateTheme();
});

document.getElementById('themeToggle').addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  chrome.storage.local.set({ theme: isDarkMode ? 'dark' : 'light' });
  updateTheme();
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.url?.includes('scraps.hackclub.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleTheme', isDark: isDarkMode}).catch(() => {});
    }
  });
});

document.getElementById('popOut').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.url?.includes('scraps.hackclub.com/shop')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'showOverlay'}).catch(() => {});
      window.close();
    }
  });
});

function updateTheme() {
  const btn = document.getElementById('themeToggle');
  if (isDarkMode) {
    document.body.style.background = '#0f0f0f';
    document.body.style.color = '#e8e8e8';
    btn.textContent = '🌙 Dark Mode';
  } else {
    document.body.style.background = '#f5f5f5';
    document.body.style.color = '#1a1a1a';
    btn.textContent = '☀️ Light Mode';
  }
  
  document.querySelectorAll('button').forEach(button => {
    if (isDarkMode) {
      button.style.background = '#1a1a1a';
      button.style.borderColor = '#2a2a2a';
      button.style.color = '#e8e8e8';
    } else {
      button.style.background = '#ffffff';
      button.style.borderColor = '#d0d0d0';
      button.style.color = '#1a1a1a';
    }
  });
}
