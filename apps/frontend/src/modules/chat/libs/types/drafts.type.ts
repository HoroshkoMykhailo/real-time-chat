import { type Draft } from './draft.type.js';

type Drafts = {
  [chatId: string]: Draft;
};

export { type Drafts };
