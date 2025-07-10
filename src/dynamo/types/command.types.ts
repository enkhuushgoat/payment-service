export type CustomQueryCommandOutput<T> = {
  lastEvaluatedKey: Record<string, unknown> | undefined;
  items: T[];
};
