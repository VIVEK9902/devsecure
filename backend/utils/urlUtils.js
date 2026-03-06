const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    const error = new Error('URL is required and must be a string.');
    error.code = 'INVALID_URL';
    throw error;
  }

  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsedUrl;
  try {
    parsedUrl = new URL(withProtocol);
  } catch (error) {
    const invalidError = new Error('Invalid URL format. Example: https://example.com');
    invalidError.code = 'INVALID_URL';
    throw invalidError;
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    const protocolError = new Error('Only HTTP and HTTPS URLs are allowed.');
    protocolError.code = 'INVALID_URL';
    throw protocolError;
  }

  return parsedUrl.toString();
};

const getHostname = (normalizedUrl) => {
  return new URL(normalizedUrl).hostname;
};

module.exports = {
  normalizeUrl,
  getHostname,
};
