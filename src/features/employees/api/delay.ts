function createAbortError(signal: AbortSignal | undefined): unknown {
  return signal?.reason ?? new DOMException('The request was aborted', 'AbortError');
}


export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError(signal));
      return;
    }

    function onAbort() {
      clearTimeout(timer);
      reject(createAbortError(signal));
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
