
interface MissingFieldsAlertProps {
  missingFields: string[];
}

export function MissingFieldsAlert({ missingFields }: MissingFieldsAlertProps) {
  if (missingFields.length === 0) return null;

  return (
    <div className="rounded-md border p-3 bg-red-50 border-red-200 text-red-800">
      <p className="text-sm font-medium">Required fields not mapped:</p>
      <ul className="text-xs mt-1 list-disc list-inside">
        {missingFields.map((field) => (
          <li key={field}>{field}</li>
        ))}
      </ul>
    </div>
  );
}
