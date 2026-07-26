// Mirrors backend enum `tz.co.gasco.rms.enums.ChecklistAnswers`.
// The backend draws no per-question distinction, so every question offers all 12.
export interface ChecklistAnswerOption {
  value: string;
  label: string;
}

export const CHECKLIST_ANSWER_OPTIONS: ChecklistAnswerOption[] = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
  { value: 'NOT_APPLICABLE', label: 'Not applicable' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'VERY_GOOD', label: 'Very good' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'BAD', label: 'Bad' },
  { value: 'VERY_BAD', label: 'Very bad' },
  { value: 'INSUFFICIENT', label: 'Insufficient' },
  { value: 'NOT_KNOWN', label: 'Not known' },
];

const LABELS: Record<string, string> = CHECKLIST_ANSWER_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {},
);

export const checklistAnswerLabel = (value?: string | null): string =>
  (value && LABELS[value]) || value || '';
