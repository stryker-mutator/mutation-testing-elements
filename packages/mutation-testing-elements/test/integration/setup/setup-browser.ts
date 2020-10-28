import { init, getCurrent } from '../lib/browser';

export const mochaHooks = {
  async beforeAll() {
    await init();
  },
  async afterAll() {
    await getCurrent().close();
  },
  async afterEach() {
    await getCurrent().executeScript('window.localStorage.clear();');
  },
};
