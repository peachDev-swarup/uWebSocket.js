import { STATUS_CODES } from 'http';
import * as uWebSocket from 'uWebSocket.js';

export class HttpRequest {
     private req: uWebSocket.HttpRequest;
     private res: uWebSocket.HttpResponse;

     constructor(req: uWebSocket.HttpRequest, res: uWebSocket.HttpResponse) {
          this.req = req; this.res = res;
     };

     #url?: string;
     get url(): string {
          if (this.#url)
               return this.#url;
          const query = this.req.getQuery();
          return this.#url = this.path + (query == '' || typeof query == 'undefined') ? '' : `?${query}`;
     };

     #path?: string;
     get path(): string {
          if (this.#path)
               return this.#path;
          return this.#path = this.req.getUrl();
     };

     #method?: string;
     get method(): string {
          if (this.#method)
               return this.#method;
          return this.#method = this.req.getMethod()
               .replace('del', 'delete').toLocaleUpperCase();
     };

}; export class HttpResponse {
     private req: uWebSocket.HttpRequest;
     private res: uWebSocket.HttpResponse;

     constructor(req: uWebSocket.HttpRequest, res: uWebSocket.HttpResponse) {
          this.req = req; this.res = res;

          this.#aborted = false;
          res.onAborted(() => this.#aborted = true);
     };

     #completed?: boolean;
     get isCompleted(): boolean {
          return this.#completed || this.isAborted ? true : false;
     };

     #aborted: boolean;
     get isAborted(): boolean {
          return this.#aborted;
     };

     #statusCode?: number;
     status(code?: number): HttpResponse {
          this.#statusCode = code; return this;
     };

     send(msg?: response): HttpResponse {
          this.res.cork(() => {
               const { res } = this;
               if (!this.isCompleted || !this.isAborted) {
                    res
                         .writeStatus(`${this.#statusCode || 200} ${STATUS_CODES[this.#statusCode || 200]}`)
                         .write(typeof msg == 'object' ? JSON.stringify(msg) : (msg?.toString() || ''));
                    res.endWithoutBody();
               } else
                    throw new Error('Response is already written.');
               this.#completed = true;
          }); return this;
     };
};

export type response = string | number | boolean | object;