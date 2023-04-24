import * as uWebSocket from 'uWebSocket.js';
export declare class HttpRequest {
    private request;
    private response;
    constructor(req: uWebSocket.HttpRequest, res: uWebSocket.HttpResponse);
    get url(): string;
    get method(): string;
}
export declare class HttpResponse {
    #private;
    private request;
    private response;
    constructor(req: uWebSocket.HttpRequest, res: uWebSocket.HttpResponse);
    get isCompleted(): boolean;
    status(code?: number): HttpResponse;
    send(msg?: response): HttpResponse;
}
export type response = string | number | boolean | object;
