import puppeteer from 'puppeteer';

export async function scrapeDribbble() {
  console.log('Starting Dribbble Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const trends = [];
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Dribbble's shot feed - public and doesn't require auth
    await page.goto('https://dribbble.com/search/ui-design', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for shots to load
    await page.waitForSelector('.ShotList-item, [data-shot-id], img[src*="dribbble"]', { timeout: 15000 });
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 2000));

    const items = await page.evaluate(() => {
      // Dribbble uses data attributes for shots
      const shotEls = Array.from(document.querySelectorAll('[data-shot-id]'));
      const uniqueItems = [];
      const urls = new Set();

      for (const shot of shotEls) {
        const shotId = shot.getAttribute('data-shot-id');
        const img = shot.querySelector('img');
        const link = shot.querySelector('a[href*="/shots/"]');
        
        if (!img || !link) continue;
        
        const shotUrl = `https://dribbble.com/shots/${shotId}`;
        if (urls.has(shotUrl)) continue;
        
        let imageUrl = img.getAttribute('src') || img.getAttribute('data-src');
        if (!imageUrl || !imageUrl.includes('dribbble')) continue;
        
        urls.add(shotUrl);
        uniqueItems.push({
          url: shotUrl,
          image: imageUrl,
          title: img.alt || link.textContent?.trim() || 'Dribbble Design'
        });
        
        if (uniqueItems.length >= 5) break;
      }
      return uniqueItems;
    });

    for (const item of items) {
      if (item.url && item.image) {
        trends.push({
          sourceUrl: item.url,
          imageUrl: item.image,
          title: item.title,
          styleTags: [],
          primaryColors: []
        });
      }
    }
  } catch (err) {
    console.error('Dribbble scraper error:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Dribbble Scraper. Found ${trends.length} items.`);
  return trends;
}
