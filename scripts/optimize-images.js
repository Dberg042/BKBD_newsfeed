/**
 * optimize-images.js
 * Downloads remote images from news JSON files, resizes them using Sharp,
 * and saves optimized versions locally. Updates JSON with local_image field.
 */

var fs = require('fs');
var path = require('path');
var sharp = require('sharp');
var fetch = require('node-fetch');

var DATA_DIR = path.join(__dirname, '..', 'data');
var OUTPUT_DIR = path.join(__dirname, '..', 'optimized-images');
var MAX_SIZE = 200 * 1024; // 200KB
var CONCURRENCY = 3;
var DOWNLOAD_TIMEOUT = 15000;
var USER_AGENT = 'Mozilla/5.0 (compatible; BKBD-NewsFeed/1.0)';

var PASSES = [
  { width: 1920, height: 1080, quality: 75 },
  { width: 1920, height: 1080, quality: 65 },
  { width: 1920, height: 1080, quality: 55 },
  { width: 1600, height: 900,  quality: 60 },
  { width: 1280, height: 720,  quality: 60 },
  { width: 1280, height: 720,  quality: 50 },
  { width: 1280, height: 720,  quality: 40 }
];

var stats = {
  totalScanned: 0,
  noImageUrl: 0,
  cached: 0,
  optimized: 0,
  errors: 0,
  warnings: 0,
  errorUrls: []
};

function getDateCode(dateFolder) {
  // 2026-05-17 → 260517
  var parts = dateFolder.split('-');
  return parts[0].slice(2) + parts[1] + parts[2];
}

function getOutputFilename(jsonData, dateFolder) {
  var dateCode = getDateCode(dateFolder);
  if (jsonData.type === 'birthday') {
    return 'birthday_' + dateCode + '.jpg';
  }
  var id = jsonData.id || 'unknown';
  return id + '_' + dateCode + '.jpg';
}

function collectJsonFiles() {
  var files = [];
  var entries;
  try {
    entries = fs.readdirSync(DATA_DIR);
  } catch (e) {
    console.error('Cannot read data directory:', e.message);
    return files;
  }

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry)) continue;

    var dateDir = path.join(DATA_DIR, entry);
    var stat;
    try {
      stat = fs.statSync(dateDir);
    } catch (e) { continue; }
    if (!stat.isDirectory()) continue;

    var dateFiles;
    try {
      dateFiles = fs.readdirSync(dateDir);
    } catch (e) { continue; }

    for (var j = 0; j < dateFiles.length; j++) {
      var f = dateFiles[j];
      if (f === 'birthday.json' || /^news-.*\.json$/.test(f)) {
        files.push({ filePath: path.join(dateDir, f), dateFolder: entry });
      }
    }
  }

  return files;
}

function downloadImage(url) {
  var controller;
  var timeoutId;

  // AbortController may not be available in all Node versions
  if (typeof AbortController !== 'undefined') {
    controller = new AbortController();
    timeoutId = setTimeout(function() { controller.abort(); }, DOWNLOAD_TIMEOUT);
  }

  var opts = {
    headers: { 'User-Agent': USER_AGENT },
    timeout: DOWNLOAD_TIMEOUT
  };
  if (controller) {
    opts.signal = controller.signal;
  }

  return fetch(url, opts)
    .then(function(res) {
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.buffer();
    })
    .catch(function(err) {
      if (timeoutId) clearTimeout(timeoutId);
      throw err;
    });
}

