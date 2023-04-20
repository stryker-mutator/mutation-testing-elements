import http, { Server } from 'http';

export class SseTestServer {
  private server: Server | undefined;
  private response: http.ServerResponse | undefined;

  public start() {
    this.server = http.createServer((req, res) => {
      if (req.url === '/') {
        this.response = res;
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });
      }
    });
    this.server.listen();
  }

  public send(event: { name: string; data: object }) {
    if (this.response === undefined) {
      return;
    }

    this.response.write(`event: ${event.name}\n`);
    this.response.write(`data: ${JSON.stringify(event.data)}\n\n`);
  }

  public get port() {
    if (this.server === undefined) {
      return null;
    }

    const address = this.server.address();
    if (address === null) {
      return null;
    }

    if (typeof address === 'string') {
      return null;
    }

    return address.port;
  }
}
