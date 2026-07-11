'use strict';

import { createSyntheticHead } from './synthetic.mjs';
import logger from '../../../../logger/index.mjs';

const syntheticLogger = logger.child('jsx-ast:synthetic');

/**
 * Builds the page descriptor for `all.html`
 *
 * @param {Array<import('../../../metadata/types').MetadataEntry>} entries
 */
export const buildAllPage = entries => {
  syntheticLogger.debug('Building "all" page descriptor', {
    entries: entries.length,
  });

  return {
    head: createSyntheticHead('all', 'All'),
    entries,
  };
};
