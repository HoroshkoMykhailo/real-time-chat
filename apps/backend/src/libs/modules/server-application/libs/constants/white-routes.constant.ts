import { APIPath, AuthApiPath, HTTPMethod } from '@team-link/shared';

import { type WhiteRoute } from '~/libs/types/types.js';

const WHITE_ROUTES: WhiteRoute[] = [
  { methods: [HTTPMethod.POST], path: `${APIPath.AUTH}${AuthApiPath.SIGN_UP}` },
  { methods: [HTTPMethod.POST], path: `${APIPath.AUTH}${AuthApiPath.SIGN_IN}` }
];

export { WHITE_ROUTES };
