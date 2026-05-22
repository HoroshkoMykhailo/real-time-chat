import { ENV } from '~/libs/enums/enums.js';

const resolveServerMediaUrl = (pathOrUrl: string | undefined): string => {
  if (!pathOrUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${ENV.SERVER_URL}${pathOrUrl}`;
};

export { resolveServerMediaUrl };
