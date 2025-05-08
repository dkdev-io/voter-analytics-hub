
export const requiredFields = [
  { key: 'tactic', label: 'Tactic', required: true },
  { key: 'date', label: 'Date', required: true },
  { key: 'attempts', label: 'Attempts', required: true },
  { key: 'contacts', label: 'Contacts', required: true },
  { key: 'not_home', label: 'Not Home', required: true, description: 'Number of voters who were not home when contacted' },
  { key: 'bad_data', label: 'Bad Data', required: true, description: 'Number of incorrect or invalid contacts' },
  { key: 'refusal', label: 'Refusal', required: true, description: 'Number of voters who refused to engage' },
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: true },
  { key: 'team', label: 'Team', required: true },
  { key: 'support', label: 'Support', required: false },
  { key: 'oppose', label: 'Oppose', required: false },
  { key: 'undecided', label: 'Undecided', required: false },
];
