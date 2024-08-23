import type { MutantModel, TestModel } from 'mutation-testing-metrics';
import type { Theme } from './theme.js';

export interface CustomEventMap {
  'mutant-selected': { selected: boolean; mutant: MutantModel | undefined };
  'test-selected': { selected: boolean; test: TestModel | undefined };
  'theme-changed': { theme: Theme; themeBackgroundColor: string };
  'theme-switch': Theme;
  'filters-changed': string[];
  next: void;
  previous: void;
}

export function createCustomEvent<T extends keyof CustomEventMap>(eventName: T, detail: CustomEventMap[T], opts?: Omit<CustomEventInit, 'detail'>) {
  return new CustomEvent(eventName, { detail, ...opts });
}

export type MteCustomEvent<T extends keyof CustomEventMap> = CustomEvent<CustomEventMap[T]>;
