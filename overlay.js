let shopItems = [];
let refineryOffers = [];
let selectedItem = null;
let selectedUpgrade = null;
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let clickedButton = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleTheme') {
    isDarkMode = request.isDark;
    applyTheme();
  } else if (request.action === 'showOverlay') {
    const overlay = document.getElementById('scraps-optimizer-overlay');
    if (overlay) {
      overlay.style.display = 'block';
    } else {
      createOverlay();
    }
  }
});

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'scraps-optimizer-overlay';
  overlay.innerHTML = `
    <div id="scraps-overlay-header">
      <span>Scrap Optimizer</span>
      <div style="display: flex; align-items: center;">
        <span class="scraps-badge"><span id="overlay-scraps-count">0</span> <span id="overlay-scraps-label">Scraps</span></span>
        <button id="overlay-minimize">−</button>
        <button id="overlay-close">×</button>
      </div>
    </div>
    <div id="scraps-overlay-content">
      <input type="text" id="overlay-search" placeholder="Search items...">
      <div id="overlay-items"></div>
      <div id="overlay-result" class="empty">Calculations</div>
    </div>
  `;

  const style = document.createElement('style');
  style.id = 'scraps-overlay-style';
  style.textContent = getOverlayStyles();

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  chrome.storage.local.get(['overlay_position'], (data) => {
    if (data.overlay_position) {
      overlay.style.top = data.overlay_position.top;
      overlay.style.left = data.overlay_position.left;
      overlay.style.right = 'auto';
    }
  });

  setupDragging();
  setupButtons();
  loadOverlayData();
}

function applyTheme() {
  const style = document.getElementById('scraps-overlay-style');
  if (style) {
    style.textContent = getOverlayStyles();
  }
}

function getOverlayStyles() {
  const bg = isDarkMode ? '#0f0f0f' : '#ffffff';
  const bg2 = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const bg3 = isDarkMode ? '#151515' : '#fafafa';
  const text = isDarkMode ? '#e8e8e8' : '#1a1a1a';
  const border = isDarkMode ? '#2a2a2a' : '#d0d0d0';
  const hover = isDarkMode ? '#1a1a1a' : '#eeeeee';
  const selected = isDarkMode ? '#1f1f1f' : '#e8e8e8';
  const accent = isDarkMode ? '#6b9bd1' : '#4a7ba7';
  const muted = isDarkMode ? '#888' : '#666';
  
  return `
    #scraps-optimizer-overlay {
      position: fixed;
      top: 0;
      right: 0;
      width: 310px;
      min-width: 222px;
      max-width: 532px;
      background: ${bg};
      border: 1px solid ${border};
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      z-index: 999999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: ${text};
      font-size: 13px;
      resize: both;
      overflow: hidden;
      pointer-events: auto;
      transition: opacity 0.2s;
    }
    #scraps-optimizer-overlay.faded {
      opacity: 0.3;
      pointer-events: none;
    }
    #scraps-optimizer-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }
    #scraps-optimizer-overlay ::selection {
      background: transparent;
    }
    #scraps-overlay-header {
      background: ${bg2};
      padding: 12px 15px;
      border-bottom: 1px solid ${border};
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      border-radius: 8px 8px 0 0;
      font-weight: bold;
    }
    #scraps-overlay-header > span:first-child {
      color: ${text};
      font-size: 15px;
    }
    #scraps-overlay-header .scraps-badge {
      color: ${text};
      font-size: 12px;
      padding: 4px 10px;
      border: 1px solid ${accent};
      border-radius: 12px;
      background: ${isDarkMode ? 'rgba(107, 155, 209, 0.1)' : 'rgba(74, 123, 167, 0.1)'};
      margin-left: 10px;
    }
    #scraps-overlay-header button {
      background: none;
      border: none;
      color: ${text};
      font-size: 20px;
      cursor: pointer;
      padding: 0 8px;
      margin-left: 5px;
    }
    #scraps-overlay-header button:hover {
      color: ${accent};
    }
    #scraps-overlay-content {
      max-height: 650px;
      height: calc(100% - 45px);
      display: flex;
      flex-direction: column;
    }
    #overlay-search {
      margin: 10px;
      padding: 8px;
      background: ${bg};
      border: 1px solid ${border};
      border-radius: 4px;
      color: ${text};
      font-size: 12px;
    }
    #overlay-search:focus {
      outline: none;
      border-color: ${accent};
    }
    #overlay-items {
      max-height: 180px;
      overflow-y: auto;
    }
    .overlay-item {
      padding: 10px 15px;
      border-bottom: 1px solid ${border};
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .overlay-item:hover {
      background: ${hover};
    }
    .overlay-item.selected {
      background: ${selected};
    }
    .overlay-item-name {
      font-weight: bold;
      font-size: 13px;
      margin-bottom: 3px;
      text-transform: capitalize;
    }
    .overlay-item-img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      border-radius: 4px;
      background: ${bg};
    }
    .overlay-item-details {
      color: ${muted};
      font-size: 11px;
    }
    #overlay-result {
      padding: 15px;
      background: ${bg3};
      border-top: 1px solid ${border};
      border-radius: 0 0 8px 8px;
      min-height: 200px;
      flex: 1;
    }
    #overlay-result.empty {
      display: none;
    }
    .overlay-result-box {
      background: ${bg3};
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 8px;
      border: 1px solid ${border};
    }
    .overlay-result-box strong {
      display: block;
      margin-bottom: 5px;
      color: ${accent};
      font-size: 13px;
      text-transform: capitalize;
    }
    #overlay-items::-webkit-scrollbar {
      width: 6px;
    }
    #overlay-items::-webkit-scrollbar-track {
      background: ${bg};
    }
    #overlay-items::-webkit-scrollbar-thumb {
      background: ${border};
      border-radius: 3px;
    }
    #scraps-optimizer-overlay.minimized #scraps-overlay-content {
      display: none;
    }
    #target-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      background: ${border};
      border-radius: 3px;
      outline: none;
    }
    #target-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: ${accent};
      border-radius: 50%;
      cursor: pointer;
    }
    #target-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: ${accent};
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
  `;
}

