import queryString from 'query-string';

const getStringifiedQuery = (query: Record<string, unknown>): string => {
  return queryString.stringify(query);
};

export { getStringifiedQuery };
