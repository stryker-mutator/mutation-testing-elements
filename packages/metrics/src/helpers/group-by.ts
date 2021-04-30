export function groupBy<T>(arr: T[], criteria: (element: T) => string): Record<string, T[]> {
  return arr.reduce((acc: Record<string, T[]>, item) => {
    const key = criteria(item);
    if (!Object.prototype.hasOwnProperty.call(acc, key)) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}
