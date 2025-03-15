
export interface QueryParams {
  tactic?: string;
  resultType?: string;
  person?: string;
  date?: string;
  team?: string;
  searchQuery?: string;
}

export const RESULT_TYPES = [
  "Attempts",
  "Contacts",
  "Supporters",
  "Not Home",
  "Refused",
  "Bad Data",
  "Undecided"
];
