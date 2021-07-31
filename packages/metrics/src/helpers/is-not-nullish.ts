export function isNotNullish<T>(val: T | undefined | null): val is T {
  return val !== null && val !== undefined;
}
