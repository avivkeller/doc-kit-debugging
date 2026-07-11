'use strict';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { copyStaticAssets } from './utils/copying.mjs';
import { createCodeConverter, processBundles } from './utils/processing.mjs';
import logger from '../../logger/index.mjs';
import getConfig from '../../utils/configuration/index.mjs';
import { writeFile } from '../../utils/file.mjs';

const webLogger = logger.child('web');

/**
 * Main generation function that bundles per-page JSX code into web output.
 *
 * Receives `jsx-ast`'s output as `{ data, code }` items — the JSX AST was
 * already serialized to `code` in the jsx-ast worker, so no AST is held here.
 * Bundling and rendering then run once over the accumulated code, since shared
 * component chunks, CSS, and the sidebar need every entry together.
 *
 * @type {import('./types').Generator['generate']}
 */
export async function generate(input) {
  const config = getConfig('web');

  webLogger.debug('Generation started', {
    items: input.length,
    output: config.output ?? null,
  });

  const template = await readFile(config.templatePath, 'utf-8');

  webLogger.debug('Template loaded', {
    templatePath: config.templatePath,
    templateLength: template.length,
  });

  const converter = createCodeConverter();

  // Per-page metadata, in render order. Each item is already just
  // `{ data, code }` — the heavy JSX AST was converted to `code` and discarded
  // in the jsx-ast worker, so nothing large is held here.
  const datas = [];

  for (const item of input) {
    converter.add(item);
    datas.push(item.data);
  }

  // Sidebar lists only the real module pages.
  const sidebarEntries = datas
    .filter(data => data.synthetic !== true)
    .map(data => ({ data }));

  webLogger.debug('Accumulated page code', {
    pages: datas.length,
    sidebarEntries: sidebarEntries.length,
  });

  const { results, css, chunks } = await processBundles({
    serverCodeMap: converter.serverCodeMap,
    clientCodeMap: converter.clientCodeMap,
    datas,
    sidebarEntries,
    template,
  });

  webLogger.debug('Bundles processed', {
    results: results.length,
    chunks: chunks.length,
    cssLength: css.length,
  });

  if (config.output) {
    webLogger.debug('Writing output files', { output: config.output });

    for (const { html, path } of results) {
      webLogger.debug(`Writing page "${path}.html"`, {
        htmlLength: html.length,
      });

      await writeFile(join(config.output, `${path}.html`), html, 'utf-8');
    }

    for (const chunk of chunks) {
      webLogger.debug(`Writing chunk "${chunk.fileName}"`, {
        codeLength: chunk.code.length,
      });

      await writeFile(join(config.output, chunk.fileName), chunk.code, 'utf-8');
    }

    await writeFile(join(config.output, 'styles.css'), css, 'utf-8');

    await copyStaticAssets(config);
  }

  webLogger.debug('Generation completed', { pages: results.length });

  return results.map(({ html }) => ({ html: html.toString(), css }));
}
