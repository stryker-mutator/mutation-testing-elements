declare namespace Chai {
  export interface Assertion {
    matchScreenshot(): Promise<void>;
  }
}
