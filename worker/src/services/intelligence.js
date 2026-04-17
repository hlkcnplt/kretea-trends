import Vibrant from 'node-vibrant';
import axios from 'axios';

import config from '../config/index.js';

let aiModelUrl = config.aiModelUrl;
let aiModelName = config.aiModelName;

export async function initIntelligence() {
  aiModelUrl = config.aiModelUrl;
  aiModelName = config.aiModelName;
  console.log(`[AI] Initialized with model: ${aiModelName} at ${aiModelUrl}`);
}

function detectMimeType(url) {
  const lower = url.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function fetchImageBase64(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 8000
  });
  const contentType = response.headers['content-type'] || detectMimeType(url);
  const mimeType = contentType.split(';')[0].trim();
  return {
    base64: Buffer.from(response.data, 'binary').toString('base64'),
    mimeType
  };
}

export async function extractColors(imageUrl) {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colors = [];
    if (palette.Vibrant) colors.push(palette.Vibrant.hex);
    if (palette.DarkVibrant) colors.push(palette.DarkVibrant.hex);
    if (palette.Muted) colors.push(palette.Muted.hex);
    return colors.slice(0, 3);
  } catch (error) {
    return [];
  }
}

export async function generateDesignTags(imageUrl) {
  try {
    const { base64, mimeType } = await fetchImageBase64(imageUrl);
    const prompt = 'Output strictly a raw JSON array of exactly 3 popular UI/UX web design style tags identifying the aesthetics in this image. No markdown, no introduction.';

    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (config.aiApiKey && config.aiApiKey !== 'no-key') {
      headers['Authorization'] = `Bearer ${config.aiApiKey}`;
    }

    const response = await axios.post(`${aiModelUrl}/v1/chat/completions`, {
      model: aiModelName,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      temperature: 0.7
    }, {
      timeout: 30000,
      headers: headers
    });

    let text = response.data.choices[0].message.content;
    // Robustly extract JSON array if model adds extra text
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    return JSON.parse(text);
  } catch (error) {
    if (error.response) {
      console.error(`Local AI error [${error.response.status}]:`, error.response.data);
    } else {
      console.error('Local AI error:', error.message);
    }
    return ['Uncategorized'];
  }
}