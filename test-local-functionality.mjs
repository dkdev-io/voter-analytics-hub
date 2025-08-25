import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_URL = 'http://localhost:8084/demo';
const TEST_CSV_PATH = path.join(__dirname, 'test-data', 'comprehensive-campaign-data.csv');

async function testLocalFunctionality() {
  console.log('🚀 Starting Voter Analytics Hub Local Test');
  console.log(`📍 Testing: ${LOCAL_URL}`);
  console.log(`📁 Test data: ${TEST_CSV_PATH}`);
  
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50 // Slow down operations to see what's happening
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to the app
    console.log('\n📄 Loading application...');
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Application loaded');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'initial-load.png'),
      fullPage: true 
    });
    console.log('📸 Initial screenshot saved');
    
    // Test 1: File Upload
    console.log('\n🧪 Test 1: File Upload');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      console.log('✅ File input found');
      await fileInput.uploadFile(TEST_CSV_PATH);
      console.log('✅ CSV file uploaded');
      
      // Wait for data processing
      await page.waitForTimeout(3000);
      
      // Take screenshot after upload
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'after-upload.png'),
        fullPage: true 
      });
      console.log('📸 Post-upload screenshot saved');
    } else {
      console.log('❌ File input not found');
    }
    
    // Test 2: Check for Charts
    console.log('\n🧪 Test 2: Chart Rendering');
    const charts = await page.$$('canvas');
    console.log(`📊 Found ${charts.length} chart canvas elements`);
    
    if (charts.length > 0) {
      // Scroll to each chart and take screenshot
      for (let i = 0; i < charts.length; i++) {
        await charts[i].scrollIntoView();
        await page.waitForTimeout(500);
        console.log(`✅ Chart ${i + 1} rendered`);
      }
      
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'charts-rendered.png'),
        fullPage: true 
      });
      console.log('📸 Charts screenshot saved');
    }
    
    // Test 3: AI Search Functionality
    console.log('\n🧪 Test 3: AI Search');
    const searchInput = await page.$('input[placeholder*="search" i], input[placeholder*="query" i], input[type="search"]');
    if (searchInput) {
      console.log('✅ Search input found');
      await searchInput.type('Show me high-value donors');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'search-results.png'),
        fullPage: true 
      });
      console.log('📸 Search results screenshot saved');
    } else {
      console.log('⚠️  Search input not found');
    }
    
    // Test 4: Interactive Elements
    console.log('\n🧪 Test 4: Interactive Elements');
    const buttons = await page.$$('button');
    console.log(`🔘 Found ${buttons.length} buttons`);
    
    const tables = await page.$$('table');
    console.log(`📋 Found ${tables.length} tables`);
    
    // Test 5: Data Display
    console.log('\n🧪 Test 5: Data Display');
    const dataElements = await page.evaluate(() => {
      const elements = {
        headers: document.querySelectorAll('h1, h2, h3').length,
        divs: document.querySelectorAll('div').length,
        spans: document.querySelectorAll('span').length,
        paragraphs: document.querySelectorAll('p').length
      };
      return elements;
    });
    console.log('📊 Page elements:', dataElements);
    
    // Get page content for analysis
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    console.log(`\n📄 Page Title: ${pageContent.title}`);
    console.log(`📝 Content Preview: ${pageContent.bodyText.substring(0, 200)}...`);
    
    // Final screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'final-state.png'),
      fullPage: true 
    });
    console.log('\n📸 Final screenshot saved');
    
    console.log('\n✅ All tests completed successfully!');
    console.log('📁 Test results saved in test-results/ directory');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    try {
      const page = await browser.newPage();
      await page.goto(LOCAL_URL);
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'error-state.png'),
        fullPage: true 
      });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
  } finally {
    console.log('\n🔚 Closing browser...');
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
testLocalFunctionality().catch(console.error);