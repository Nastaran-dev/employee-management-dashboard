import type { MockEmployeeApiOptions, MockOperation } from './mockEmployeeApi';

const OPERATIONS: readonly MockOperation[] = ['list', 'create', 'update'];
const ONCE_SUFFIX = '-once';

type MockRuntimeConfig = Pick<MockEmployeeApiOptions, 'latencyMs' | 'failures'>;

/**
 * Reads development switches from the URL so error states can be reproduced
 * without code changes:
 *   ?simulate=list          every list request fails
 *   ?simulate=list-once     only the first list request fails (note: the query client
 *                           retries once on its own, so this one is masked in the UI)
 *   ?simulate=create,update comma-separated; each may end in "-once"
 *   ?latency=0              override the simulated latency in milliseconds
 */
export function parseMockConfig(search: string): MockRuntimeConfig {
  const params = new URLSearchParams(search);
  const config: MockRuntimeConfig = {};

  const latency = params.get('latency');
  if (latency !== null && latency.trim() !== '') {
    const value = Number(latency);
    if (Number.isFinite(value) && value >= 0) config.latencyMs = value;
  }

  const simulate = params.get('simulate');
  if (simulate) {
    const failures: Partial<Record<MockOperation, number>> = {};
    for (const token of simulate.split(',')) {
      const once = token.endsWith(ONCE_SUFFIX);
      const name = once ? token.slice(0, -ONCE_SUFFIX.length) : token;
      const operation = OPERATIONS.find((candidate) => candidate === name);
      if (operation) failures[operation] = once ? 1 : Infinity;
    }
    config.failures = failures;
  }

  return config;
}
