import { MutationResultHealth } from './MutationResultHealth';
import { ResultTotals } from './ResultTotals';

export interface MutationTestResult {
  name: string;
  totals: ResultTotals;
  mutationScore: number;
  health: MutationResultHealth;
}
