import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * Observable for location changes on the hash part of the url
 * @example
 * window.location.url === 'http://localhost:8080#foo/bar/baz.js' => ['foo', 'bar', 'baz.js ']
 */
export const locationChange$ = fromEvent<HashChangeEvent>(window, 'hashchange').pipe(
  tap(event => event.preventDefault()),
  map(_ => window.location.hash.substr(1).split('/'))
);
