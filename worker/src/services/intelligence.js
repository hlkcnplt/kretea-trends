import { GoogleGenerativeAI } from '@google/generative-ai';
import Vibrant from 'node-vibrant';
import axios from 'axios';

let genAI = null;

export async function initIntelligence() {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
}

async function fetchImageBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
  return Buffer.from(response.data, 'binary').toString('base64');
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
    return ["AI_OFFLINE"];
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const base64Image = await fetchImageBase64(imageUrl);
    
    const imageParts = [{
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    }];
    
    const prompt = "Output strictly a raw JSON array of exactly 3 popular UI/UX web design style tags identifying the aesthetics in this image. No markdown, no introduction.";
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    return ["Uncategorized"];
  }
}
