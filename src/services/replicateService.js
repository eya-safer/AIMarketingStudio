const Replicate = require('replicate');
const { Buffer } = require('buffer');

function getReplicateApiToken() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('Replicate API token not configured. Set REPLICATE_API_TOKEN in your .env file.');
  }
  return token;
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

async function resolveOutputUrl(output) {
  if (!output) {
    return null;
  }

  if (typeof output === 'string') {
    return output;
  }

  if (typeof output.url === 'function') {
    return await output.url();
  }

  if (typeof output.url === 'string') {
    return output.url;
  }

  if (Array.isArray(output) && output.length > 0) {
    return resolveOutputUrl(output[0]);
  }

  return null;
}

async function downloadImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download replicate output: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

async function generateImage(prompt, options = {}) {
  const token = getReplicateApiToken();
  const replicate = new Replicate({ auth: token });

  const input = { prompt };

  if (options.imageDataUrl) {
    const { base64 } = parseBase64Image(options.imageDataUrl);
    input.image = Buffer.from(base64, 'base64');
  }

  if (options.width) input.width = options.width;
  if (options.height) input.height = options.height;
  if (options.numOutputs) input.num_outputs = options.numOutputs;

  const output = await replicate.run('stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', { input });
  const imageUrl = await resolveOutputUrl(output);
  if (!imageUrl) {
    throw new Error('Replicate did not return an image URL.');
  }

  const base64 = await downloadImageAsBase64(imageUrl);
  return {
    base64,
    mimeType: 'image/png',
    prompt,
    outputUrl: imageUrl
  };
}

module.exports = {
  generateImage
};
