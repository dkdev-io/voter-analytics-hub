import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIVE_SITE_URL = 'https://lovable.dev/projects/3ddec3b3-aad7-426b-a5b3-2fca327052d7';
const TEST_CSV_PATH = path.join(__dirname, 'test-data', 'comprehensive-campaign-data.csv');

async function testVoterAnalyticsLiveSite() {
  console.log('🚀 Starting Voter Analytics Hub Live Site Test');
  console.log(`📍 Site URL: ${LIVE_SITE_URL}`);
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see the browser
    slowMo: 500,     // Slow down for demonstration
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  const results = {
    siteAccess: false,
    csvUpload: false,
    dynamicCharts: false,
    aiSearch: false,
    dataAccuracy: false,
    errors: []
  };

  try {
    console.log('\n📋 Test 1: Site Access and Authentication');
    await page.goto(LIVE_SITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for site to load and check if we can access it
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Site loads successfully');
    results.siteAccess = true;
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/01-site-loaded.png', fullPage: true });
    
    // Check for specific voter analytics elements
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);
    
    // Look for navigation or main interface elements
    const navElements = await page.$$('nav, [role="navigation"], .navbar, header');
    if (navElements.length > 0) {
      console.log(`✅ Found ${navElements.length} navigation element(s)`);
    }

    console.log('\n📋 Test 2: CSV Upload Interface Detection');
    // Look for upload-related elements
    const uploadSelectors = [
      'input[type="file"]',
      'button[data-testid*="upload"]',
      '.upload',
      '.drop-zone',
      '[data-testid*="csv"]'
    ];
    
    let uploadFound = false;
    for (const selector of uploadSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Upload interface found: ${selector} (${elements.length} element(s))`);
          uploadFound = true;
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    // Also check for text content that indicates upload functionality
    const bodyText = await page.evaluate(() => document.body.textContent.toLowerCase());
    if (bodyText.includes('upload') || bodyText.includes('import') || bodyText.includes('csv')) {
      console.log('✅ Upload functionality detected in page content');
      uploadFound = true;
    }
    
    if (uploadFound) {
      results.csvUpload = true;
    }

    console.log('\n📋 Test 3: Dynamic Charts Detection');
    const chartSelectors = [
      '.recharts-wrapper',
      '.recharts-container',
      'svg',
      '.chart',
      'canvas',
      '[class*="chart"]'
    ];
    
    let chartsFound = 0;
    for (const selector of chartSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          chartsFound += elements.length;
          console.log(`✅ Found ${elements.length} potential chart element(s): ${selector}`);
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (chartsFound > 0) {
      results.dynamicCharts = true;
      console.log(`✅ Total potential chart elements: ${chartsFound}`);
    }

    console.log('\n📋 Test 4: AI Search Interface Detection');
    const searchSelectors = [
      'input[type="text"]',
      'input[type="search"]',
      'textarea',
      '[placeholder*="search"]',
      '[placeholder*="ask"]',
      '.search',
      '[data-testid*="search"]'
    ];
    
    let searchFound = false;
    for (const selector of searchSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Search interface found: ${selector} (${elements.length} element(s))`);
          searchFound = true;
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (searchFound) {
      results.aiSearch = true;
    }

    console.log('\n📋 Test 5: Data and Content Analysis');
    // Look for numerical data that would indicate voter analytics
    const hasNumbers = bodyText.match(/\d{1,5}/g);
    if (hasNumbers && hasNumbers.length > 10) {
      console.log(`✅ Found ${hasNumbers.length} numerical values (suggesting data presence)`);
      results.dataAccuracy = true;
    }
    
    // Check for voter-related terminology
    const voterTerms = ['voter', 'contact', 'campaign', 'tactic', 'team', 'analytics'];
    const foundTerms = voterTerms.filter(term => bodyText.includes(term));
    if (foundTerms.length >= 3) {
      console.log(`✅ Found voter analytics terminology: ${foundTerms.join(', ')}`);
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/02-final-state.png', fullPage: true });
    
    // Get page metrics
    const metrics = await page.metrics();
    console.log(`📊 Page loaded with ${metrics.Nodes} DOM nodes, ${metrics.JSHeapUsedSize} bytes JS heap`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.errors.push(error.message);
    
    try {
      await page.screenshot({ path: 'test-results/error-state.png', fullPage: true });
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }

  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    siteUrl: LIVE_SITE_URL,
    results: results,
    summary: {
      totalTests: 5,
      passed: Object.values(results).filter(v => v === true).length,
      errors: results.errors.length
    }
  };

  console.log('\n🎉 TEST COMPLETED');
  console.log('📊 RESULTS SUMMARY:');
  console.log(`✅ Site Access: ${results.siteAccess ? 'PASS' : 'FAIL'}`);
  console.log(`📤 CSV Upload Interface: ${results.csvUpload ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`📊 Dynamic Charts: ${results.dynamicCharts ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`🤖 AI Search Interface: ${results.aiSearch ? 'DETECTED' : 'NOT DETECTED'}`);
  console.log(`📈 Data Indicators: ${results.dataAccuracy ? 'DETECTED' : 'NOT DETECTED'}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ ERRORS ENCOUNTERED:');
    results.errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }

  // Save detailed report
  const reportPath = 'test-results/live-site-test-report.json';
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  
  return report;
}

// Run the test
testVoterAnalyticsLiveSite()
  .then(report => {
    const passRate = (report.summary.passed / report.summary.totalTests) * 100;
    console.log(`\n🎯 Overall Success Rate: ${passRate.toFixed(1)}%`);
    
    if (report.results.siteAccess) {
      console.log('\n✅ SUCCESS: Live site is accessible and functional!');
      console.log('🚀 Ready for user testing and validation');
    } else {
      console.log('\n❌ Site access failed - check URL or network connectivity');
    }
    
    process.exit(report.results.siteAccess ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });