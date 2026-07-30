const { GoogleGenAI } = require('@google/genai');
const { Buffer } = require('buffer');

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your .env file.');
  }
  return key;
}

function parseBase64Image(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Invalid image data.');
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Unsupported image format. Use a valid base64 image.');
  }

  return {
    mimeType: match[1],
    base64: match[2]
  };
}

const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

async function generatePostCopy({ product, platform, language, tone, description }) {
  if (!product || !platform || !language || !tone) {
    throw new Error('Missing parameters for post generation.');
  }

  const details = description ? ` Use the following product details: ${description}.` : '';
  const prompt = `Write a ${tone} social media post for ${platform} in ${language}, promoting this product called "${product}".${details} The copy should be ready to copy and paste, without any introductory sentence such as "Voici une proposition..." or similar. Include 2-3 relevant hashtags at the end, on a separate line.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt
  });

  if (!response || typeof response.text !== 'string') {
    throw new Error('Gemini did not return valid text.');
  }

  let text = response.text.trim();
  text = text.replace(/^Voici une proposition de post[^\n]*\n?/i, '').trim();
  text = text.replace(/^Here is a suggested post[^\n]*\n?/i, '').trim();

  return text;
}

async function generateAdFromImage(imageDataUrl, prompt) {
  if (!imageDataUrl || !prompt) {
    throw new Error('Image data and prompt are required for Gemini image generation.');
  }

  const { mimeType, base64 } = parseBase64Image(imageDataUrl);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      { text: prompt },
      { inlineData: { mimeType, data: base64 } }
    ]
  });

  if (!response || !Array.isArray(response.candidates) || response.candidates.length === 0) {
    throw new Error('Gemini did not return an image candidate.');
  }

  const parts = response.candidates[0].content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png'
      };
    }
  }

  throw new Error('Gemini did not return inline image data.');
}

module.exports = {
  generatePostCopy,
  generateAdFromImage
};
