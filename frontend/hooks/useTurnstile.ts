/**
 * Manages Cloudflare Turnstile token lifecycle.
 *
 * Returns a token once the challenge passes and a reset function that clears
 * the token and remounts the widget (via widgetKey) to trigger a fresh challenge.
 */

import { useState, useCallback } from "react";

interface UseTurnstileReturn {
  token: string | null;
  widgetKey: number;
  onVerified: (token: string) => void;
  reset: () => void;
}

export const useTurnstile = (): UseTurnstileReturn => {
  const [token, setToken] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState<number>(0);

  const onVerified = useCallback((newToken: string): void => {
    setToken(newToken);
  }, []);

  const reset = useCallback((): void => {
    setToken(null);
    setWidgetKey((prev) => prev + 1);
  }, []);

  return { token, widgetKey, onVerified, reset };
};
