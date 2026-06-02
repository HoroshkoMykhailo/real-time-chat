import { ENV } from '~/libs/enums/enums.js';

const ABSOLUTE_URL_PREFIX = /^[a-z][a-z\d+.-]*:\/\//i;
const BOM = /^\uFEFF/;
const PROTOCOL_PATTERN = /https?:\/\//gi;
const MIN_DOUBLE_PROTOCOL_COUNT = 2;
const LAST_MATCH_OFFSET = 1;
const PROTOCOL_MATCH_DEFAULT_INDEX = 0;

const resolveServerMediaUrl = (pathOrUrl: string | undefined): string => {
  if (!pathOrUrl) {
    return '';
  }

  const trimmed = pathOrUrl.trim().replace(BOM, '');

  if (!trimmed) {
    return '';
  }

  const protocolMatches = [...trimmed.matchAll(PROTOCOL_PATTERN)];

  if (protocolMatches.length >= MIN_DOUBLE_PROTOCOL_COUNT) {
    const lastIndex = protocolMatches.length - LAST_MATCH_OFFSET;
    const lastMatch = protocolMatches[lastIndex] as RegExpMatchArray;
    const start = lastMatch.index ?? PROTOCOL_MATCH_DEFAULT_INDEX;

    return trimmed.slice(start);
  }

  if (ABSOLUTE_URL_PREFIX.test(trimmed)) {
    return trimmed;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${ENV.SERVER_URL}${path}`;
};

export { resolveServerMediaUrl };