function setupDragging() {
  const header = document.getElementById('scraps-overlay-header');
  const overlay = document.getElementById('scraps-optimizer-overlay');

  header.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    initialX = e.clientX - overlay.offsetLeft;
    initialY = e.clientY - overlay.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      overlay.style.left = currentX + 'px';
      overlay.style.top = currentY + 'px';
      overlay.style.right = 'auto';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      const overlay = document.getElementById('scraps-optimizer-overlay');
      chrome.storage.local.set({
        overlay_position: {
          top: overlay.style.top,
          left: overlay.style.left
        }
      });
    }
  });
}

function setupButtons() {
  document.getElementById('overlay-close').addEventListener('click', () => {
    document.getElementById('scraps-optimizer-overlay').remove();
  });

  document.getElementById('overlay-minimize').addEventListener('click', () => {
    document.getElementById('scraps-optimizer-overlay').classList.toggle('minimized');
  });

  document.getElementById('overlay-search').addEventListener('input', (e) => {
    populateOverlayItems(e.target.value);
  });

  document.addEventListener('mousemove', (e) => {
    const overlay = document.getElementById('scraps-optimizer-overlay');
    if (!overlay) return;
    
    const overlayRect = overlay.getBoundingClientRect();
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
    
    const buttonBelow = elementsAtPoint.find(el => 
      !el.closest('#scraps-optimizer-overlay') && (el.tagName === 'BUTTON' || el.tagName === 'A')
    );
    
    if (buttonBelow) {
      const btnRect = buttonBelow.getBoundingClientRect();
      const overlaps = !(overlayRect.right < btnRect.left || 
                        overlayRect.left > btnRect.right || 
                        overlayRect.bottom < btnRect.top || 
                        overlayRect.top > btnRect.bottom);
      
      if (overlaps) {
        if (clickedButton === buttonBelow) {
          overlay.classList.add('hidden');
          overlay.classList.remove('faded');
        } else {
          overlay.classList.add('faded');
          overlay.classList.remove('hidden');
        }
      } else {
        overlay.classList.remove('faded', 'hidden');
      }
    } else {
      overlay.classList.remove('faded', 'hidden');
    }
  });

  document.addEventListener('click', (e) => {
    const clickedOverlay = e.target.closest('#scraps-optimizer-overlay');
    if (clickedOverlay) return;
    
    const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
    const buttonBelow = elementsBelow.find(el => 
      !el.closest('#scraps-optimizer-overlay') && (el.tagName === 'BUTTON' || el.tagName === 'A')
    );
    
    clickedButton = buttonBelow;
  });


}