function optimizeImage(buffer) {
  var passIndex = 0;

  function tryPass() {
    if (passIndex >= PASSES.length) {
      // All passes exhausted, use last pass result anyway
      var lastPass = PASSES[PASSES.length - 1];
      return sharp(buffer)
        .resize({
          width: lastPass.width,
          height: lastPass.height,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: lastPass.quality,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer({ resolveWithObject: true })
        .then(function(result) {
          return {
            buffer: result.data,
            info: result.info,
            pass: PASSES.length,
            quality: lastPass.quality,
            oversize: result.data.length > MAX_SIZE
          };
        });
    }

    var pass = PASSES[passIndex];
    return sharp(buffer)
      .resize({
        width: pass.width,
        height: pass.height,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: pass.quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer({ resolveWithObject: true })
      .then(function(result) {
        if (result.data.length <= MAX_SIZE) {
          return {
            buffer: result.data,
            info: result.info,
            pass: passIndex + 1,
            quality: pass.quality,
            oversize: false
          };
        }
        passIndex++;
        return tryPass();
      });
  }

  return tryPass();
}

function processItem(item) {
  var filePath = item.filePath;
  var dateFolder = item.dateFolder;
  var jsonStr;
  var jsonData;

  try {
    jsonStr = fs.readFileSync(filePath, 'utf8');
    jsonData = JSON.parse(jsonStr);
  } catch (e) {
    return Promise.resolve();
  }

  stats.totalScanned++;

  // Skip if no image_url
  var imageUrl = jsonData.image_url;
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    stats.noImageUrl++;
    return Promise.resolve();
  }

  // Determine output filename
  var outputFilename = getOutputFilename(jsonData, dateFolder);
  var outputPath = path.join(OUTPUT_DIR, outputFilename);
  var localImagePath = 'optimized-images/' + outputFilename;

  // Cache check: if local_image exists AND the file on disk exists
  if (jsonData.local_image && jsonData.local_image === localImagePath) {
    if (fs.existsSync(outputPath)) {
      stats.cached++;
      console.log('  [cached] ' + outputFilename);
      return Promise.resolve();
    }
  }

  // Download and optimize
  return downloadImage(imageUrl)
    .then(function(buffer) {
      return optimizeImage(buffer);
    })
    .then(function(result) {
      // Write optimized image
      fs.writeFileSync(outputPath, result.buffer);

      // Update JSON with local_image field
      jsonData.local_image = localImagePath;
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2) + '\n');

      var sizeKB = (result.buffer.length / 1024).toFixed(1);
      var dims = result.info.width + 'x' + result.info.height;

      if (result.oversize) {
        stats.warnings++;
        console.log('  [WARNING] ' + outputFilename + ' — ' + sizeKB + 'KB (>200KB) ' + dims + ' Pass ' + result.pass + ' @ Q' + result.quality);
      } else {
        console.log('  [optimized] ' + outputFilename + ' — ' + sizeKB + 'KB ' + dims + ' Pass ' + result.pass + ' @ Q' + result.quality);
      }
      stats.optimized++;
    })
    .catch(function(err) {
      stats.errors++;
      stats.errorUrls.push(imageUrl);
      console.log('  [ERROR] ' + outputFilename + ' — ' + err.message + ' (' + imageUrl + ')');
    });
}

function runWorkerPool(items, concurrency) {
  var index = 0;
  var active = 0;

  return new Promise(function(resolve) {
    function next() {
      if (index >= items.length && active === 0) {
        resolve();
        return;
      }

      while (active < concurrency && index < items.length) {
        active++;
        var currentItem = items[index++];
        processItem(currentItem).then(function() {
          active--;
          next();
        });
      }
    }
    next();
  });
}

function printSummary() {
  // Calculate total disk size of optimized-images/
  var totalBytes = 0;
  try {
    var files = fs.readdirSync(OUTPUT_DIR);
    for (var i = 0; i < files.length; i++) {
      var stat = fs.statSync(path.join(OUTPUT_DIR, files[i]));
      totalBytes += stat.size;
    }
  } catch (e) {}

  var totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log('');
  console.log('=== SUMMARY ===');
  console.log('Total JSONs scanned:     ' + stats.totalScanned);
  console.log('No image_url (skipped):  ' + stats.noImageUrl);
  console.log('Already cached:          ' + stats.cached);
  console.log('Newly optimized:         ' + stats.optimized);
  console.log('Download errors:         ' + stats.errors);
  console.log('Optimization warnings:   ' + stats.warnings + '  (couldn\'t get under 200KB)');
  console.log('Total disk size:         ' + totalMB + ' MB');

  if (stats.errorUrls.length > 0) {
    console.log('');
    console.log('Failed URLs:');
    for (var i = 0; i < stats.errorUrls.length; i++) {
      console.log('  - ' + stats.errorUrls[i]);
    }
  }
}

function main() {
  console.log('Image optimization pipeline starting...');
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  var items = collectJsonFiles();
  console.log('Found ' + items.length + ' JSON files to scan.');
  console.log('');

  runWorkerPool(items, CONCURRENCY)
    .then(function() {
      printSummary();
      process.exit(0);
    })
    .catch(function(err) {
      console.error('Unexpected error:', err);
      printSummary();
      process.exit(0); // Always exit 0
    });
}

main();
