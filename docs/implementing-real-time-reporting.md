---
title: Implementing real-time reporting
custom_edit_url: https://github.com/stryker-mutator/mutation-testing-elements/edit/master/docs/implementing-real-time-reporting.md
---

Real-time reporting was recently implemented in Stryker. This page is created to help other mutation testing frameworks to make use the same functionality.

## How does it work?

Currently, Stryker provides the report with updates using [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). This was chosen over WebSockets because the dataflow should only be from a mutation framework to the report. The report should not have to send anything to the mutation framework.

## Implementation details

### Preparing the report

First things first, the mutation testing framework should be able to generate an empty report. This report has all information necessary except the tested state of a mutant. These mutants must have the state `Pending`.

Once this report has been generated, it is recommended to automatically open this report for a better user experience.

### Changes to the `<mutation-test-report-app>` component

To inform the report that it is going to be provided with updates, set the new `sse` property with a URL to where the SSE endpoint is located.

```html
<mutation-test-report-app sse="localhost:8080/sse"></mutation-test-report-app>
```

### Server side implementation

At the server side, several HTTP headers are necessary to let the browser know that it should keep the connection open:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

The `Access-Control-Allow-Origin: *` is needed, since the report is a file on disk.

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

This event should be sent when a single mutant has been tested. The mutant should conform to the report schema. Every single property sent will be changed in the report.

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

## Caveat

Please note that if a user refreshes the page while realtime reporting is ongoing, all the state will be lost. We have no plans on doing anything to combat this. Instead, it is possible to do the following:

1. Keep track of every mutant event that has been tested. When a client connects (browser), send said events.
2. When mutation testing is complete, write the full report to disk again. This way the report will still be filled when the user refreshes the page.
