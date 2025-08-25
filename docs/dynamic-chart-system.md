# Dynamic Chart System Documentation

## Overview

The Dynamic Chart System automatically detects and displays all categories found in your data, eliminating the need for hardcoded chart configurations. It supports unlimited tactics, teams, and result types while maintaining consistent colors and styling.

## Key Features

- **Automatic Category Detection**: Discovers all unique categories in your data
- **Unlimited Data Support**: No more 3-tactic limit - displays ALL data categories
- **Dynamic Color Generation**: Creates distinct, consistent colors for any number of categories
- **Flexible Chart Types**: Supports pie, bar, line, and scatter charts with auto-detection
- **Responsive Design**: Adapts to any number of data points with appropriate styling
- **Backward Compatibility**: Works with existing data structures

## Components

### 1. Dynamic Chart Service (`/src/services/dynamicChartService.ts`)

Core service that analyzes data structures and generates chart configurations.

**Key Functions:**
- `analyzeDataStructure()` - Examines data to understand its structure
- `detectTacticsFromData()` - Finds all unique tactics in the dataset
- `detectTeamsFromData()` - Identifies all teams/groups
- `detectResultTypesFromData()` - Discovers all result categories
- `generateAdaptiveChartConfig()` - Creates optimal chart configuration

### 2. Chart Color Generator (`/src/utils/chartColorGenerator.ts`)

Generates consistent, distinct colors for unlimited categories.

**Key Functions:**
- `getCategoryColor()` - Returns consistent color for a category name
- `generateColorPalette()` - Creates color palette for multiple categories
- `generateChartColors()` - Adds colors to chart data

### 3. Dynamic Chart Adapter (`/src/components/voter-analytics/charts/DynamicChartAdapter.tsx`)

Universal chart component that adapts to any data structure.

## Usage Examples

### Basic Dynamic Chart
```tsx
import { DynamicChartAdapter } from './DynamicChartAdapter';

<DynamicChartAdapter
  data={voterData}
  title="All Tactics"
  primaryField="tactic"
  valueField="attempts"
  chartType="pie"
  categoryType="tactics"
/>
```

### Auto-Detection Chart
```tsx
<DynamicChartAdapter
  data={voterData}
  title="Data Overview"
  chartType="auto"  // Automatically selects best chart type
/>
```

### Grouped Data Chart
```tsx
<DynamicChartAdapter
  data={voterData}
  title="Team Performance"
  primaryField="team"
  valueField="contacts"
  groupBy="team"
  aggregationType="sum"
  chartType="bar"
  categoryType="teams"
/>
```

## Data Structure Support

The system automatically handles various data structures:

### Standard Voter Data
```javascript
{
  id: 1,
  date: '2024-01-15',
  tactic: 'SMS',
  attempts: 150,
  contacts: 45,
  support: 20,
  oppose: 10,
  undecided: 15,
  not_home: 30,
  refusal: 25,
  bad_data: 50,
  team: 'Team Alpha'
}
```

### Custom Tactics
The system detects any tactic names:
- SMS, Phone, Canvas (standard)
- Email, Digital Ads, Social Media
- Door Knocking, Literature Drop
- Any custom tactic name

### Dynamic Result Types
Automatically detects result categories:
- Contact results: Support, Oppose, Undecided, Persuaded, etc.
- Not reached: Not Home, Refusal, Bad Data, Busy, No Answer, etc.
- Custom categories based on your data

## Configuration Options

### Chart Types
- `pie` - Best for categorical data with moderate number of categories
- `bar` - Ideal for many categories or comparative data
- `line` - Perfect for time series data
- `scatter` - Good for correlation analysis
- `auto` - System selects optimal type based on data

### Category Types
- `tactics` - Uses green color palette
- `contacts` - Uses blue/red/purple palette  
- `notReached` - Uses orange/red palette
- `teams` - Uses diverse color palette
- `general` - Uses rainbow color palette

### Aggregation Types
- `sum` - Adds up values (default)
- `count` - Counts records
- `average` - Calculates mean

## Migration from Hardcoded Charts

### Before (Limited)
```tsx
// Only showed SMS, Phone, Canvas
const tacticsData = [
  { name: "SMS", value: metrics.tactics.sms, color: CHART_COLORS.TACTIC.SMS },
  { name: "Phone", value: metrics.tactics.phone, color: CHART_COLORS.TACTIC.PHONE },
  { name: "Canvas", value: metrics.tactics.canvas, color: CHART_COLORS.TACTIC.CANVAS }
];
```

### After (Unlimited)
```tsx
// Shows ALL tactics found in data
<DynamicChartAdapter
  data={rawData}
  title="All Tactics"
  primaryField="tactic"
  valueField="attempts"
  categoryType="tactics"
/>
```

## Updated Components

### 1. useFormattedChartData Hook
- Now detects tactics dynamically from raw data
- Supports unlimited categories
- Maintains backward compatibility

### 2. TacticsPieChart
- Handles any number of tactics
- Dynamic color assignment
- Improved styling for many categories

### 3. ContactsPieChart & TeamsPieChart
- Support unlimited categories
- Dynamic color generation
- Responsive legends

## Best Practices

1. **Data Structure**: Ensure consistent field names across records
2. **Performance**: For large datasets, consider using groupBy and aggregation
3. **Colors**: Let the system generate colors for consistency
4. **Chart Types**: Use 'auto' for unknown data structures
5. **Categories**: Use semantic category types for better color schemes

## Troubleshooting

### No Data Displayed
- Check that your data has non-zero values
- Verify field names match primaryField/valueField
- Ensure data is passed as an array

### Color Issues
- Colors are generated consistently by category name
- Use categoryType prop for themed color palettes
- Colors persist across sessions for same category names

### Performance Issues
- Use groupBy for large datasets
- Consider pagination for very large data sets
- Use aggregationType="count" for simple counting

## API Reference

### DynamicChartAdapter Props
```typescript
interface DynamicChartAdapterProps {
  data: any[];                    // Raw data array
  title?: string;                 // Chart title
  primaryField?: string;          // Field to group by
  valueField?: string;            // Field to sum/count
  chartType?: 'pie' | 'bar' | 'line' | 'scatter' | 'auto';
  categoryType?: 'tactics' | 'contacts' | 'notReached' | 'teams' | 'general';
  theme?: 'light' | 'dark';       // Color theme
  height?: number;                // Chart height in pixels
  groupBy?: string;               // Field to group data by
  aggregationType?: 'sum' | 'count' | 'average';
}
```

The Dynamic Chart System ensures your voter analytics dashboard can handle any data structure and display all available information, not just predefined categories.