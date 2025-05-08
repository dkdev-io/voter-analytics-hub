
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  return (
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
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={fieldMapping[field.key] || ''}
                  onValueChange={(value) => onMappingChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Important fix: Use "not-mapped" instead of empty string */}
                    <SelectItem value="not-mapped">Not Mapped</SelectItem>
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
  );
}
