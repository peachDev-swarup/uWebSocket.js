"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const uWebSocket_js_1 = require("uWebSocket.js");
const http_js_1 = require("./http.js");
;
;
;
var middleware;
(function (middleware) {
    function run(req, res, handler) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = handler === null || handler === void 0 ? void 0 : handler.constructor) === null || _a === void 0 ? void 0 : _a.name) == 'AsyncFunction')
                    yield handler(req, res, (err, done) => resolve(done ? true : (err ? err : false)));
                else
                    handler(req, res, (err, done) => resolve(done ? true : (err ? err : false)));
                resolve(res.isCompleted);
            }
            catch (err) {
                resolve(err);
                return;
            }
            ;
        }));
    }
    middleware.run = run;
    ;
    function runAll(req, res, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            let i = 0;
            let retValue = false;
            yield (function next() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (i < handlers.length) {
                        const result = yield run(req, res, handlers[i]);
                        if (result == true || result instanceof Error || res.isCompleted) {
                            retValue = res.isCompleted ? true : result;
                            return retValue;
                        }
                        else {
                            i++;
                            yield next();
                        }
                        ;
                    }
                    else
                        return;
                });
            })();
            return retValue;
        });
    }
    middleware.runAll = runAll;
    ;
})(middleware || (middleware = {}));
;
class Server {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = req.url;
            const method = req.method;
            const handlers = this.middlewareHandlers.filter(middleware => {
                return middleware.path.test(url) && (middleware.method == 'ANY' || middleware.method == method);
            }).map(e => e.handler);
            const result = yield middleware.runAll(req, res, handlers);
            if (result instanceof Error) {
                console.log(result);
                res.status(500).send(result.stack);
            }
            else if (result == false)
                res.status(404).send(`Cannot ${method} ${url}.`);
            return;
        });
    }
    ;
    constructor(options) {
        var _a;
        this.options = Object.assign({
            host: '0.0.0.0',
            port: process.pid
        }, (options || {}));
        this.app = (0, uWebSocket_js_1.App)(Object.assign({}, ((options === null || options === void 0 ? void 0 : options.https) ? {
            key_file_name: options.https.secret,
            passphrase: (_a = options.https) === null || _a === void 0 ? void 0 : _a.passphase,
            cert_file_name: options.https.certificate,
        } : {})));
        this.middlewareHandlers = [];
        this.app
            .get('/*', (res, req) => __awaiter(this, void 0, void 0, function* () { return this.handle(new http_js_1.HttpRequest(req, res), new http_js_1.HttpResponse(req, res)); }))
            .put('/*', (res, req) => __awaiter(this, void 0, void 0, function* () { return this.handle(new http_js_1.HttpRequest(req, res), new http_js_1.HttpResponse(req, res)); }))
            .del('/*', (res, req) => __awaiter(this, void 0, void 0, function* () { return this.handle(new http_js_1.HttpRequest(req, res), new http_js_1.HttpResponse(req, res)); }));
        this.app
            .post('/*', (res, req) => __awaiter(this, void 0, void 0, function* () { return this.handle(new http_js_1.HttpRequest(req, res), new http_js_1.HttpResponse(req, res)); }))
            .patch('/*', (res, req) => __awaiter(this, void 0, void 0, function* () { return this.handle(new http_js_1.HttpRequest(req, res), new http_js_1.HttpResponse(req, res)); }));
    }
    ;
    use(path, ...handlers) {
        if (typeof path == 'function') {
            handlers.unshift(path);
            path = '/';
        }
        ;
        handlers === null || handlers === void 0 ? void 0 : handlers.forEach(handler => {
            this.middlewareHandlers.push({ path: ExpFromRoute(path), method: 'ANY', handler: handler });
        });
        return this;
    }
    ;
    certify(hostname) {
    }
    ;
    listen(port, host, callback) {
        try {
            this.app.listen(host || this.options.host, port || this.options.port, (socket) => {
                if (!socket) {
                    throw new Error(`Failed to start uWebSocket.js server at http://${host || this.options.host}:${host || this.options.host}.`);
                }
                else {
                    try {
                        (callback || function () { })(this);
                    }
                    catch (_a) { }
                    ;
                }
                ;
            });
            return this;
        }
        catch (_a) {
            throw new Error('Failed to start uWebSocket.js server.');
        }
        ;
    }
    ;
}
exports.Server = Server;
;
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
function ExpFromRoute(path) {
    return new RegExp('');
}
;
