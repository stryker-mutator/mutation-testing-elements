type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

export type Explicit<T> = {
  [K in KnownKeys<T>]: undefined extends T[K] ? T[K] | undefined : T[K];
};
