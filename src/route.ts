import { HttpRequest, HttpResponse, response } from './http.js';

export namespace middleware {
     export type next = (err?: Error, done?: boolean) => void;
     export type handler = (req: HttpRequest, res: HttpResponse, next: next) => Promise<response | void> | response | void;
     export type errorHandler = (err: Error, req: HttpRequest, res: HttpResponse, next: next) => Promise<response | void> | response | void;

     export type serverHandler = { path: RegExp, method: string, handler: handler };
     export type compiledHandler = (req: HttpRequest, res: HttpResponse) => Promise<boolean>;

     export function compileHandler(handler: handler): compiledHandler {
          return (req: HttpRequest, res: HttpResponse) => new Promise(async (resolve, reject) => {
               try {
                    let resultHandler = handler(req, res, (err, done) => {
                         if (err)
                              reject(new Error(err?.toString()));
                         else if (done)
                              resolve(true);
                         else
                              resolve(false);
                    }); if (handler?.constructor?.name == 'AsyncFunction') resultHandler = await resultHandler;

                    if (typeof resultHandler == 'string' || typeof resultHandler == 'object')
                         res.send(resultHandler);
                    else if (typeof resultHandler == 'number')
                         res.status(resultHandler);
                    else if (typeof resultHandler == 'boolean')
                         res.send(resultHandler.toString());

                    if (res.isCompleted)
                         resolve(true);
                    resolve(false);
               } catch (err) { reject(new Error(err?.toString())); };
          });
     }; export function createCompiler(handlers: serverHandler[], errorHandler: errorHandler[], notFoundHandler: handler[]) {
          const resultHandler: { [route: string]: (req: HttpRequest, res: HttpResponse) => Promise<void> } = {};

          const retValue = {
               runErrorHandler: async function (err: Error, req: HttpRequest, res: HttpResponse): Promise<void> {
                    console.log(err);
                    res.send('error occored');
               }, runNotFoundHandler: async function (req: HttpRequest, res: HttpResponse): Promise<void> {
                    res.send('not found');
               }
          }; return async function (req: HttpRequest, res: HttpResponse): Promise<void> {
               const route = `${req.method} ${req.path}`;

               if (!(route in resultHandler)) {
                    const filteredHandlers = handlers.filter(handler => {
                         return handler.path.test(req.path) || (
                              handler.method == 'ANY' || handler.method == req.method
                         );
                    }).map(e => compileHandler(e.handler)); resultHandler[route] = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
                         try {
                              let i: number = 0; await (async function next() {
                                   if (i < filteredHandlers.length) {
                                        await filteredHandlers[i](req, res) ? '' : next();
                                   } else await retValue.runNotFoundHandler(req, res); i++
                              })();
                         } catch (err) { await retValue.runErrorHandler(new Error(err?.toString()), req, res); };
                    };
               }; await resultHandler[route](req, res);
          };
     };
};