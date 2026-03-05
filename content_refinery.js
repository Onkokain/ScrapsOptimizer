const DEBUG = true;

async function waitForContent() {
  return new Promise((resolve) => {
    const check = () => {
      const text = document.body.innerText;
      if (text.length > 500) {
        setTimeout(resolve, 1000);
      } else {
        setTimeout(check, 500);
      }
    };
    setTimeout(check, 1000);
  });
}

function parseRefineryOffers() {
  const offers = [];
  
  const cards = document.querySelectorAll('div.rounded-2xl.border-4.border-black');
  
  cards.forEach(card => {
    const h3 = card.querySelector('h3');
    const button = card.querySelector('button');
    
    if (h3 && button) {
      const name = h3.textContent.trim();
      const buttonText = button.textContent.trim();
      const upgradeMatch = buttonText.match(/\+(\d+)%\s*\((\d+)\s*scraps?\)/);
      
      if (upgradeMatch) {
        offers.push({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          bonus_percent: parseInt(upgradeMatch[1]),
          scraps_cost: parseInt(upgradeMatch[2]),
          timestamp_loaded: new Date().toISOString()
        });
      }
    }
  });
  
  return offers;
}

async function saveData(offers) {
  const data = {
    scraps_refinery_offers: offers,
    scraps_context_meta: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      sourceUrl: window.location.href
    }
  };
  
  await chrome.storage.local.set(data);
  
  localStorage.setItem('scraps_refinery_offers', JSON.stringify(offers));
  localStorage.setItem('scraps_context_meta', JSON.stringify(data.scraps_context_meta));
  
  if (DEBUG) console.log('Refinery offers saved:', offers);
}

(async function init() {
  await waitForContent();
  const offers = parseRefineryOffers();
  await saveData(offers);
})();
