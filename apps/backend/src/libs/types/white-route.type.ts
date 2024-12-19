import { type HTTPMethod } from '~/libs/modules/http/http.js';

import { type ValueOf } from './types.js';

type WhiteRoute = {
  methods: ValueOf<typeof HTTPMethod>[];
  path: string;
};

export { type WhiteRoute };