async function loadOverlayData() {
  const data = await chrome.storage.local.get(['scraps_shop_items', 'scraps_refinery_offers', 'scraps_wallet']);
  shopItems = data.scraps_shop_items || [];
  refineryOffers = data.scraps_refinery_offers || [];
  const scrapsWallet = data.scraps_wallet || 0;

  document.getElementById('overlay-scraps-count').textContent = scrapsWallet;
  document.getElementById('overlay-scraps-label').textContent = scrapsWallet === 1 ? 'Scrap' : 'Scraps';
  
  if (shopItems.length === 0) {
    const container = document.getElementById('overlay-items');
    container.innerHTML = '<div style="padding: 15px; text-align: center; color: #888;">Please visit Shop and Refinery and reload the pages and wait a few seconds.</div>';
  } else {
    populateOverlayItems();
  }
}

function populateOverlayItems(filter = '') {
  const container = document.getElementById('overlay-items');
  container.innerHTML = '';

  const sortedItems = [...shopItems].sort((a, b) => a.name.localeCompare(b.name));
  const filteredItems = filter ? sortedItems.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  ) : sortedItems;

  filteredItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'overlay-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div>
        <div class="overlay-item-name">${item.name}</div>
        <div class="overlay-item-details">${item.cost} scraps • ${item.chance_percent}% chance</div>
      </div>
      ${item.image ? `<img src="${item.image}" class="overlay-item-img" alt="${item.name}">` : ''}
    `;
    div.addEventListener('click', () => selectOverlayItem(item.id));
    container.appendChild(div);
  });
}

function selectOverlayItem(itemId) {
  const clickedItem = document.querySelector(`[data-id="${itemId}"]`);

  if (clickedItem.classList.contains('selected')) {
    clickedItem.classList.remove('selected');
    selectedItem = null;
    selectedUpgrade = null;
    const container = document.getElementById('overlay-result');
    container.classList.add('empty');
    container.innerHTML = 'Calculations';
    return;
  }

  document.querySelectorAll('.overlay-item').forEach(el => el.classList.remove('selected'));
  clickedItem.classList.add('selected');

  selectedItem = shopItems.find(i => i.id === itemId);
  selectedUpgrade = refineryOffers.find(o => o.id === itemId);

  const container = document.getElementById('overlay-result');
  container.classList.remove('empty');

  if (selectedItem) {
    renderItemAnalysis();
  }
}

function renderItemAnalysis() {
  const container = document.getElementById('overlay-result');

  if (selectedUpgrade) {
    const maxChance = Math.min(100, selectedItem.chance_percent + 50 * selectedUpgrade.bonus_percent);
    const optimalTarget = findOptimalTargetProbability({
      roll_cost: selectedItem.cost,
      base_chance_percent: selectedItem.chance_percent,
      upgrade_cost: selectedUpgrade.scraps_cost,
      upgrade_bonus_percent: selectedUpgrade.bonus_percent
    });
    
    let html = `
      <div class="overlay-result-box" style="margin-top: 10px;">
        <strong>Target chance to have won</strong>
        <div style="margin-top: 8px;">
          <input type="range" id="target-slider" min="${selectedItem.chance_percent}" max="${maxChance}" value="${optimalTarget}" step="1" style="width: 100%;">
          <div style="text-align: center; margin-top: 5px; font-size: 14px; font-weight: bold;"><span id="target-value">${optimalTarget}</span>%</div>
        </div>
      </div>
      <div id="target-result"></div>
    `;
    container.innerHTML = html;

    const slider = document.getElementById('target-slider');
    slider.addEventListener('input', (e) => {
      document.getElementById('target-value').textContent = e.target.value;
      calculateTargetStrategy(parseInt(e.target.value));
    });
    calculateTargetStrategy(optimalTarget);
  } else {
    container.innerHTML = '<div class="overlay-result-box"><strong>No upgrade available for this item.</strong></div>';
  }
}

function calculateTargetStrategy(targetPercent) {
  const result = calculateTargetProbability({
    roll_cost: selectedItem.cost,
    base_chance_percent: selectedItem.chance_percent,
    upgrade_cost: selectedUpgrade.scraps_cost,
    upgrade_bonus_percent: selectedUpgrade.bonus_percent,
    target_percent: targetPercent
  });

  if (!result) return;

  const muted = isDarkMode ? '#888' : '#666';
  const accent = isDarkMode ? '#6b9bd1' : '#4a7ba7';

  const html = `
    <div class="overlay-result-box" style="margin-top: 10px;">
      <strong>Result</strong>
      <div style="margin-top: 5px;">Best move: buy ${result.upgrades} upgrade${result.upgrades !== 1 ? 's' : ''}, then roll ${result.rolls} time${result.rolls !== 1 ? 's' : ''}.</div>
    </div>
    <div class="overlay-result-box" style="margin-top: 10px;">
      <strong>Average view for the item</strong>
      <div style="margin-top: 5px; font-size: 12px; line-height: 1.6;">
        <div><span style="color: ${muted};">expected rolls:</span> ${result.expected_rolls.toFixed(2)}</div>
        <div style="color: ${accent}; font-weight: bold;"><span style="color: ${muted}; font-weight: normal;">expected total scraps:</span> ${result.expected_total_scraps.toFixed(2)}</div>
      </div>
    </div>
  `;

  document.getElementById('target-result').innerHTML = html;
}

function calculateOverlayBestUpgrades() {
  const container = document.getElementById('overlay-result');

  if (!selectedItem || !selectedUpgrade) {
    const itemInfo = container.querySelector('.overlay-result-box:first-child');
    container.innerHTML = itemInfo ? itemInfo.outerHTML : '';
    container.innerHTML += '<div class="overlay-result-box"><strong>No upgrade available for this item.</strong></div>';
    return;
  }

  const result = calculateRefineryDecision({
    roll_cost: selectedItem.cost,
    base_chance_percent: selectedItem.chance_percent,
    upgrade_cost: selectedUpgrade.scraps_cost,
    upgrade_bonus_percent: selectedUpgrade.bonus_percent,
    upgrades_owned: 0,
    max_additional_upgrades: 50,
    expected_future_rolls: 0,
    cap_at_100: true
  });

  const itemInfo = container.querySelector('.overlay-result-box:first-child');
  container.innerHTML = itemInfo ? itemInfo.outerHTML : '';

  const { buy_upgrades, reason, score, p_after_upgrades_percent } = result.decision;
  const muted = isDarkMode ? '#888' : '#666';

  if (buy_upgrades === 0) {
    container.innerHTML += `
      <div class="overlay-result-box">
        <strong>Buying no upgrades in the refinery is mathematically most optimal!</strong>
        <div style="margin-top: 8px; font-size: 11px; color: ${muted};">
          Score: ${score.toFixed(5)} success/scrap
        </div>
      </div>
    `;
  } else {
    container.innerHTML += `
      <div class="overlay-result-box">
        <strong>Buying ${buy_upgrades} upgrade${buy_upgrades !== 1 ? 's' : ''} in the refinery is mathematically most optimal!</strong>
        <div style="margin-top: 8px; font-size: 11px; color: ${muted};">
          Final chance: ${p_after_upgrades_percent.toFixed(2)}%<br>
          Score: ${score.toFixed(5)} success/scrap
        </div>
      </div>
    `;
  }
}

setTimeout(() => {
  chrome.storage.local.get(['theme'], (data) => {
    if (data.theme) {
      isDarkMode = data.theme !== 'light';
    } else {
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    createOverlay();
  });
}, 2000);

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    const overlay = document.getElementById('scraps-optimizer-overlay');
    if (overlay) {
      overlay.style.display = (url.includes('/shop') || url.includes('/refinery')) ? 'block' : 'none';
    }
  }
}).observe(document, {subtree: true, childList: true});
