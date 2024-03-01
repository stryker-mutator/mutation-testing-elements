export function isHeadless(): boolean {
  return !!(process.env.HEADLESS ?? process.env.CI);
}
