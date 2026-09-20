export type Debouncer<TArgs extends unknown[]> = {
  schedule: (...args: TArgs) => void;
  cancel: () => void;
};

/**
 * Trailing debouncer: resets the timer on each schedule.
 */
export function createDebouncer<TArgs extends unknown[]>(
  waitMs: number,
  callback: (...args: TArgs) => void,
): Debouncer<TArgs> {
  const delay = waitMs < 0 ? 0 : waitMs;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const schedule = (...args: TArgs): void => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      callback(...args);
    }, delay);
  };

  return { schedule, cancel };
}
