
import { useState, useEffect } from "react";
import { type QueryParams } from "@/types/analytics";

interface UseDatasetNameProps {
  query: Partial<QueryParams>;
}

export const useDatasetName = ({ query }: UseDatasetNameProps) => {
  const [datasetName, setDatasetName] = useState<string>("");
  
  useEffect(() => {
    const datasetNameValue = query.team
      ? `${query.team} Team Dataset`
      : query.person
      ? `${query.person}'s Dataset`
      : "Voter Contacts Dataset";
      
    setDatasetName(datasetNameValue);
  }, [query.team, query.person]);

  return { datasetName };
};
