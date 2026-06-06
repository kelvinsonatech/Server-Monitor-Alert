// runtime can't be in strict mode because a global variable is assign and maybe created.
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([["instrumentation"],{

/***/ "(instrument)/./instrumentation.ts":
/*!****************************!*\
  !*** ./instrumentation.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nasync function register() {\n    // Monitoring (pinging + Telegram alerts) is owned by the Express api-server\n    // artifact, which runs the scheduler against the shared database. Starting a\n    // second scheduler here would double every check and send duplicate alerts.\n    // Set ENABLE_MONITOR_SCHEDULER=true to opt this backend in instead.\n    if (false) {}\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vaW5zdHJ1bWVudGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBTyxlQUFlQTtJQUNwQiw0RUFBNEU7SUFDNUUsNkVBQTZFO0lBQzdFLDRFQUE0RTtJQUM1RSxvRUFBb0U7SUFDcEUsSUFDRUMsS0FDK0MsRUFDL0MsRUFPRDtBQUNIIiwic291cmNlcyI6WyIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL2FydGlmYWN0cy93ZWIvaW5zdHJ1bWVudGF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWdpc3RlcigpIHtcbiAgLy8gTW9uaXRvcmluZyAocGluZ2luZyArIFRlbGVncmFtIGFsZXJ0cykgaXMgb3duZWQgYnkgdGhlIEV4cHJlc3MgYXBpLXNlcnZlclxuICAvLyBhcnRpZmFjdCwgd2hpY2ggcnVucyB0aGUgc2NoZWR1bGVyIGFnYWluc3QgdGhlIHNoYXJlZCBkYXRhYmFzZS4gU3RhcnRpbmcgYVxuICAvLyBzZWNvbmQgc2NoZWR1bGVyIGhlcmUgd291bGQgZG91YmxlIGV2ZXJ5IGNoZWNrIGFuZCBzZW5kIGR1cGxpY2F0ZSBhbGVydHMuXG4gIC8vIFNldCBFTkFCTEVfTU9OSVRPUl9TQ0hFRFVMRVI9dHJ1ZSB0byBvcHQgdGhpcyBiYWNrZW5kIGluIGluc3RlYWQuXG4gIGlmIChcbiAgICBwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgPT09IFwibm9kZWpzXCIgJiZcbiAgICBwcm9jZXNzLmVudi5FTkFCTEVfTU9OSVRPUl9TQ0hFRFVMRVIgPT09IFwidHJ1ZVwiXG4gICkge1xuICAgIGNvbnN0IHsgaW5pdE1vbml0b3JTY2hlZHVsZXIgfSA9IGF3YWl0IGltcG9ydChcIi4vbGliL21vbml0b3Itc2VydmljZVwiKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgaW5pdE1vbml0b3JTY2hlZHVsZXIoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gaW5pdGlhbGl6ZSBtb25pdG9yIHNjaGVkdWxlcjpcIiwgZXJyKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJyZWdpc3RlciIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1JVTlRJTUUiLCJFTkFCTEVfTU9OSVRPUl9TQ0hFRFVMRVIiLCJpbml0TW9uaXRvclNjaGVkdWxlciIsImVyciIsImNvbnNvbGUiLCJlcnJvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(instrument)/./instrumentation.ts\n");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("(instrument)/./instrumentation.ts"));
/******/ (_ENTRIES = typeof _ENTRIES === "undefined" ? {} : _ENTRIES).middleware_instrumentation = __webpack_exports__;
/******/ }
]);