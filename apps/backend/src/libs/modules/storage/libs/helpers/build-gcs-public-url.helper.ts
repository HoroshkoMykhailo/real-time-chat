const buildGcsPublicUrl = (bucketName: string, objectName: string): string => {
  const path = objectName
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  return `https://storage.googleapis.com/${bucketName}/${path}`;
};

export { buildGcsPublicUrl };
