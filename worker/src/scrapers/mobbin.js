import puppeteer from 'puppeteer';

export async function scrapeMobbin() {
  console.log('Starting Mobbin Scraper...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const trends = [];
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Mobbin requires auth, try the discover URL
    await page.goto('https://mobbin.com/discover/apps/ios', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Debug: check where we landed
    const debugInfo = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body?.innerText?.slice(0, 600),
        imgCount: imgs.length,
        imgSrcs: imgs.slice(0, 5).map(img => img.src),
      };
    });
    console.log('[MOBBIN DEBUG]', JSON.stringify(debugInfo, null, 2));

    // Check if we got redirected to login/homepage
    const currentUrl = await page.url();
    if (currentUrl.includes('?redirect_to=') || currentUrl === 'https://mobbin.com/') {
      console.log('[MOBBIN] Redirected to homepage, site may require authentication');
    }

    const items = await page.$$eval('img[src^="http"]', nodes => {
      const uniqueItems = [];
      const urls = new Set();
      
      for (const img of nodes) {
        if (img.width < 50 || img.height < 50) continue;
        const a = img.closest('a');
        if (a && a.href && !urls.has(a.href)) {
          urls.add(a.href);
          uniqueItems.push({
            url: a.href,
            image: img.src,
            title: img.alt || 'Mobile App Design'
          });
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
