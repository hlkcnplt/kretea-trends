import puppeteer from 'puppeteer';

export async function scrapeMobbin() {
  console.log('Starting Mobbin Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();
  const trends = [];
  
  try {
    await page.goto('https://mobbin.com/browse/ios/apps', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('img', { timeout: 10000 });
    
    const items = await page.$$eval('img', nodes => {
      return nodes.filter(n => n.src && n.width > 50).slice(0, 5).map(img => {
        let parent = img.parentElement;
        let url = 'https://mobbin.com';
        while (parent && parent.tagName !== 'A' && parent.tagName !== 'BODY') {
            parent = parent.parentElement;
        }
        if (parent && parent.tagName === 'A') url = parent.href;
        else url = url + '/screens/' + Math.random().toString(36).substring(7);
        
        return {
          url: url,
          image: img.src
        };
      });
    });

    for (const item of items) {
      if (item.url && item.image) {
        trends.push({
          sourceUrl: item.url,
          imageUrl: item.image,
          styleTags: [],
          primaryColors: []
        });
      }
    }
  } catch (err) {
    console.error('Error testing Mobbin scraping:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Mobbin Scraper. Found ${trends.length} items.`);
  return trends;
}
