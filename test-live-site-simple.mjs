import puppeteer from 'puppeteer';

const LIVE_SITE_URL = 'https://lovable.dev/projects/3ddec3b3-aad7-426b-a5b3-2fca327052d7';

async function testLiveSite() {
  console.log('🚀 Starting simple live site test');
  console.log(`📍 Testing: ${LIVE_SITE_URL}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Navigate to the site
    console.log('📄 Loading page...');
    const response = await page.goto(LIVE_SITE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log(`✅ Page loaded with status: ${response.status()}`);
    
    // Check for key elements
    console.log('\n🔍 Checking page elements:');
    
    // Wait for and check main content
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      console.log('✅ Page body loaded');
      
      // Get page title
      const title = await page.title();
      console.log(`📋 Page title: ${title}`);
      
      // Check for any visible text content
      const bodyText = await page.evaluate(() => {
        return document.body.innerText.substring(0, 200);
      });
      console.log(`📝 Page content preview: ${bodyText}...`);
      
      // Take a screenshot
      await page.screenshot({ 
        path: 'voter-analytics-hub/test-results/live-site-screenshot.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved to test-results/live-site-screenshot.png');
      
    } catch (error) {
      console.error('❌ Error checking page elements:', error.message);
    }
    
    // Try to check for specific app elements
    console.log('\n🔍 Checking for app-specific elements:');
    
    const elementsToCheck = [
      { selector: '#root', name: 'React root' },
      { selector: '[data-testid="file-upload"]', name: 'File upload component' },
      { selector: 'button', name: 'Buttons' },
      { selector: 'input', name: 'Input fields' },
      { selector: 'canvas', name: 'Chart canvas' },
      { selector: '.chart-container', name: 'Chart container' }
    ];
    
    for (const element of elementsToCheck) {
      try {
        const exists = await page.$(element.selector);
        if (exists) {
          console.log(`✅ Found: ${element.name}`);
        } else {
          console.log(`⚠️  Not found: ${element.name}`);
        }
      } catch (error) {
        console.log(`⚠️  Error checking ${element.name}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Live site test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

// Run the test
testLiveSite().catch(console.error);