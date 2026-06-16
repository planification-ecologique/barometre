#!/usr/bin/env node

/**
 * Build-time script to download Grist CSVs and save them as backups
 * These files will be included in the build and can be used as fallback
 * if the Grist API is unavailable at runtime.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load Grist URLs from shared config
const gristUrlsConfig = require('../src/config/gristUrls.json');
const GRIST_URLS = gristUrlsConfig.GRIST_URLS;
const GRIST_LEVIERS_URL = gristUrlsConfig.GRIST_LEVIERS_URL;
const GRIST_DOCUMENTS_URL = gristUrlsConfig.GRIST_DOCUMENTS_URL;

// Output directory (public folder so files are copied to dist during build)
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'grist-backups');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Download a file from a URL and save it to disk
 * @param {string} url - URL to download from (must be HTTPS)
 * @param {string} outputPath - Path to save the file
 * @returns {Promise<void>}
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Saved to ${outputPath}`);
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
  });
}

/**
 * Main function to download all CSVs
 */
async function main() {
  console.log('Starting Grist CSV backup download...\n');
  
  const downloads = [
    {
      url: GRIST_URLS.production,
      filename: 'grist-indicators.csv'
    },
    {
      url: GRIST_LEVIERS_URL,
      filename: 'grist-leviers.csv'
    },
    {
      url: GRIST_DOCUMENTS_URL,
      filename: 'grist-documents.csv'
    }
  ];
  
  const errors = [];
  
  for (const download of downloads) {
    try {
      const outputPath = path.join(OUTPUT_DIR, download.filename);
      await downloadFile(download.url, outputPath);
    } catch (error) {
      console.error(`✗ Error downloading ${download.filename}:`, error.message);
      errors.push({ file: download.filename, error: error.message });
    }
  }
  
  console.log('\n--- Download Summary ---');
  if (errors.length === 0) {
    console.log('✓ All CSVs downloaded successfully!');
    console.log(`Files saved to: ${OUTPUT_DIR}`);
  } else {
    console.error(`✗ ${errors.length} file(s) failed to download:`);
    errors.forEach(({ file, error }) => {
      console.error(`  - ${file}: ${error}`);
    });
    // Exit with error code so build fails if downloads fail
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
