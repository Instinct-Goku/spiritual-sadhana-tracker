import type { BatchCriteria } from "./scoringService";

// Synchronous cache of per-user resolved batch criteria. Populated by
// primeUserBatchCriteriaCache() (async, hits Firestore) and read by the
// sync scoring code paths so that group-scoped batchCriteriaByTemplate
// overrides take precedence over DEFAULT_BATCHES.
const cache = new Map<string, BatchCriteria>();

const keyOf = (userId: string, templateKey: string) =>
  `${userId}|${templateKey.toLowerCase()}`;

export const setCachedBatchCriteria = (
  userId: string,
  templateKey: string,
  criteria: BatchCriteria
): void => {
  cache.set(keyOf(userId, templateKey), criteria);
};

export const getCachedBatchCriteria = (
  userId: string | undefined,
  templateKey: string | undefined
): BatchCriteria | undefined => {
  if (!userId || !templateKey) return undefined;
  return cache.get(keyOf(userId, templateKey));
};

export const clearBatchCriteriaCache = (): void => {
  cache.clear();
};