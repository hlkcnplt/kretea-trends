import puppeteer from 'puppeteer';

export async function scrapeAwwwards() {
  console.log('Starting Awwwards Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  const trends = [];
  
  try {
    await page.goto('https://www.awwwards.com/websites/', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('img', { timeout: 10000 });
    
    const items = await page.$$eval('img', nodes => {
      return nodes.filter(n => n.src && n.width > 50).slice(0, 5).map(img => {
        let parent = img.parentElement;
        let url = 'https://www.awwwards.com/websites/';
        while (parent && parent.tagName !== 'A' && parent.tagName !== 'BODY') {
            parent = parent.parentElement;
        }
        if (parent && parent.tagName === 'A') url = parent.href;
        else return null;
        
        return {
          title: img.alt || 'Awwwards Design',
          url: url,
          image: img.src
        };
      });
    });

    for (const item of items.filter(Boolean)) {
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
    console.error('Awwwards scraper error:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Awwwards Scraper. Found ${trends.length} items.`);
  return trends;
}
