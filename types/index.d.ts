import { HttpRequest, HttpResponse } from './http.js';
export interface HttpsOptions {
    secret: string;
    passphase?: string;
    certificate: string;
}
export interface ServerOptions {
    host: string;
    port: number;
    https?: HttpsOptions;
}
export interface RouterOptions {
}
declare namespace middleware {
    type next = (err?: Error, done?: boolean) => void;
    type handler = (req: HttpRequest, res: HttpResponse, next: next) => void | Promise<void>;
    function run(req: HttpRequest, res: HttpResponse, handler: handler): Promise<boolean | Error>;
    function runAll(req: HttpRequest, res: HttpResponse, handlers: handler[]): Promise<boolean | Error>;
}
export declare class Server {
    private app;
    private options;
    private middlewareHandlers;
    private handle;
    constructor(options?: ServerOptions);
    use(...handlers: middleware.handler[]): Server;
    use(path: string, ...handlers: middleware.handler[]): Server;
    listen(port?: number, host?: string, callback?: (app: Server) => void): Server;
}
export {};
