[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fmutation-testing-elements%2Fmaster%3Fmodule%3Dreal-time)](https://badge-api.stryker-mutator.io/github.com/stryker-mutator/mutation-testing-elements/master?module=real-time)
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing Real time

A NodeJS helper package to help with the server side of real-time reporting.

## Usage example

```ts
import { createServer } from 'http';
import { RealTimeReporter } from 'mutation-testing-real-time';

const reporter = new RealTimeReporter({ accessControlAllowOrigin: '*' });
const server = new createServer((req, res) => {
  if(req.url === '/sse') {
    reporter.add(res);
  }
});

// Whenever a mutant result comes in: 
reporter.sendMutantTested({ id: '1', status: 'Killed' });
// ...

// Whenever we are done:
reporter.sendFinished();
```

## API Reference

### `RealTimeReporter`

#### `RealTimeReporter.prototype.sendMutantTested` [`(Partial<MutationTestResult>) => void`]

#### `RealTimeReporter.prototype.sendFinished` [`() => void`]

#### `Event: 'client-connected'`

- `client: MutationEventSender`

Emitted each time a client connects to this real time reporter.

#### `Event: 'client-disconnected'`

- `client: MutationEventSender`

Emitted each time a client disconnects from this real time reporter.
