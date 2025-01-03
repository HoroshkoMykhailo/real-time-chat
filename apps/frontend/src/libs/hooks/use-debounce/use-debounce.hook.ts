import { useEffect, useRef as useReference, useState } from '../hooks.js';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutReference = useReference<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }

    timeoutReference.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return (): void => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

export { useDebounce };
