/**
 * Public origin for API + Socket.IO + OAuth redirects.
 * When unset (e.g. single Cloud Run host), use the current page origin at runtime.
 */
const getPublicAppOrigin = (): string => {
  const fromEnvironment = import.meta.env['VITE_APP_PROXY_SERVER_URL'] as
    | string
    | undefined;

  if (fromEnvironment?.trim()) {
    return fromEnvironment.trim();
  }

  if (import.meta.env.SSR) {
    return '';
  }

  return globalThis.location.origin;
};

export { getPublicAppOrigin };
