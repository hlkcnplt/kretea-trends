import { scrapeAwwwards } from './scrapers/awwwards.js';
import { scrapeMobbin } from './scrapers/mobbin.js';
import { scrapeBehance } from './scrapers/behance.js';
import { sendTrendToApi } from './services/api.js';
import config from './config/index.js';

async function processSource(scraperFunction) {
  try {
    const trends = await scraperFunction();
    for (const trend of trends) {
      await sendTrendToApi(trend);
    }
  } catch (error) {
    console.error('Error processing source:', error);
  }
}

async function runAllScrapers() {
  console.log(`[${new Date().toISOString()}] Starting daily scraper job...`);
  await processSource(scrapeAwwwards);
  await processSource(scrapeMobbin);
  await processSource(scrapeBehance);
  console.log(`[${new Date().toISOString()}] Scraper job completed.`);
}

async function main() {
  console.log('KRETEA-TRENDS Worker initialized.');
  
  await runAllScrapers();

  console.log(`Scheduling next run in ${config.scheduleIntervalMs}ms...`);
  setInterval(async () => {
    await runAllScrapers();
  }, config.scheduleIntervalMs);
}

main().catch(err => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
