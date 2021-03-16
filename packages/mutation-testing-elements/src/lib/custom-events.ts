import { MutantResult } from 'mutation-testing-report-schema';
import { MutantFilter } from '../components/mutation-test-report-file-legend/mutation-test-report-file-legend.component';

export interface CustomEventMap {
  'mutant-selected': { selected: boolean; mutant: MutantResult | undefined };
  'theme-changed': { theme: string; themeBackgroundColor: string };
  'theme-switch': 'dark' | 'light';
  'filters-changed': MutantFilter[];
  'collapse-all': void;
  'expand-all': void;
}

export function createCustomEvent<T extends keyof CustomEventMap>(eventName: T, detail: CustomEventMap[T], opts?: Omit<CustomEventInit, 'detail'>) {
  return new CustomEvent(eventName, { detail, ...opts });
}

export type MteCustomEvent<T extends keyof CustomEventMap> = CustomEvent<CustomEventMap[T]>;
