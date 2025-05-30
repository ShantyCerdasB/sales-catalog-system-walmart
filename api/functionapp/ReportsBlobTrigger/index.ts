import type { AzureFunction, Context } from '@azure/functions';
import { logger } from '../../src/utils/logger';

const blobTrigger: AzureFunction = async (ctx: Context, input: Buffer): Promise<void> => {
  logger.info(`Report received – size ${input.length} bytes`);
};

export default blobTrigger;
