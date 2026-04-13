import puppeteer from 'puppeteer';

export async function scrapeBehance() {
  console.log('Starting Behance Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  const trends = [];
  
  try {
    await page.goto('https://www.behance.net/search/projects?tracking_source=typeahead_search_direct&search=ui%20ux', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('img', { timeout: 10000 }).catch(() => {});
    
    const items = await page.$$eval('img', nodes => {
      return nodes.filter(n => n.src && n.width > 100).slice(0, 5).map(img => {
        let parent = img.parentElement;
        let url = 'https://www.behance.net/gallery/';
        while (parent && parent.tagName !== 'A' && parent.tagName !== 'BODY') {
            parent = parent.parentElement;
        }
        if (parent && parent.tagName === 'A') url = parent.href;
        else url = url + Math.random().toString(36).substring(7);
        
        return {
          url: url,
          image: img.src
        };
      });
    });

    for (const item of items) {
      trends.push({
        sourceUrl: item.url,
        imageUrl: item.image,
        styleTags: [],
        primaryColors: []
      });
    }
  } catch (err) {
    console.error('Error testing Behance scraping:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Behance Scraper. Found ${trends.length} items.`);
  return trends;
}
