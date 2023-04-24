import { App, TemplatedApp } from 'uWebSocket.js';

import * as helper from './src/index.js';
import { middleware } from './src/route.js';
import { HttpRequest, HttpResponse } from './src/http.js';

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

export class Server {
     private app: TemplatedApp;
     private options: ServerOptions;

     private notFoundHandlers: middleware.handler[];
     private errorHandlers: middleware.errorHandler[];
     private middlewareHandlers: middleware.serverHandler[];

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
          this.errorHandlers = [];
          this.notFoundHandlers = [];

          this.#registeredHosts = [];
     };

     use(...handlers: middleware.handler[]): Server;
     use(path: string, ...handlers: middleware.handler[]): Server;
     use(path: string | middleware.handler, ...handlers: middleware.handler[]): Server {
          if (typeof path == 'function') {
               handlers.unshift(path); path = '/';
          }; handlers?.forEach(handler => {
               this.middlewareHandlers.push({ path: helper.ExpFromRoute(path as string), method: 'ANY', handler: handler });
          }); return this;
     };

     #registeredHosts: string[];
     certify(hostname: string) {
          return {
               with(certificate: string, secret: string): Server {
                    this.app.addServerName(hostname, {
                         key_file_name: secret,
                         cert_file_name: certificate
                    }); this.#registeredHosts.push(hostname); return this;
               }, done(): boolean {
                    return this.#registeredHosts.find(host => host == hostname) ? true : false;
               }
          };
     };

     listen(port?: number, host?: string, callback?: (app: Server) => void): Server {
          try {
               const compiler = middleware.createCompiler(this.middlewareHandlers, this.errorHandlers, this.notFoundHandlers);
               this.app
                    .any('/*', async (res, req) => compiler(new HttpRequest(req, res), new HttpResponse(req, res)))
                    .listen(host || this.options.host, port || this.options.port, (socket) => {
                         if (!socket) {
                              throw new Error(`Failed to start uWebSocket.js server at http://${host || this.options.host}:${host || this.options.host}.`);
                         } else { try { (callback || function () { })(this); } catch { }; };
                    }); return this;
          } catch { throw new Error('Failed to start uWebSocket.js server.'); };
     };
};