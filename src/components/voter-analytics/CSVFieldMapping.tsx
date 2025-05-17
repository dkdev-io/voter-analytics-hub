
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FieldMappingTable } from './field-mapping/FieldMappingTable';
import { SampleDataPreview } from './field-mapping/SampleDataPreview';
import { MissingFieldsAlert } from './field-mapping/MissingFieldsAlert';
import { InstructionsAlert } from './field-mapping/InstructionsAlert';
import { requiredFields } from './field-mapping/constants';

interface CSVFieldMappingProps {
  headers: string[];
  sampleData: string[][];
  onMappingComplete: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

export function CSVFieldMapping({ headers, sampleData, onMappingComplete, onCancel }: CSVFieldMappingProps) {
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);

  // Enhanced initialization with better guessing for not_home and bad_data fields
  useEffect(() => {
    const initialMapping: Record<string, string> = {};
    
    headers.forEach(header => {
      // Try to find a matching required field by comparing header name to field label or key
      const normalizedHeader = header.toLowerCase().trim();
      
      requiredFields.forEach(field => {
        if (
          normalizedHeader === field.key.toLowerCase() || 
          normalizedHeader === field.label.toLowerCase() ||
          normalizedHeader.includes(field.key.toLowerCase()) ||
          // Improved special cases for common abbreviations and alternative names
          (field.key === 'not_home' && (
            normalizedHeader === 'nh' || 
            normalizedHeader.includes('not home') || 
            normalizedHeader.includes('nothome') ||
            normalizedHeader.includes('not_home') ||
            normalizedHeader.includes('no answer') ||
            normalizedHeader.includes('no-answer')
          )) ||
          (field.key === 'refusal' && (
            normalizedHeader === 'ref' || 
            normalizedHeader.includes('refused') || 
            normalizedHeader.includes('refus')
          )) ||
          (field.key === 'bad_data' && (
            normalizedHeader === 'bd' || 
            normalizedHeader.includes('bad data') ||
            normalizedHeader.includes('baddata') ||
            normalizedHeader.includes('bad_data') ||
            normalizedHeader.includes('invalid')
          ))
        ) {
          initialMapping[field.key] = header;
        }
      });
    });
    
    console.log("[CSVFieldMapping] Initial mapping:", initialMapping);
    setFieldMapping(initialMapping);
  }, [headers]);

  // Check for missing required fields
  useEffect(() => {
    const missing = requiredFields
      .filter(field => field.required && (!fieldMapping[field.key] || fieldMapping[field.key] === 'not-mapped'))
      .map(field => field.label);
    
    setMissingRequiredFields(missing);
  }, [fieldMapping]);

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: headerValue === 'not-mapped' ? '' : headerValue
    }));
  };

  const handleComplete = () => {
    if (missingRequiredFields.length === 0) {
      // Filter out any 'not-mapped' values before submitting
      const finalMapping = Object.entries(fieldMapping)
        .filter(([_, value]) => value && value !== 'not-mapped')
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string>);
      
      console.log("[CSVFieldMapping] Final field mapping:", finalMapping);
      onMappingComplete(finalMapping);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-semibold">Map Your CSV Fields</h2>
      
      <InstructionsAlert />

      <FieldMappingTable
        headers={headers}
        requiredFields={requiredFields}
        fieldMapping={fieldMapping}
        onMappingChange={handleMappingChange}
      />

      <SampleDataPreview headers={headers} sampleData={sampleData} />

      <MissingFieldsAlert missingFields={missingRequiredFields} />

      <div className="flex justify-end space-x-2 mt-4 sticky bottom-0 pt-2 bg-background">
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
