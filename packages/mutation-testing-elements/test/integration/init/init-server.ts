import { StaticFileServer } from '../lib/StaticFileServer';
import path from 'path';
import net from 'net';
const server = new StaticFileServer([path.resolve(__dirname, '..', '..', '..', 'testResources'), path.resolve(__dirname, '..', '..', '..', 'dist')]);
before(async () => {
  const port = 8080;
  if (!(await isInUse(port))) {
    await server.listen(port);
  }
});

function isInUse(port: number) {
  return new Promise<Boolean>(res => {
    const socket = net.connect(port);
    socket.on('connect', () => res(true));
    socket.on('error', () => res(false));
    socket.unref();
  });
}
