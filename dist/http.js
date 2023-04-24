"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _HttpResponse_statusCode, _HttpResponse_completed;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponse = exports.HttpRequest = void 0;
const http_1 = require("http");
class HttpRequest {
    constructor(req, res) {
        this.request = req;
        this.response = res;
    }
    ;
    get url() {
        return this.request.getUrl();
    }
    ;
    get method() {
        return this.request.getMethod().replace('del', 'delete').toLocaleUpperCase();
    }
    ;
}
exports.HttpRequest = HttpRequest;
;
class HttpResponse {
    constructor(req, res) {
        _HttpResponse_statusCode.set(this, void 0);
        _HttpResponse_completed.set(this, void 0);
        this.request = req;
        this.response = res;
    }
    ;
    get isCompleted() {
        return __classPrivateFieldGet(this, _HttpResponse_completed, "f") ? __classPrivateFieldGet(this, _HttpResponse_completed, "f") : false;
    }
    ;
    status(code) {
        __classPrivateFieldSet(this, _HttpResponse_statusCode, code, "f");
        return this;
    }
    ;
    send(msg) {
        this.response.cork(() => {
            const { response } = this;
            response
                .writeStatus(`${__classPrivateFieldGet(this, _HttpResponse_statusCode, "f") || 200} ${http_1.STATUS_CODES[__classPrivateFieldGet(this, _HttpResponse_statusCode, "f") || 200]}`)
                .write(typeof msg == 'object' ? JSON.stringify(msg) : ((msg === null || msg === void 0 ? void 0 : msg.toString()) || ''));
            response.endWithoutBody();
        });
        return this;
    }
    ;
}
exports.HttpResponse = HttpResponse;
_HttpResponse_statusCode = new WeakMap(), _HttpResponse_completed = new WeakMap();
;
