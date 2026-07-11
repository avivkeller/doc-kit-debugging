import { allGenerators } from '../generators/index.mjs';
import logger from '../logger/index.mjs';
import { setConfig } from '../utils/configuration/index.mjs';

/**
 * Processes a chunk of items using the specified generator's processChunk method.
 * This is the worker entry point for Piscina.
 *
 * @param {ParallelTaskOptions} opts - Task options from Piscina
 * @returns {Promise<unknown>} The processed result
 */
export default async ({
  generatorName,
  input,
  itemIndices,
  extra,
  configuration,
  logLevel,
}) => {
  if (logLevel !== undefined) {
    logger.setLogLevel(logLevel);
  }

  await setConfig(configuration);

  const generator = allGenerators[generatorName];

  return generator.processChunk(input, itemIndices, extra);
};
