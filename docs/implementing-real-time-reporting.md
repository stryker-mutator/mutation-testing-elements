---
title: Implementing real-time reporting
custom_edit_url: https://github.com/stryker-mutator/mutation-testing-elements/edit/master/docs/implementing-real-time-reporting.md
---

Real-time reporting was recently implemented in Stryker. This page is created to help other mutation testing frameworks to make use the same functionality.

## How does it work?

Currently, Stryker provides the report with updates using [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). This was chosen over WebSockets because the dataflow should only be from a mutation framework to the report. The report should not have to send anything to the mutation framework.

## Implementation details

### Preparing the report

First things first, the mutation testing framework should generate a report with an initial state of the mutants. If the mutants don't yet have a state because they have not been tested you can use the state `Pending`.

There are two ways of serving the generated report:

1. Write the file to disk.
2. Serve the report using a webserver.

For both of these options we recommend opening the report automatically for a better user experience.

### Changes to the `<mutation-test-report-app>` component

To inform the report that it is going to be provided with real-time updates, set the new `sse` property with the SSE endpoint URI.

```html
<mutation-test-report-app sse="http://localhost:8080/sse"></mutation-test-report-app>
```

### Server side implementation

At the server side, several HTTP headers are necessary to let the browser know that it should keep the connection open:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

The `Access-Control-Allow-Origin: *` is necessary only if the report is opened from a file from disk. It is possible to be more strict with CORS if the report is served with a webserver.

When sending events to the browser, please note that the payload should look like the following:

```
event: eventName\n
data: "..."\n\n
```

For more information, refer to the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format).

### Events

The report currently listens to two events:

- `mutant-tested`.
- `finished`.

#### The `mutant-tested` event

This event should be sent when a single mutant has been tested. The mutant should conform to the [report schema](https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/report-schema/src/mutation-testing-report-schema.json).

Required properties:

- `id`.
- `status`.

Optional properties:

- `coveredBy`.
- `description`.
- `duration`.
- `killedBy`.
- `location`.
- `mutatorName`.
- `replacement`.
- `static`.
- `statusReason`.
- `testsCompleted`.

For this event the `data` field in the event should be stringified JSON:

```http
event: mutant-tested
data: "{\"id\":\"0\",\"status\":\"Killed\",\"coveredBy\":[\"test_1\"]}"
```

#### The `finished` event

To notify that the report should stop listening for events, send this event:

```http
event: finished
data: null
```

## Limitations

It is up to the implementer to keep the state. If the user refreshes the page, the report will have lost the state that was built up until that point.

To prevent lost data, the implementer has to keep track of all mutant events that have happened until that point. If a browser reconnects it is possible to send all those events to the browser using the `mutant-tested` event.
