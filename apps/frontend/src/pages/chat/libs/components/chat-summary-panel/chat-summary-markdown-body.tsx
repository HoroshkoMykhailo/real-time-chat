import { Fragment, type ReactNode } from 'react';

import styles from './styles.module.scss';

const FIRST_CAPTURE_GROUP = 1;
const MAX_HEADING_HASHES = 6;
const SKIP_SINGLE_CHAR = 1;
const STEP = 1;
const ZERO_LENGTH = 0;

type SummaryBlock =
  | { items: string[]; type: 'list' }
  | { text: string; type: 'heading' }
  | { text: string; type: 'paragraph' };

const BULLET_PREFIX = /^\s*(?:[*•-]|\d+[.)])\s+/;

const parseMarkdownHeadingText = (trimmed: string): null | string => {
  if (!trimmed.startsWith('#')) {
    return null;
  }

  const { length } = trimmed;
  let hashCount = ZERO_LENGTH;

  while (hashCount < length && trimmed[hashCount] === '#') {
    hashCount += STEP;
  }

  if (
    hashCount === ZERO_LENGTH ||
    hashCount > MAX_HEADING_HASHES ||
    hashCount >= length
  ) {
    return null;
  }

  const delimiter = trimmed[hashCount];

  if (delimiter !== ' ' && delimiter !== '\t') {
    return null;
  }

  const rest = trimmed.slice(hashCount + SKIP_SINGLE_CHAR).trim();

  return rest.length > ZERO_LENGTH ? rest : null;
};

const parseSummaryMarkdownToBlocks = (raw: string): SummaryBlock[] => {
  const normalized = raw.replaceAll('\r\n', '\n').trim();

  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n');
  const blocks: SummaryBlock[] = [];
  let listBuffer: string[] = [];

  const flushList = (): void => {
    if (listBuffer.length > ZERO_LENGTH) {
      blocks.push({ items: [...listBuffer], type: 'list' });
      listBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList();

      continue;
    }

    const headingText = parseMarkdownHeadingText(trimmed);

    if (headingText !== null) {
      flushList();
      blocks.push({ text: headingText, type: 'heading' });

      continue;
    }

    const withoutBullet = trimmed.replace(BULLET_PREFIX, '');

    if (withoutBullet === trimmed) {
      flushList();
      blocks.push({ text: trimmed, type: 'paragraph' });
    } else {
      listBuffer.push(withoutBullet);
    }
  }

  flushList();

  return blocks;
};

const renderInlineBold = (text: string): ReactNode => {
  const chunks = text.split(/(\*\*[^*]+\*\*)/g);

  return chunks.map((chunk, index) => {
    const match = /^\*\*([^*]+)\*\*$/.exec(chunk);

    if (match) {
      return <strong key={index}>{match[FIRST_CAPTURE_GROUP]}</strong>;
    }

    return chunk.length > ZERO_LENGTH ? (
      <Fragment key={index}>{chunk}</Fragment>
    ) : null;
  });
};

type ChatSummaryMarkdownBodyProperties = {
  text: string;
};

const ChatSummaryMarkdownBody = ({
  text
}: ChatSummaryMarkdownBodyProperties): JSX.Element => {
  const blocks = parseSummaryMarkdownToBlocks(text);

  return (
    <div className={styles['summary-body']}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'heading') {
          return (
            <h4 className={styles['summary-subheading']} key={blockIndex}>
              {renderInlineBold(block.text)}
            </h4>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p className={styles['summary-paragraph']} key={blockIndex}>
              {renderInlineBold(block.text)}
            </p>
          );
        }

        return (
          <ul className={styles['summary-list']} key={blockIndex}>
            {block.items.map((item, itemIndex) => (
              <li className={styles['summary-list-item']} key={itemIndex}>
                {renderInlineBold(item)}
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
};

export { ChatSummaryMarkdownBody };
