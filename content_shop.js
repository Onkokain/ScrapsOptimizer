console.log('=== SHOP SCRIPT LOADED ===');

setTimeout(async () => {
  console.log('Starting shop parse...');
  
  const scrapsElement = document.querySelector('div[data-tutorial="scraps-counter"] span.font-bold');
  const scrapsCount = scrapsElement ? parseInt(scrapsElement.textContent.trim()) : 0;
  console.log('Scraps element:', scrapsElement);
  console.log('Scraps count:', scrapsCount);
  
  const cards = document.querySelectorAll('button.rounded-2xl.border-4.border-black');
  console.log('Total cards found:', cards.length);
  
  const items = [];
  cards.forEach(card => {
    const h3 = card.querySelector('h3');
    const chanceSpan = card.querySelector('span.absolute.top-0.right-0');
    const costSpan = card.querySelector('span.flex.items-center.gap-1.text-lg.font-bold');
    const img = card.querySelector('img');
    
    if (h3 && chanceSpan && costSpan) {
      const name = h3.textContent.trim();
      const chanceMatch = chanceSpan.textContent.match(/(\d+)%/);
      const costMatch = costSpan.textContent.match(/(\d+)/);
      const imgSrc = img ? img.src : '';
      
      if (costMatch && chanceMatch) {
        items.push({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          cost: parseInt(costMatch[1]),
          chance_percent: parseInt(chanceMatch[1]),
          image: imgSrc,
          timestamp_loaded: new Date().toISOString()
        });
      }
    }
  });
  
  console.log('Parsed items:', items);
  
  if (items.length > 0) {
    await chrome.storage.local.set({
      scraps_shop_items: items,
      scraps_wallet: scrapsCount,
      scraps_context_meta: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        sourceUrl: window.location.href
      }
    });
    console.log('=== SAVED TO STORAGE ===');
  }
}, 3000);
