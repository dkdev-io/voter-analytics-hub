# Manual Testing Guide - Voter Analytics Hub
**Version**: Phases 1-3 Integration Testing  
**Application URL**: http://localhost:8082/  
**Test Data**: test-data/sample-campaign-data.csv

## Pre-Testing Setup
1. Ensure development server is running: `npm run dev`
2. Verify server responds: http://localhost:8082/
3. Have sample CSV file ready: test-data/sample-campaign-data.csv

## Test Sequence: Step-by-Step

### Test 1: Application Access & Authentication
**Objective**: Verify the application loads and authentication works

**Steps**:
1. Open browser to http://localhost:8082/
2. **Expected**: Landing page or authentication screen loads
3. **Verify**: Page renders without errors in browser console
4. If login required, create test account or use existing credentials
5. **Expected**: Access to voter analytics dashboard

**Success Criteria**: ✅ Application accessible, no console errors

---

### Test 2: CSV Upload with Sample Data
**Objective**: Test flexible CSV upload with dynamic field mapping

**Steps**:
1. Navigate to data import section (look for "Import Data" or "Upload CSV" button)
2. Click upload button
3. Select file: `test-data/sample-campaign-data.csv`
4. **Expected**: Upload dialog appears with field mapping interface

**Field Mapping Verification**:
Expected CSV columns detected:
- ✅ Date (date field)
- ✅ Contact Person (text field) 
- ✅ Contact Method (category field) - **KEY TEST**: Should detect 6 unique values
- ✅ Team Name (category field) - **KEY TEST**: Should detect 4 unique values
- ✅ Total Attempts (numeric field)
- ✅ Successful Contacts (numeric field)
- ✅ Not Available (numeric field)
- ✅ Declined (numeric field)
- ✅ Invalid Info (numeric field)
- ✅ Supporters (numeric field)
- ✅ Against (numeric field)
- ✅ Neutral (numeric field)

**Expected Contact Methods** (6 unique):
1. Email
2. Door Knocking
3. Text Message
4. Phone Call
5. Social Media
6. Direct Mail

**Expected Teams** (4 unique):
1. Team Alpha
2. Team Beta
3. Team Gamma
4. Team Delta

**Steps Continued**:
5. Review field mappings - should be largely auto-detected
6. Correct any mismatched fields if necessary
7. Click "Import" or "Process Data"
8. **Expected**: Progress indicator shows processing
9. **Expected**: Success message with "31 records imported"
10. **Expected**: Redirect to dashboard with imported data visible

**Success Criteria**: ✅ All 31 records imported, 6 contact methods & 4 teams detected

---

### Test 3: Dynamic Chart Validation
**Objective**: Verify charts dynamically display all categories

**Charts to Test**:

#### Chart 1: Contact Methods Distribution
**Location**: Look for pie chart labeled "Contact Methods" or "Tactics"
**Expected Display**:
- ✅ 6 slices, each with different color
- ✅ Labels: Email, Door Knocking, Text Message, Phone Call, Social Media, Direct Mail
- ✅ Values should sum to reasonable totals
- ✅ Hover shows exact counts

#### Chart 2: Teams Performance
**Location**: Look for pie chart labeled "Teams" or "Team Distribution"  
**Expected Display**:
- ✅ 4 slices with distinct colors
- ✅ Labels: Team Alpha, Team Beta, Team Gamma, Team Delta
- ✅ Proportional sizes based on activity
- ✅ Hover shows team statistics

#### Chart 3: Time Series/Activity Chart
**Location**: Look for line chart showing activity over time
**Expected Display**:
- ✅ X-axis: January 15-24, 2024 (10 days)
- ✅ Y-axis: Contact counts or success rates
- ✅ Multiple lines if showing different metrics
- ✅ Data points for each day
- ✅ Smooth curves or step lines

#### Chart 4: Results Analysis
**Location**: Charts showing Supporters, Against, Neutral
**Expected Display**:
- ✅ Breakdown of result types
- ✅ Color coding for each result category
- ✅ Proportional representation

**Interactivity Tests**:
- ✅ Hover over chart elements shows details
- ✅ Click elements for filtering (if implemented)
- ✅ Print button generates printer-friendly version
- ✅ Charts resize responsively

**Success Criteria**: ✅ All categories display, colors distinct, data accurate

---

### Test 4: AI Search Functionality
**Objective**: Test natural language query processing

**Test Queries** (in order of complexity):

