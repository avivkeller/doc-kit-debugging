'use strict';

import { createSyntheticHead, wrapAsEntry } from './synthetic.mjs';
import logger from '../../../../logger/index.mjs';

const syntheticLogger = logger.child('jsx-ast:synthetic');

/**
 * Builds the page descriptor for `404.html`
 */
export const buildNotFoundPage = () => {
  syntheticLogger.debug('Building "404" page descriptor');

  const head = createSyntheticHead('404', 'Page Not Found');

  return {
    head,
    entries: [
      wrapAsEntry(head, [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value:
                'The page you requested could not be found. Use the navigation to find the documentation you are looking for, or return to the ',
            },
            {
              type: 'link',
              url: 'index.html',
              children: [{ type: 'text', value: 'API index' }],
            },
            {
              type: 'text',
              value: '.',
            },
          ],
        },
      ]),
    ],
  };
};
