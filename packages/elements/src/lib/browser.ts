import { isServer } from 'lit';

/**
 * Test if localStorage exists and is enabled
 */
export function isLocalStorageAvailable() {
  if (isServer) return false;
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
}