#### Query 1: Simple Team Question
**Input**: "How many people did Team Alpha contact?"
**Expected Response**: 
- Specific number based on Total Attempts for Team Alpha
- Should reference data from Jan 15-24
- Confidence score provided
- Follow-up suggestions

#### Query 2: Effectiveness Analysis
**Input**: "What's the most effective contact method?"
**Expected Response**:
- Analysis comparing success rates across 6 contact methods
- Should identify highest success rate method
- Data-driven reasoning
- Specific percentages or ratios

#### Query 3: Trend Analysis
**Input**: "Show me trends for supporter contacts"
**Expected Response**:
- Analysis of supporter results over time period
- Identify increasing/decreasing trends
- Reference specific teams or methods performing well
- Visual or data recommendations

#### Query 4: Comparative Analysis
**Input**: "Which team had the highest success rate?"
**Expected Response**:
- Compare all 4 teams (Alpha, Beta, Gamma, Delta)
- Calculate success rates (Successful Contacts / Total Attempts)
- Identify top performer
- Provide context and reasoning

#### Query 5: Pattern Recognition
**Input**: "What patterns do you see in the data?"
**Expected Response**:
- Identify trends, anomalies, or insights
- Cross-reference different dimensions (time, team, method)
- Actionable recommendations
- Multiple insights if possible

**AI Response Quality Checklist**:
- ✅ Uses actual data from uploaded CSV
- ✅ Provides specific numbers, not generic responses
- ✅ Shows confidence scores
- ✅ Offers follow-up questions
- ✅ Response time under 10 seconds
- ✅ Accurate calculations

**Success Criteria**: ✅ All queries return data-driven, accurate responses

---

### Test 5: Integration & Edge Cases
**Objective**: Test system integration and error handling

#### Data Filtering Test
**Steps**:
1. Use date filters to limit to specific date ranges
2. Filter by specific teams (Alpha, Beta, etc.)
3. Filter by contact methods
4. **Expected**: Charts update dynamically
5. **Expected**: AI queries respect filtered data

#### Performance Test
**Steps**:
1. Rapidly switch between different views
2. Apply multiple filters simultaneously  
3. Run multiple AI queries in succession
4. **Expected**: No crashes, reasonable response times
5. **Expected**: Memory usage remains stable

#### Error Handling Test
**Steps**:
1. Try uploading invalid CSV file
2. Enter nonsensical AI query
3. Navigate with no data loaded
4. **Expected**: Graceful error messages
5. **Expected**: No application crashes

**Success Criteria**: ✅ Smooth performance, proper error handling

---

## Expected Results Summary

### CSV Upload Results
- **31 records imported** from sample data
- **6 contact methods** properly categorized
- **4 teams** with distinct identities
- **10-day date range** (Jan 15-24, 2024)

### Chart Display Results
- **Dynamic color generation** for all categories
- **Accurate data representation** in pie charts
- **Time series visualization** of activity
- **Interactive elements** functioning

### AI Search Results
- **Data-driven responses** using uploaded information
- **Context awareness** of available data
- **Calculation accuracy** for rates and comparisons
- **Insight generation** beyond simple queries

### Integration Results
- **Real-time updates** when filters applied
- **Consistent data flow** between components
- **Performance stability** under normal usage
- **Error resilience** for edge cases

---

## Troubleshooting Common Issues

### Issue: CSV Upload Fails
**Check**:
- File size under limits
- All required columns present
- Data format matches expectations
- Network connectivity to Supabase

### Issue: Charts Don't Display Data
**Check**:
- Data successfully imported
- Browser console for JavaScript errors
- Chart component error boundaries
- Data transformation processes

### Issue: AI Queries Time Out
**Check**:
- OpenAI API key configured
- Network connectivity
- Supabase Edge Functions running
- Query complexity reasonable

### Issue: Authentication Problems
**Check**:
- Supabase configuration
- User account status
- Network/CORS issues
- Browser cookies/local storage

---

## Success Definition

The system passes integration testing when:

✅ **Build**: Clean compilation and deployment  
✅ **Upload**: Sample CSV processes with all categories  
✅ **Charts**: Dynamic display of all 6 contact methods and 4 teams  
✅ **AI**: Natural language queries return accurate, contextual responses  
✅ **Performance**: Responsive UI with no major delays or crashes  
✅ **Integration**: All components work together seamlessly  

**Result**: System ready for staging deployment and user acceptance testing.