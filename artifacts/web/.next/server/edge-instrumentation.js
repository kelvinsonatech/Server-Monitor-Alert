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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nasync function register() {\n// Monitor scheduling is handled by the Express API server (artifacts/api-server).\n// On Vercel (no Express server), use an external cron service to call /api/cron\n// every minute instead of running the scheduler inline.\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vaW5zdHJ1bWVudGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBTyxlQUFlQTtBQUNwQixrRkFBa0Y7QUFDbEYsZ0ZBQWdGO0FBQ2hGLHdEQUF3RDtBQUMxRCIsInNvdXJjZXMiOlsiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9hcnRpZmFjdHMvd2ViL2luc3RydW1lbnRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XG4gIC8vIE1vbml0b3Igc2NoZWR1bGluZyBpcyBoYW5kbGVkIGJ5IHRoZSBFeHByZXNzIEFQSSBzZXJ2ZXIgKGFydGlmYWN0cy9hcGktc2VydmVyKS5cbiAgLy8gT24gVmVyY2VsIChubyBFeHByZXNzIHNlcnZlciksIHVzZSBhbiBleHRlcm5hbCBjcm9uIHNlcnZpY2UgdG8gY2FsbCAvYXBpL2Nyb25cbiAgLy8gZXZlcnkgbWludXRlIGluc3RlYWQgb2YgcnVubmluZyB0aGUgc2NoZWR1bGVyIGlubGluZS5cbn1cbiJdLCJuYW1lcyI6WyJyZWdpc3RlciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(instrument)/./instrumentation.ts\n");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("(instrument)/./instrumentation.ts"));
/******/ (_ENTRIES = typeof _ENTRIES === "undefined" ? {} : _ENTRIES).middleware_instrumentation = __webpack_exports__;
/******/ }
]);