import { EventSource } from 'eventsource';
import type { MutantResult } from 'mutation-testing-report-schema/api';
import { fromEvent, ReplaySubject, shareReplay, takeUntil } from 'rxjs';

export class MutantEventSource extends EventSource {
  constructor(port: number) {
    super(`http://localhost:${port}`);
  }

  #closedSubject = new ReplaySubject<void>();
  mutantResult$ = fromEvent(this, 'mutant-tested', (event: { data: string }) => JSON.parse(event.data) as Partial<MutantResult>).pipe(
    takeUntil(this.#closedSubject),
    shareReplay(),
  );

  override close() {
    super.close();
    this.#closedSubject.next();
    this.#closedSubject.complete();
  }
}
