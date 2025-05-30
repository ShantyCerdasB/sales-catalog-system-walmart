import type { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createServer, proxy } from 'azure-function-express';
import { app as expressApp } from '../../dist/index'; 

const server = createServer(expressApp);

const httpTrigger: AzureFunction = (ctx: Context, req: HttpRequest) =>
  proxy(server, ctx, req);

export default httpTrigger;
