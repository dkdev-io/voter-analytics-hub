import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_URL = 'http://localhost:8084/demo';
const TEST_CSV_PATH = path.join(__dirname, 'test-data', 'comprehensive-campaign-data.csv');

async function testUploadFunctionality() {
  console.log('🚀 Starting Upload Functionality Test');
  console.log(`📍 Testing: ${LOCAL_URL}`);
  console.log(`📁 Test data: ${TEST_CSV_PATH}`);
  
  const browser = await puppeteer.launch({
    headless: false, // Keep browser visible to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 100 // Slow down to see interactions
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to the demo page
    console.log('\n📄 Loading demo page...');
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Demo page loaded');
    
    // Wait for the page to fully render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for the upload button
    console.log('\n🔍 Looking for upload button...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons, checking text content...`);
    
    let uploadButtonFound = false;
    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].evaluate(el => el.textContent);
      console.log(`Button ${i + 1}: "${buttonText}"`);
      if (buttonText && buttonText.toLowerCase().includes('upload')) {
        console.log('✅ Found upload button!');
        // Click the upload button
        await buttons[i].click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        uploadButtonFound = true;
        break;
      }
    }
    
    if (!uploadButtonFound) {
      console.log('⚠️  Upload button not found');
    }
    
    // Take screenshot after clicking upload button
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'after-upload-click.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot after upload click saved');
    
    // Look for file input (might be in a dialog or become visible)
    console.log('\n🔍 Looking for file input after dialog opens...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for file input elements
    const fileInputs = await page.$$('input[type="file"]');
    console.log(`📁 Found ${fileInputs.length} file input elements`);
    
    if (fileInputs.length > 0) {
      console.log('✅ File input found, uploading test data...');
      await fileInputs[0].uploadFile(TEST_CSV_PATH);
      console.log('✅ CSV file uploaded');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Look for success indicators or data updates
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'after-file-upload.png'),
        fullPage: true 
      });
      console.log('📸 Screenshot after file upload saved');
      
      // Check for charts or data visualization
      console.log('\n📊 Checking for charts after upload...');
      const chartsAfterUpload = await page.$$('canvas');
      console.log(`📊 Found ${chartsAfterUpload.length} chart elements after upload`);
      
      // Check for tables or data display
      const tablesAfterUpload = await page.$$('table, [role="table"]');
      console.log(`📋 Found ${tablesAfterUpload.length} table elements after upload`);
      
    } else {
      console.log('⚠️  File input not found even after clicking upload');
      
      // Check if there's a dialog or modal
      const dialogs = await page.$$('[role="dialog"], .dialog, .modal, [data-testid*="dialog"]');
      console.log(`💬 Found ${dialogs.length} dialog elements`);
      
      if (dialogs.length > 0) {
        console.log('Found dialog, taking screenshot...');
        await page.screenshot({ 
          path: path.join(__dirname, 'test-results', 'dialog-open.png'),
          fullPage: true 
        });
      }
    }
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchInputs = await page.$$('input[placeholder*="search" i], input[type="search"], textarea[placeholder*="search" i]');
    console.log(`🔍 Found ${searchInputs.length} search input elements`);
    
    if (searchInputs.length > 0) {
      console.log('✅ Search input found, testing search...');
      await searchInputs[0].type('high value donors', {delay: 50});
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'search-test.png'),
        fullPage: true 
      });
      console.log('📸 Search test screenshot saved');
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'final-comprehensive.png'),
      fullPage: true 
    });
    console.log('\n📸 Final comprehensive screenshot saved');
    
    console.log('\n✅ Upload functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    try {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await pages[0].screenshot({ 
          path: path.join(__dirname, 'test-results', 'error-upload-test.png'),
          fullPage: true 
        });
        console.log('📸 Error screenshot saved');
      }
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
  } finally {
    console.log('\n⏳ Keeping browser open for 5 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔚 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
  }
}

// Create test-results directory if it doesn't exist
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
  console.log('📁 Created test-results directory');
}

// Run the test
testUploadFunctionality().catch(console.error);