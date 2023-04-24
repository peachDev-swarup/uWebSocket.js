import { App, TemplatedApp } from 'uWebSocket.js';
import { HttpRequest, HttpResponse } from './http.js';

export interface HttpsOptions {
     secret: string;
     passphase?: string;
     certificate: string;
}; export interface ServerOptions {
     host: string;
     port: number;
     https?: HttpsOptions;
}; export interface RouterOptions {

};

namespace middleware {
     export type next = (err?: Error, done?: boolean) => void;
     export type handler = (req: HttpRequest, res: HttpResponse, next: next) => void | Promise<void>;

     export function run(req: HttpRequest, res: HttpResponse, handler: handler): Promise<boolean | Error> {
          return new Promise(async (resolve) => {
               try {
                    if (handler?.constructor?.name == 'AsyncFunction')
                         await handler(req, res, (err, done) => resolve(done ? true : (err ? err : false)));
                    else
                         handler(req, res, (err, done) => resolve(done ? true : (err ? err : false)));
                    resolve(res.isCompleted);
               } catch (err) { resolve(err as Error); return; };
          });
     }; export async function runAll(req: HttpRequest, res: HttpResponse, handlers: handler[]): Promise<boolean | Error> {
          let i: number = 0; let retValue: boolean | Error = false;
          await (async function next() {
               if (i < handlers.length) {
                    const result = await run(req, res, handlers[i]);
                    if (result == true || result instanceof Error || res.isCompleted) {
                         retValue = res.isCompleted ? true : result; return retValue;
                    } else { i++; await next(); };
               } else return;
          })(); return retValue;
     };
};

export class Server {
     private app: TemplatedApp;
     private options: ServerOptions;
     private middlewareHandlers: { path: RegExp, method: string, handler: middleware.handler }[];

     private async handle(req: HttpRequest, res: HttpResponse): Promise<void> {
          const url = req.url;
          const method = req.method;
          const handlers = this.middlewareHandlers.filter(middleware => {
               return middleware.path.test(url) && (
                    middleware.method == 'ANY' || middleware.method == method
               );
          }).map(e => e.handler); const result = await middleware.runAll(req, res, handlers);
          if (result instanceof Error) {
               console.log(result);
               res.status(500).send(result.stack);
          } else if (result == false)
               res.status(404).send(`Cannot ${method} ${url}.`);
          return;
     };

     constructor(options?: ServerOptions) {
          this.options = {
               ...{
                    host: '0.0.0.0',
                    port: process.pid
               }, ...(options || {})
          }; this.app = App({
               ...(options?.https ? {
                    key_file_name: options.https.secret,
                    passphrase: options.https?.passphase,
                    cert_file_name: options.https.certificate,
               } : {})
          }); this.middlewareHandlers = [];

          this.app
               .get('/*', async (res, req) => this.handle(new HttpRequest(req, res), new HttpResponse(req, res)))
               .put('/*', async (res, req) => this.handle(new HttpRequest(req, res), new HttpResponse(req, res)))
               .del('/*', async (res, req) => this.handle(new HttpRequest(req, res), new HttpResponse(req, res)));
          this.app
               .post('/*', async (res, req) => this.handle(new HttpRequest(req, res), new HttpResponse(req, res)))
               .patch('/*', async (res, req) => this.handle(new HttpRequest(req, res), new HttpResponse(req, res)));
     };

     use(...handlers: middleware.handler[]): Server;
     use(path: string, ...handlers: middleware.handler[]): Server;
     use(path: string | middleware.handler, ...handlers: middleware.handler[]): Server {
          if (typeof path == 'function') {
               handlers.unshift(path); path = '/';
          }; handlers?.forEach(handler => {
               this.middlewareHandlers.push({ path: ExpFromRoute(path as string), method: 'ANY', handler: handler });
          }); return this;
     };

     certify(hostname: string): HostManager {

     };

     listen(port?: number, host?: string, callback?: (app: Server) => void): Server {
          try {
               this.app.listen(host || this.options.host, port || this.options.port, (socket) => {
                    if (!socket) {
                         throw new Error(`Failed to start uWebSocket.js server at http://${host || this.options.host}:${host || this.options.host}.`);
                    } else { try { (callback || function () { })(this); } catch { }; };
               }); return this;
          } catch { throw new Error('Failed to start uWebSocket.js server.'); };
     };
};
/*
export namespace express {
     var options: ExpressOptions = {
          host: '0.0.0.0',
          port: process.pid
     }; const app = uWebSocket.App();
     const middlewareHandlers: { path: RegExp, method: string, handler: middleware.handler }[] = [];

     async function handle(req: HttpRequest, res: HttpResponse) {
          const url = req.url;
          const method = req.method;
          const handlers = middlewareHandlers.filter(middleware => {
               return middleware.path.test(url) && (
                    middleware.method == 'ANY' || middleware.method == method
               );
          }).map(e => e.handler); const result = await middleware.runAll(req, res, handlers);

          if (result instanceof Error) {
               console.log(result);
               res.status(500).send(result);
          } else if (result == false)
               res.status(404).send(`Cannot ${method} ${url}.`);
          return;
     };

     export class Router {
          constructor(path: string, options?: RouterOptions) {

          };
     };

     export function use(path: string, ...fn: middleware.handler[]): express {
          let i = 0; while (i < fn.length) {
               middlewareHandlers.push({ path: ExpFromRoute(path), method: 'ANY', handler: fn[i] });
          }; return express;
     };

     const registeredHosts: string[] = [];
     export function certify(host: string) {
          return {
               with(certificate: string, secret: string): express {
                    app.addServerName(host, {
                         key_file_name: secret,
                         cert_file_name: certificate
                    }); registeredHosts.push(host); return express;
               }, done(): boolean {
                    return registeredHosts.find(host => host == host) ? true : false;
               }
          };
     };

     app
          .get('/*', async (res, req) => handle(new HttpRequest(req, res), new HttpResponse(req, res)))
          .put('/*', async (res, req) => handle(new HttpRequest(req, res), new HttpResponse(req, res)))
          .del('/*', async (res, req) => handle(new HttpRequest(req, res), new HttpResponse(req, res)));
     app
          .post('/*', async (res, req) => handle(new HttpRequest(req, res), new HttpResponse(req, res)))
          .patch('/*', async (res, req) => handle(new HttpRequest(req, res), new HttpResponse(req, res)));
     export function listen(port?: number, host?: string, callback?: (app: express) => void): express {

     };
}; export type express = typeof express;
*/
function ExpFromRoute(path: string): RegExp {
     return new RegExp('');
};