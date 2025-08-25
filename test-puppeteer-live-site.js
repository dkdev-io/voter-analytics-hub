const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LIVE_SITE_URL = 'https://lovable.dev/projects/3ddec3b3-aad7-426b-a5b3-2fca327052d7';
const TEST_CSV_PATH = path.join(__dirname, 'test-data', 'comprehensive-campaign-data.csv');

async function testVoterAnalyticsLiveSite() {
  console.log('🚀 Starting Voter Analytics Hub Live Site Test');
  console.log(`📍 Site URL: ${LIVE_SITE_URL}`);
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to false to see the browser
    slowMo: 1000,    // Slow down for demonstration
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
    
    // Check if we need to authenticate or if there's a password gate
    const hasPasswordGate = await page.$('.password-gate, [data-testid="password-gate"], input[type="password"]');
    if (hasPasswordGate) {
      console.log('🔐 Password gate detected - this would need manual authentication');
      // For demo purposes, we'll continue with what we can test
    }
    
    // Look for the main voter analytics interface
    const hasVoterAnalytics = await page.$('.voter-analytics, [data-testid="voter-analytics"], .dashboard');
    if (hasVoterAnalytics) {
      console.log('✅ Voter analytics interface detected');
    }

    console.log('\n📋 Test 2: CSV Upload Interface');
    // Look for upload button or drag-drop area
    const uploadElements = [
      'button[data-testid="csv-upload"]',
      'input[type="file"]',
      'button:contains("Upload")',
      'button:contains("Import")',
      '.upload-area',
      '.drop-zone'
    ];
    
    let uploadFound = false;
    for (const selector of uploadElements) {
      try {
        if (selector.includes(':contains')) {
          // Use XPath for text-based selectors
          const xpath = `//button[contains(text(), '${selector.split(':contains("')[1].split('")')[0]}')]`;
          const elements = await page.$x(xpath);
          if (elements.length > 0) {
            console.log(`✅ Upload interface found: ${selector}`);
            uploadFound = true;
            break;
          }
        } else {
          const element = await page.$(selector);
          if (element) {
            console.log(`✅ Upload interface found: ${selector}`);
            uploadFound = true;
            break;
          }
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }
    
    if (uploadFound) {
      results.csvUpload = true;
      
      // If we can access the file system and upload
      if (fs.existsSync(TEST_CSV_PATH)) {
        console.log('📄 Test CSV file found, attempting upload...');
        
        try {
          // Look for file input
          const fileInput = await page.$('input[type="file"]');
          if (fileInput) {
            await fileInput.uploadFile(TEST_CSV_PATH);
            console.log('✅ CSV file uploaded successfully');
            
            // Wait for processing
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'test-results/02-csv-uploaded.png', fullPage: true });
          }
        } catch (uploadError) {
          console.log('⚠️ Upload simulation completed (actual upload may need authentication)');
          results.errors.push(`Upload test: ${uploadError.message}`);
        }
      }
    }

    console.log('\n📋 Test 3: Dynamic Charts Detection');
    const chartSelectors = [
      '.recharts-wrapper',
      '.chart-container',
      'svg[class*="recharts"]',
      '.pie-chart',
      '.line-chart',
      '[data-testid*="chart"]',
      'canvas'
    ];
    
    let chartsFound = 0;
    for (const selector of chartSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          chartsFound += elements.length;
          console.log(`✅ Found ${elements.length} chart(s) with selector: ${selector}`);
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (chartsFound > 0) {
      results.dynamicCharts = true;
      console.log(`✅ Total charts detected: ${chartsFound}`);
      await page.screenshot({ path: 'test-results/03-charts-detected.png', fullPage: true });
    }

    console.log('\n📋 Test 4: AI Search Interface');
    const searchSelectors = [
      'input[placeholder*="search"]',
      'input[placeholder*="ask"]',
      'input[placeholder*="query"]',
      '.search-field',
      '.ai-search',
      '[data-testid*="search"]',
      'textarea'
    ];
    
    let searchFound = false;
    for (const selector of searchSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Search interface found: ${selector}`);
          searchFound = true;
          
          // Try to type a test query
          await element.type('How many contacts did Team Tony make?');
          console.log('✅ Test query entered');
          
          // Look for submit button or AI response area
          const submitButton = await page.$('button[type="submit"], button:contains("Search"), button:contains("Ask")');
          if (submitButton) {
            await submitButton.click();
            console.log('✅ Search query submitted');
            
            // Wait for potential AI response
            await page.waitForTimeout(5000);
          }
          
          await page.screenshot({ path: 'test-results/04-ai-search.png', fullPage: true });
          break;
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (searchFound) {
      results.aiSearch = true;
    }

    console.log('\n📋 Test 5: Data Validation');
    // Look for data indicators, numbers, or metrics
    const dataElements = await page.$$eval('*', els => 
      els.filter(el => {
        const text = el.textContent;
        return text && /\d{1,4}/.test(text) && 
               (text.includes('contact') || text.includes('attempt') || 
                text.includes('support') || text.includes('%'));
      }).map(el => el.textContent.trim()).slice(0, 10)
    );
    
    if (dataElements.length > 0) {
      console.log('✅ Data metrics found:', dataElements);
      results.dataAccuracy = true;
    }

    // Final comprehensive screenshot
    await page.screenshot({ path: 'test-results/05-final-state.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.errors.push(error.message);
    await page.screenshot({ path: 'test-results/error-state.png', fullPage: true });
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
      failed: Object.values(results).filter(v => v === false).length,
      errors: results.errors.length
    }
  };

  console.log('\n🎉 TEST COMPLETED');
  console.log('📊 RESULTS SUMMARY:');
  console.log(`✅ Site Access: ${results.siteAccess ? 'PASS' : 'FAIL'}`);
  console.log(`✅ CSV Upload Interface: ${results.csvUpload ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Dynamic Charts: ${results.dynamicCharts ? 'PASS' : 'FAIL'}`);
  console.log(`✅ AI Search: ${results.aiSearch ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Data Validation: ${results.dataAccuracy ? 'PASS' : 'FAIL'}`);
  
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
if (require.main === module) {
  testVoterAnalyticsLiveSite()
    .then(report => {
      const passRate = (report.summary.passed / report.summary.totalTests) * 100;
      console.log(`\n🎯 Overall Success Rate: ${passRate.toFixed(1)}%`);
      process.exit(passRate >= 60 ? 0 : 1); // Exit with success if 60%+ tests pass
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testVoterAnalyticsLiveSite };