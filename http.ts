import { STATUS_CODES } from 'http';
import * as uWebSocket from 'uWebSocket.js';

export class HttpRequest {
     private request: uWebSocket.HttpRequest;
     private response: uWebSocket.HttpResponse;

     constructor(req: uWebSocket.HttpRequest, res: uWebSocket.HttpResponse) {
          this.request = req; this.response = res;
     };

     get url(): string {
          return this.request.getUrl();
     };

     get method(): string {
          return this.request.getMethod().replace('del', 'delete').toLocaleUpperCase();
     };
}; export class HttpResponse {
     private request: uWebSocket.HttpRequest;
     private response: uWebSocket.HttpResponse;

     #statusCode?: number;
     #completed?: boolean;

     constructor(req: uWebSocket.HttpRequest, res: uWebSocket.HttpResponse) {
          this.request = req; this.response = res;
     };

     get isCompleted(): boolean {
          return this.#completed ? this.#completed : false;
     };

     status(code?: number): HttpResponse {
          this.#statusCode = code; return this;
     };

     send(msg?: response): HttpResponse {
          this.response.cork(() => {
               const { response } = this;

               response
                    .writeStatus(`${this.#statusCode || 200} ${STATUS_CODES[this.#statusCode || 200]}`)
                    .write(typeof msg == 'object' ? JSON.stringify(msg) : (msg?.toString() || ''));
               response.endWithoutBody();
          }); return this;
     };
};

export type response = string | number | boolean | object;