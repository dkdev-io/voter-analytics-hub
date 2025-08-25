import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_URL = 'http://localhost:8084/demo';
const TEST_CSV_PATH = path.join(__dirname, 'test-data', 'comprehensive-campaign-data.csv');

async function testChartsFunctionality() {
  console.log('🚀 Starting Charts Functionality Test');
  console.log(`📍 Testing: ${LOCAL_URL}`);
  console.log(`📁 Test data: ${TEST_CSV_PATH}`);
  
  const browser = await puppeteer.launch({
    headless: false, // Keep browser visible
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    // Navigate to the demo page
    console.log('\n📄 Loading demo page...');
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Demo page loaded');
    
    // Wait for initial rendering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take initial screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'charts-01-initial.png'),
      fullPage: true 
    });
    console.log('📸 Initial screenshot saved');
    
    // Upload CSV data first
    console.log('\n📤 Uploading CSV data for chart generation...');
    const buttons = await page.$$('button');
    let uploadButtonFound = false;
    
    for (const button of buttons) {
      const buttonText = await button.evaluate(el => el.textContent);
      if (buttonText && buttonText.toLowerCase().includes('upload')) {
        await button.click();
        uploadButtonFound = true;
        break;
      }
    }
    
    if (uploadButtonFound) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find and use file input
      const fileInputs = await page.$$('input[type="file"]');
      if (fileInputs.length > 0) {
        await fileInputs[0].uploadFile(TEST_CSV_PATH);
        console.log('✅ CSV data uploaded');
        
        // Wait for data processing and chart generation
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await page.screenshot({ 
          path: path.join(__dirname, 'test-results', 'charts-02-after-upload.png'),
          fullPage: true 
        });
        console.log('📸 After upload screenshot saved');
      }
    }
    
    // Now test for charts
    console.log('\n📊 Checking for chart elements...');
    
    // Look for SVG elements (Recharts uses SVG, not canvas)
    const svgElements = await page.$$('svg');
    console.log(`📊 Found ${svgElements.length} SVG elements`);
    
    // Look for specific chart containers
    const chartContainers = await page.$$('[id*="chart"], .recharts-wrapper, .recharts-surface');
    console.log(`📊 Found ${chartContainers.length} chart container elements`);
    
    // Look for line chart elements
    const lineElements = await page.$$('.recharts-line, path[class*="recharts"]');
    console.log(`📈 Found ${lineElements.length} line chart elements`);
    
    // Look for pie chart elements  
    const pieElements = await page.$$('.recharts-pie, .recharts-pie-sector');
    console.log(`🥧 Found ${pieElements.length} pie chart elements`);
    
    // Check specific chart IDs
    const chartIds = ['pie-charts-row', 'activity-line-chart', 'cumulative-line-chart'];
    for (const chartId of chartIds) {
      const element = await page.$(`#${chartId}`);
      if (element) {
        console.log(`✅ Found chart section: ${chartId}`);
        
        // Scroll to the chart
        await element.scrollIntoView();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Take screenshot of this specific chart
        await page.screenshot({ 
          path: path.join(__dirname, 'test-results', `charts-${chartId}.png`),
          fullPage: true 
        });
        console.log(`📸 Screenshot of ${chartId} saved`);
      } else {
        console.log(`❌ Chart section not found: ${chartId}`);
      }
    }
    
    // Check for chart data loading
    console.log('\n📊 Analyzing chart data...');
    const chartData = await page.evaluate(() => {
      // Look for any rendered chart text/labels
      const labels = Array.from(document.querySelectorAll('.recharts-text, .recharts-label'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0);
        
      // Look for chart legends  
      const legends = Array.from(document.querySelectorAll('.recharts-legend-item-text'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0);
        
      return {
        labels: labels.slice(0, 10), // First 10 labels
        legends: legends.slice(0, 10), // First 10 legends
        totalLabels: labels.length,
        totalLegends: legends.length
      };
    });
    
    console.log('📊 Chart data found:');
    console.log(`  - Total labels: ${chartData.totalLabels}`);
    console.log(`  - Total legends: ${chartData.totalLegends}`);
    console.log(`  - Sample labels: ${chartData.labels.join(', ')}`);
    console.log(`  - Sample legends: ${chartData.legends.join(', ')}`);
    
    // Test responsive behavior
    console.log('\n📱 Testing responsive chart behavior...');
    await page.setViewport({ width: 800, height: 600 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'charts-responsive-mobile.png'),
      fullPage: true 
    });
    console.log('📸 Mobile responsive screenshot saved');
    
    // Back to desktop view
    await page.setViewport({ width: 1400, height: 900 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'charts-final-comprehensive.png'),
      fullPage: true 
    });
    console.log('\n📸 Final comprehensive screenshot saved');
    
    // Summary
    const summary = {
      svgElements: svgElements.length,
      chartContainers: chartContainers.length,
      lineElements: lineElements.length,
      pieElements: pieElements.length,
      chartLabels: chartData.totalLabels,
      chartLegends: chartData.totalLegends
    };
    
    console.log('\n📊 CHART FUNCTIONALITY TEST SUMMARY:');
    console.log('=====================================');
    console.log(`SVG Elements: ${summary.svgElements} ${summary.svgElements > 0 ? '✅' : '❌'}`);
    console.log(`Chart Containers: ${summary.chartContainers} ${summary.chartContainers > 0 ? '✅' : '❌'}`);
    console.log(`Line Chart Elements: ${summary.lineElements} ${summary.lineElements > 0 ? '✅' : '❌'}`);
    console.log(`Pie Chart Elements: ${summary.pieElements} ${summary.pieElements > 0 ? '✅' : '❌'}`);
    console.log(`Chart Labels: ${summary.chartLabels} ${summary.chartLabels > 0 ? '✅' : '❌'}`);
    console.log(`Chart Legends: ${summary.chartLegends} ${summary.chartLegends > 0 ? '✅' : '❌'}`);
    
    const overallSuccess = summary.svgElements > 0 && summary.chartContainers > 0 && summary.chartLabels > 0;
    console.log(`\nOverall Status: ${overallSuccess ? '✅ CHARTS WORKING' : '❌ CHARTS NOT WORKING'}`);
    
    // Save test report
    fs.writeFileSync(
      path.join(__dirname, 'test-results', 'charts-test-report.json'),
      JSON.stringify(summary, null, 2)
    );
    console.log('📊 Test report saved to charts-test-report.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    try {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await pages[0].screenshot({ 
          path: path.join(__dirname, 'test-results', 'charts-error.png'),
          fullPage: true 
        });
        console.log('📸 Error screenshot saved');
      }
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
  } finally {
    console.log('\n⏳ Keeping browser open for 5 seconds for inspection...');
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
}

// Run the test
testChartsFunctionality().catch(console.error);