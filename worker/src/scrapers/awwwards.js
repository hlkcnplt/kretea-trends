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
     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
     await page.goto('https://www.awwwards.com/websites/', { waitUntil: 'networkidle2' });
     
     // Wait for the card container to be present and scroll slightly to trigger lazy loading
     await page.waitForSelector('.card-site', { timeout: 15000 });
     await page.evaluate(() => window.scrollBy(0, 800));
     await new Promise(r => setTimeout(r, 2000));

     const items = await page.$$eval('.card-site.js-container-figure', nodes => {
       return nodes.slice(0, 5).map(node => {
         const img = node.querySelector('img');
         const links = Array.from(node.querySelectorAll('a'));
         const externalLink = links.find(a => a.href && !a.href.includes('awwwards.com'));
         const linkUrl = externalLink ? externalLink.href : (links[0] ? links[0].href : null);
         
         if (!img || !linkUrl) return null;
         
         let imageUrl = img.getAttribute('data-srcset') || img.getAttribute('srcset') || img.src;
         if (imageUrl && imageUrl.includes('1x')) {
           imageUrl = imageUrl.split('1x')[0].trim();
         }
         
         return {
           title: img.alt || 'Awwwards Design',
           url: linkUrl,
           image: imageUrl
         };
       });
     }).then(items => items.filter(Boolean));

    for (const item of items.filter(Boolean)) {
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
    console.error('Awwwards scraper error:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log(`Finished Awwwards Scraper. Found ${trends.length} items.`);
  return trends;
}
