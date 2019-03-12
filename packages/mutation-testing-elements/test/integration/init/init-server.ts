import { StaticFileServer } from '../lib/StaticFileServer';
import path from 'path';

const server = new StaticFileServer([path.resolve(__dirname, '..', '..', '..', 'testResources'), path.resolve(__dirname, '..', '..', '..', 'dist')]);
before(async () => {
  await server.listen(8080);
});
