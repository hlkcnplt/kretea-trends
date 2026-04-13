import { GoogleGenerativeAI } from '@google/generative-ai';
import Vibrant from 'node-vibrant';
import axios from 'axios';

let genAI = null;

export async function initIntelligence() {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
}

function detectMimeType(url) {
  const lower = url.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function fetchImageBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
  const contentType = response.headers['content-type'] || detectMimeType(url);
  const mimeType = contentType.split(';')[0].trim();
  return { base64: Buffer.from(response.data, 'binary').toString('base64'), mimeType };
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
  if (!genAI) {
    return ['AI_OFFLINE'];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const { base64, mimeType } = await fetchImageBase64(imageUrl);

    const imageParts = [{ inlineData: { data: base64, mimeType } }];

    const prompt = 'Output strictly a raw JSON array of exactly 3 popular UI/UX web design style tags identifying the aesthetics in this image. No markdown, no introduction.';

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    return ['Uncategorized'];
  }
}
