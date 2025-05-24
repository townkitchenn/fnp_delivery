export const ensureHttps = (url) => {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
};
