import puppeteer from 'puppeteer';

export async function scrapeBehance() {
  console.log('Starting Behance Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  const trends = [];
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://www.behance.net/search/projects?tracking_source=typeahead_search_direct&search=ui%20ux', { waitUntil: 'networkidle2' });
    
    // Scroll and wait
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 4000));
    
    const items = await page.evaluate(() => {
       const nodes = Array.from(document.querySelectorAll('img[src*="behance.net/project"]')).slice(0, 15);
       return nodes.map(img => {
         const a = img.closest('a');
         return {
           url: a ? a.href : window.location.href,
           image: img.src,
           title: img.alt || 'Behance Project'
         };
       });
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
    console.error('Behance scraper error:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Behance Scraper. Found ${trends.length} items.`);
  return trends;
}
