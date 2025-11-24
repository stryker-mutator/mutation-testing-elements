export function groupBy<K extends PropertyKey, T>(arr: T[], criteria: (element: T) => K): Partial<Record<K, T[]>> {
  return arr.reduce((acc: Partial<Record<K, T[]>>, item) => {
    const key = criteria(item);
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});
}
