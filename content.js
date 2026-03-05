chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    analyzeCurrentPage().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({error: error.message});
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'selectItem') {
    selectItem(request.itemName);
    sendResponse({success: true});
  }
});

async function analyzeCurrentPage() {
  // Wait for content to load
  await waitForContent();
  
  const url = window.location.href;
  
  if (url.includes('/shop')) {
    return analyzeShop();
  } else if (url.includes('/refinery')) {
    return analyzeRefinery();
  } else {
    return {error: 'Please navigate to /shop or /refinery page'};
  }
}

function waitForContent() {
  return new Promise((resolve) => {
    const checkContent = () => {
      const text = document.body.innerText;
      if (text.length > 100) {
        resolve();
      } else {
        setTimeout(checkContent, 500);
      }
    };
    checkContent();
  });
}

function analyzeShop() {
  const items = [];

  // Find all shop item buttons
  const itemButtons = document.querySelectorAll('button[class*="relative cursor-pointer overflow-hidden rounded-2xl border-4 border-black p-4"]');

  itemButtons.forEach(button => {
    // Skip sold out items
    if (button.querySelector('.bg-red-600')) return;

    const nameEl = button.querySelector('h3');
    const costEl = button.querySelector('svg + span');
    const chanceEl = button.querySelector('span[class*="chance"]');

    if (nameEl && costEl && chanceEl) {
      const name = nameEl.textContent.trim();
      const cost = parseInt(costEl.textContent);
      const chanceText = chanceEl.textContent.match(/(\d+)/);

      if (chanceText) {
        const chance = parseInt(chanceText[1]);
        items.push({name, cost, chance, costPerPercent: cost / chance});
      }
    }
  });

  if (items.length === 0) {
    return {error: 'No items found in shop'};
  }

  // Find best value (lowest cost per percentage point)
  const bestItem = items.reduce((best, item) =>
    item.costPerPercent < best.costPerPercent ? item : best
  );

  return {
    type: 'optimization',
    bestItem: bestItem.name,
    costPerPercent: bestItem.costPerPercent.toFixed(2),
    totalCost: bestItem.cost,
    finalChance: bestItem.chance + '%'
  };
}

function analyzeRefinery() {
  const upgrades = [];

  // Find all refinery upgrade divs (excluding sold out ones)
  const upgradeCards = document.querySelectorAll('.rounded-2xl.border-4.border-black:not(.bg-gray-100)');

  upgradeCards.forEach(card => {
    const nameEl = card.querySelector('h3');
    const buttonEl = card.querySelector('button:not([disabled])');

    if (nameEl && buttonEl) {
      const name = nameEl.textContent.trim();
      const buttonText = buttonEl.textContent.trim();

      // Extract bonus and cost from button text like "+13% (20 scraps)"
      const match = buttonText.match(/\+(\d+)%\s*\((\d+)\s*scraps?\)/);

      if (match) {
        const bonus = parseInt(match[1]);
        const cost = parseInt(match[2]);
        upgrades.push({name, cost, bonus, costPerBonus: cost / bonus});
      }
    }
  });

  if (upgrades.length === 0) {
    return {error: 'No upgrades available in refinery'};
  }

  // Find best value (lowest cost per bonus percentage)
  const bestUpgrade = upgrades.reduce((best, upgrade) =>
    upgrade.costPerBonus < best.costPerBonus ? upgrade : best
  );

  return {
    type: 'optimization',
    bestItem: bestUpgrade.name,
    costPerPercent: bestUpgrade.costPerBonus.toFixed(2),
    totalCost: bestUpgrade.cost,
    finalChance: `+${bestUpgrade.bonus}%`
  };
}

function selectItem(itemName) {
  const url = window.location.href;

  if (url.includes('/shop')) {
    // Find and click the shop item button
    const itemButtons = document.querySelectorAll('button[class*="relative cursor-pointer overflow-hidden rounded-2xl border-4 border-black p-4"]:not(.bg-gray-100)');

    itemButtons.forEach(button => {
      const nameEl = button.querySelector('h3');
      if (nameEl && nameEl.textContent.trim() === itemName) {
        button.click();
      }
    });
  } else if (url.includes('/refinery')) {
    // Find and click the refinery upgrade button
    const upgradeCards = document.querySelectorAll('.rounded-2xl.border-4.border-black:not(.bg-gray-100)');

    upgradeCards.forEach(card => {
      const nameEl = card.querySelector('h3');
      const buttonEl = card.querySelector('button:not([disabled])');

      if (nameEl && nameEl.textContent.trim() === itemName && buttonEl) {
        buttonEl.click();
      }
    });
  }
}
