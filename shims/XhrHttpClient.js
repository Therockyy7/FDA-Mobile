// Shim for @microsoft/signalr XhrHttpClient in React Native
// React Native uses fetch, so XHR transport is never needed.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XhrHttpClient = void 0;
exports.XhrHttpClient = class XhrHttpClient {
  send() {
    return Promise.reject(new Error("XHR transport not available in React Native"));
  }
};
