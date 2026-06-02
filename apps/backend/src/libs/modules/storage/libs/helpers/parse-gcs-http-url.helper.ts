const GCS_PUBLIC_URL_PATTERN =
  /^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/;

const tryParseGcsHttpUrl = (
  fileUrl: string
): null | { bucket: string; objectName: string } => {
  const match = GCS_PUBLIC_URL_PATTERN.exec(fileUrl);

  if (!match) {
    return null;
  }

  const [, bucket, encodedPath] = match;

  if (!bucket || !encodedPath) {
    return null;
  }

  const objectName = encodedPath
    .split('/')
    .map(segment => decodeURIComponent(segment.replaceAll('+', ' ')))
    .join('/');

  return { bucket, objectName };
};

export { tryParseGcsHttpUrl };
