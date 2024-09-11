import { fromEvent, of, merge, EMPTY } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isServer } from 'lit';

/**
 * Observable for location changes on the hash part of the url
 * As soon as you subscribe you'll get a first event for the current location
 * @example
 * window.location.url === 'http://localhost:8080#foo/bar/baz.js' => ['foo', 'bar', 'baz.js ']
 */
export const locationChange$ = isServer
  ? EMPTY
  : merge(of(1), fromEvent(window, 'hashchange').pipe(tap((event) => event.preventDefault()))).pipe(
      map(() => window.location.hash.substr(1).split('/').filter(Boolean).map(decodeURIComponent)),
    );

export enum View {
  mutant = 'mutant',
  test = 'test',
}
