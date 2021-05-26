import { TestModel } from 'mutation-testing-metrics';
import { MutantResult } from 'mutation-testing-report-schema/api';
import { StateFilter } from '../components/state-filter/state-filter.component';

export interface CustomEventMap {
  'mutant-selected': { selected: boolean; mutant: MutantResult | undefined };
  'test-selected': { selected: boolean; test: TestModel | undefined };
  'theme-changed': { theme: string; themeBackgroundColor: string };
  'theme-switch': 'dark' | 'light';
  'filters-changed': StateFilter<any>[];
  'collapse-all': void;
  'expand-all': void;
}

export function createCustomEvent<T extends keyof CustomEventMap>(eventName: T, detail: CustomEventMap[T], opts?: Omit<CustomEventInit, 'detail'>) {
  return new CustomEvent(eventName, { detail, ...opts });
}

export type MteCustomEvent<T extends keyof CustomEventMap> = CustomEvent<CustomEventMap[T]>;
