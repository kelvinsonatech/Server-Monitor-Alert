"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "instrumentation";
exports.ids = ["instrumentation"];
exports.modules = {

/***/ "(instrument)/./instrumentation.ts":
/*!****************************!*\
  !*** ./instrumentation.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nasync function register() {\n    if (true) {\n        const { initMonitorScheduler } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/zod@3.25.76\"), __webpack_require__.e(\"vendor-chunks/drizzle-orm@0.45.2_@types+pg@8.20.0_pg@8.20.0\"), __webpack_require__.e(\"vendor-chunks/pg@8.20.0\"), __webpack_require__.e(\"vendor-chunks/pg-protocol@1.13.0\"), __webpack_require__.e(\"vendor-chunks/pg-pool@3.13.0_pg@8.20.0\"), __webpack_require__.e(\"vendor-chunks/pg-types@2.2.0\"), __webpack_require__.e(\"vendor-chunks/drizzle-zod@0.8.3_drizzle-orm@0.45.2_@types+pg@8.20.0_pg@8.20.0__zod@3.25.76\"), __webpack_require__.e(\"vendor-chunks/pg-connection-string@2.12.0\"), __webpack_require__.e(\"vendor-chunks/pgpass@1.0.5\"), __webpack_require__.e(\"vendor-chunks/split2@4.2.0\"), __webpack_require__.e(\"vendor-chunks/postgres-interval@1.2.0\"), __webpack_require__.e(\"vendor-chunks/postgres-date@1.0.7\"), __webpack_require__.e(\"vendor-chunks/postgres-array@2.0.0\"), __webpack_require__.e(\"vendor-chunks/pg-int8@1.0.1\"), __webpack_require__.e(\"vendor-chunks/postgres-bytea@1.0.1\"), __webpack_require__.e(\"vendor-chunks/xtend@4.0.2\"), __webpack_require__.e(\"vendor-chunks/pg-cloudflare@1.3.0\"), __webpack_require__.e(\"_instrument_lib_monitor-service_ts\")]).then(__webpack_require__.bind(__webpack_require__, /*! ./lib/monitor-service */ \"(instrument)/./lib/monitor-service.ts\"));\n        try {\n            await initMonitorScheduler();\n        } catch (err) {\n            console.error(\"Failed to initialize monitor scheduler:\", err);\n        }\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vaW5zdHJ1bWVudGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBTyxlQUFlQTtJQUNwQixJQUFJQyxJQUFxQyxFQUFFO1FBQ3pDLE1BQU0sRUFBRUcsb0JBQW9CLEVBQUUsR0FBRyxNQUFNLGl3Q0FBK0I7UUFDdEUsSUFBSTtZQUNGLE1BQU1BO1FBQ1IsRUFBRSxPQUFPQyxLQUFLO1lBQ1pDLFFBQVFDLEtBQUssQ0FBQywyQ0FBMkNGO1FBQzNEO0lBQ0Y7QUFDRiIsInNvdXJjZXMiOlsiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9hcnRpZmFjdHMvd2ViL2luc3RydW1lbnRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XG4gIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgPT09IFwibm9kZWpzXCIpIHtcbiAgICBjb25zdCB7IGluaXRNb25pdG9yU2NoZWR1bGVyIH0gPSBhd2FpdCBpbXBvcnQoXCIuL2xpYi9tb25pdG9yLXNlcnZpY2VcIik7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGluaXRNb25pdG9yU2NoZWR1bGVyKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGluaXRpYWxpemUgbW9uaXRvciBzY2hlZHVsZXI6XCIsIGVycik7XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOlsicmVnaXN0ZXIiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9SVU5USU1FIiwiaW5pdE1vbml0b3JTY2hlZHVsZXIiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(instrument)/./instrumentation.ts\n");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "dns":
/*!**********************!*\
  !*** external "dns" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("dns");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("net");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "string_decoder":
/*!*********************************!*\
  !*** external "string_decoder" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("string_decoder");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tls");

/***/ }),

/***/ "undici":
/*!*************************!*\
  !*** external "undici" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("undici");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(instrument)/./instrumentation.ts"));
module.exports = __webpack_exports__;

})();