
import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from 'lucide-react';

interface CSVFieldMappingProps {
  headers: string[];
  sampleData: string[][];
  onMappingComplete: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

// These are the required fields in our voter_contacts table
const requiredFields = [
  { key: 'tactic', label: 'Tactic', required: true },
  { key: 'date', label: 'Date', required: true },
  { key: 'attempts', label: 'Attempts', required: true },
  { key: 'contacts', label: 'Contacts', required: true },
  { key: 'not_home', label: 'Not Home', required: true },
  { key: 'bad_data', label: 'Bad Data', required: true },
  { key: 'refusal', label: 'Refusal', required: true },
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: true },
  { key: 'team', label: 'Team', required: true },
  { key: 'support', label: 'Support', required: false },
  { key: 'oppose', label: 'Oppose', required: false },
  { key: 'undecided', label: 'Undecided', required: false },
];

export function CSVFieldMapping({ headers, sampleData, onMappingComplete, onCancel }: CSVFieldMappingProps) {
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);

  // Initialize with best-guess mappings based on header names
  useEffect(() => {
    const initialMapping: Record<string, string> = {};
    
    headers.forEach(header => {
      // Try to find a matching required field by comparing header name to field label or key
      const normalizedHeader = header.toLowerCase().trim();
      
      requiredFields.forEach(field => {
        if (
          normalizedHeader === field.key.toLowerCase() || 
          normalizedHeader === field.label.toLowerCase() ||
          normalizedHeader.includes(field.key.toLowerCase())
        ) {
          initialMapping[field.key] = header;
        }
      });
    });
    
    setFieldMapping(initialMapping);
  }, [headers]);

  // Check for missing required fields
  useEffect(() => {
    const missing = requiredFields
      .filter(field => field.required && !fieldMapping[field.key])
      .map(field => field.label);
    
    setMissingRequiredFields(missing);
  }, [fieldMapping]);

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: headerValue
    }));
  };

  const handleComplete = () => {
    if (missingRequiredFields.length === 0) {
      onMappingComplete(fieldMapping);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Map Your CSV Fields</h2>
      
      <div className="rounded-md border p-3 bg-amber-50 border-amber-200 text-amber-800 mb-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Please map your CSV fields to our database fields</p>
            <p className="text-xs mt-1">Fields marked with * are required</p>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Database Field</TableHead>
              <TableHead className="w-2/3">CSV Field</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requiredFields.map((field) => (
              <TableRow key={field.key}>
                <TableCell className="font-medium">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </TableCell>
                <TableCell>
                  <Select
                    value={fieldMapping[field.key] || ''}
                    onValueChange={(value) => handleMappingChange(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not Mapped</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sampleData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Sample Data Preview:</h3>
          <div className="max-h-40 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header} className="text-xs whitespace-nowrap">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.slice(0, 3).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="text-xs p-2">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {missingRequiredFields.length > 0 && (
        <div className="rounded-md border p-3 bg-red-50 border-red-200 text-red-800">
          <p className="text-sm font-medium">Required fields not mapped:</p>
          <ul className="text-xs mt-1 list-disc list-inside">
            {missingRequiredFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={missingRequiredFields.length > 0}
        >
          Complete Mapping
        </Button>
      </div>
    </div>
  );
}
