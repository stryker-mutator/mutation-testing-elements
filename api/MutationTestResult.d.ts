import { MutationResultHealth } from './MutationResultHealth';
import { ResultTotals } from './ResultTotals';

export declare interface MutationTestResult {
  name: string;
  totals: ResultTotals;
  mutationScore: number;
  health: MutationResultHealth;
}
