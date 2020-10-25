import { init, getCurrent } from '../lib/browser';

before(async () => {
  await init();
});

after(async () => {
  await getCurrent().close();
});

afterEach(async () => {
  await getCurrent().executeScript('window.localStorage.clear();');
});
