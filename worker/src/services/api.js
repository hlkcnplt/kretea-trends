import axios from 'axios';
import config from '../config/index.js';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-KRETEA-AUTH': config.kreteaAuthSecret
  }
});

export async function sendTrendToApi(trendData) {
  try {
    const response = await apiClient.post('', trendData);
    console.log(`Successfully sent trend to API: ${trendData.sourceUrl}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`API Error when sending ${trendData.sourceUrl} - Status: ${error.response.status}`);
    } else if (error.request) {
      console.error(`No response received from API for ${trendData.sourceUrl}. Ensure backend is running.`);
    } else {
      console.error(`Error setting up API request for ${trendData.sourceUrl}:`, error.message);
    }
  }
}
