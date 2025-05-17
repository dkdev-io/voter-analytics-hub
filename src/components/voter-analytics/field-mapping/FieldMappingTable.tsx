
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";

interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  description?: string;
}

interface FieldMappingTableProps {
  headers: string[];
  requiredFields: FieldDefinition[];
  fieldMapping: Record<string, string>;
  onMappingChange: (fieldKey: string, headerValue: string) => void;
}

export function FieldMappingTable({
  headers,
  requiredFields,
  fieldMapping,
  onMappingChange,
}: FieldMappingTableProps) {
  // Add state to track if SelectContent is open to debug rendering issues
  const [openSelectKey, setOpenSelectKey] = useState<string | null>(null);

  // Debug the headers to ensure they're being passed correctly
  useEffect(() => {
    console.log("FieldMappingTable received headers:", headers);
    console.log("Current field mapping:", fieldMapping);
  }, [headers, fieldMapping]);

  return (
    <div className="max-h-[300px] overflow-y-auto border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
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
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={fieldMapping[field.key] || ''}
                  onValueChange={(value) => {
                    console.log(`Selecting ${value} for field ${field.key}`);
                    onMappingChange(field.key, value);
                  }}
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenSelectKey(field.key);
                      console.log(`Opening select for ${field.key}, headers:`, headers);
                    } else {
                      setOpenSelectKey(null);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-[200px] overflow-y-auto"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={5}
                    avoidCollisions={false}
                  >
                    <SelectItem value="not-mapped">Not Mapped</SelectItem>
                    {headers && headers.length > 0 ? (
                      headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-headers" disabled>
                        No headers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
