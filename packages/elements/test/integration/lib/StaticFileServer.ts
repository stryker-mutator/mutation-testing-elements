import express from 'express';
import http from 'http';
export class StaticFileServer {
  private readonly app: express.Express;
  private server: http.Server | null = null;

  constructor(dirs: string[]) {
    this.app = express();
    for (const dir of dirs) {
      this.app.use(express.static(dir));
    }
  }

  public listen(port: number): Promise<void> {
    return new Promise((res, rej) => {
      this.app.once('error', rej);
      this.server = this.app.listen(port, res);
      this.server.unref();
    });
  }
}
