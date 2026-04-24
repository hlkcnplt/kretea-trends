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

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(r => setTimeout(r, 3000));

    const items = await page.evaluate(() => {
      const covers = Array.from(document.querySelectorAll('.js-project-cover'));
      const uniqueItems = [];
      const urls = new Set();

      for (const cover of covers) {
        const img = cover.querySelector('img');
        if (!img || !img.src.includes('mir-s3')) continue;
        if (img.width < 100 || img.height < 100) continue;

        const links = cover.querySelectorAll('a');
        let projectUrl = null;
        for (const link of links) {
          if (link.href.includes('/gallery/')) {
            projectUrl = link.href.split('?')[0];
            break;
          }
        }

        if (projectUrl && !urls.has(projectUrl)) {
          urls.add(projectUrl);
          uniqueItems.push({
            url: projectUrl,
            image: img.src,
            title: img.alt || 'Behance Project'
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
    console.error('Behance scraper error:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Behance Scraper. Found ${trends.length} items.`);
  return trends;
}
