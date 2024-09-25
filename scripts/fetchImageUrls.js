// scripts/fetchImageUrls.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname is not available in ESM, so we need to recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const apiUrl = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';

  try {
    console.log(`Fetching data from API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    console.log(`Received response with status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`⛔ Failed to fetch JSON file: ${response.statusText}`);
    }

    const jsonData = await response.json();
    const data = jsonData.data;

    if (!data) {
      throw new Error('⛔ JSON does not have a "data" property at its root.');
    }

    const imageUrls = [];

    for (const key in data) {
      const subproperty = data[key];
      if (subproperty && subproperty.dhd) {
        imageUrls.push(subproperty.dhd);
      }
    }

    console.log(`Extracted ${imageUrls.length} image URLs.`);

    const outputPath = path.join(__dirname, '..', 'public', 'images.json');
    fs.writeFileSync(outputPath, JSON.stringify(imageUrls, null, 2));
    console.log(`Successfully wrote ${imageUrls.length} image URLs to public/images.json`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
