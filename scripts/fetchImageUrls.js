// scripts/fetchImageUrls.js

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function main() {
  const apiUrl = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }

    const jsonData = await response.json();
    const data = jsonData.data;

    if (!data) {
      throw new Error('JSON does not have a "data" property.');
    }

    const imageUrls = [];

    for (const key in data) {
      const subproperty = data[key];
      if (subproperty && subproperty.dhd) {
        imageUrls.push(subproperty.dhd);
      }
    }

    const outputPath = path.join(__dirname, '..', 'images.json');
    fs.writeFileSync(outputPath, JSON.stringify(imageUrls, null, 2));
    console.log(`Successfully wrote ${imageUrls.length} image URLs to images.json`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
