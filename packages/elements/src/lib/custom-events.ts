import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { StateFilter } from '../components/state-filter/state-filter.component';

export interface CustomEventMap {
  'mutant-selected': { selected: boolean; mutant: MutantModel | undefined };
  'test-selected': { selected: boolean; test: TestModel | undefined };
  'theme-changed': { theme: string; themeBackgroundColor: string };
  'theme-switch': 'dark' | 'light';
  'filters-changed': StateFilter<any>[];
  next: void;
  previous: void;
}

export function createCustomEvent<T extends keyof CustomEventMap>(eventName: T, detail: CustomEventMap[T], opts?: Omit<CustomEventInit, 'detail'>) {
  return new CustomEvent(eventName, { detail, ...opts });
}

export type MteCustomEvent<T extends keyof CustomEventMap> = CustomEvent<CustomEventMap[T]>;
