import puppeteer from 'puppeteer';

export async function scrapeMobbin() {
  console.log('Starting Mobbin Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  const trends = [];
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://mobbin.com/browse/ios/apps', { waitUntil: 'networkidle2' });
    
    // Scroll to force lazy loading
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 5000));
    
    const items = await page.evaluate(() => {
       const imgNodes = Array.from(document.querySelectorAll('img[src^="http"]'));
       const uniqueItems = [];
       const urls = new Set();
       
       for (const img of imgNodes) {
         if (img.width < 50 || img.height < 50) continue; // skip tiny icons
         const a = img.closest('a');
         if (a && a.href) {
            if (!urls.has(a.href)) {
               urls.add(a.href);
               uniqueItems.push({
                 url: a.href,
                 image: img.src,
                 title: img.alt || 'Mobile App Design'
               });
            }
         }
       }
       return uniqueItems.slice(0, 5);
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
    console.error('Mobbin scraper error:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Mobbin Scraper. Found ${trends.length} items.`);
  return trends;
}
