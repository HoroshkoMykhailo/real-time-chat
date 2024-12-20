import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const staticPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../public'
);

export { staticPath };
