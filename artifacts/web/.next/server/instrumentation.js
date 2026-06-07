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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nasync function register() {\n    // Monitoring (pinging + Telegram alerts) is owned by the Express api-server\n    // artifact, which runs the scheduler against the shared database. Starting a\n    // second scheduler here would double every check and send duplicate alerts.\n    // Set ENABLE_MONITOR_SCHEDULER=true to opt this backend in instead.\n    if ( true && process.env.ENABLE_MONITOR_SCHEDULER === \"true\") {\n        const { initMonitorScheduler } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/drizzle-orm@0.45.2_@types+pg@8.20.0_pg@8.20.0\"), __webpack_require__.e(\"vendor-chunks/zod@3.25.76\"), __webpack_require__.e(\"vendor-chunks/pg@8.20.0\"), __webpack_require__.e(\"vendor-chunks/pg-protocol@1.13.0\"), __webpack_require__.e(\"vendor-chunks/pg-types@2.2.0\"), __webpack_require__.e(\"vendor-chunks/pgpass@1.0.5\"), __webpack_require__.e(\"vendor-chunks/drizzle-zod@0.8.3_drizzle-orm@0.45.2_@types+pg@8.20.0_pg@8.20.0__zod@3.25.76\"), __webpack_require__.e(\"vendor-chunks/xtend@4.0.2\"), __webpack_require__.e(\"vendor-chunks/split2@4.2.0\"), __webpack_require__.e(\"vendor-chunks/postgres-interval@1.2.0\"), __webpack_require__.e(\"vendor-chunks/postgres-date@1.0.7\"), __webpack_require__.e(\"vendor-chunks/postgres-bytea@1.0.1\"), __webpack_require__.e(\"vendor-chunks/postgres-array@2.0.0\"), __webpack_require__.e(\"vendor-chunks/pg-pool@3.13.0_pg@8.20.0\"), __webpack_require__.e(\"vendor-chunks/pg-int8@1.0.1\"), __webpack_require__.e(\"vendor-chunks/pg-connection-string@2.12.0\"), __webpack_require__.e(\"vendor-chunks/pg-cloudflare@1.3.0\"), __webpack_require__.e(\"_instrument_lib_monitor-service_ts\")]).then(__webpack_require__.bind(__webpack_require__, /*! ./lib/monitor-service */ \"(instrument)/./lib/monitor-service.ts\"));\n        try {\n            await initMonitorScheduler();\n        } catch (err) {\n            console.error(\"Failed to initialize monitor scheduler:\", err);\n        }\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vaW5zdHJ1bWVudGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBTyxlQUFlQTtJQUNwQiw0RUFBNEU7SUFDNUUsNkVBQTZFO0lBQzdFLDRFQUE0RTtJQUM1RSxvRUFBb0U7SUFDcEUsSUFDRUMsS0FBcUMsSUFDckNBLFFBQVFDLEdBQUcsQ0FBQ0Usd0JBQXdCLEtBQUssUUFDekM7UUFDQSxNQUFNLEVBQUVDLG9CQUFvQixFQUFFLEdBQUcsTUFBTSxpd0NBQStCO1FBQ3RFLElBQUk7WUFDRixNQUFNQTtRQUNSLEVBQUUsT0FBT0MsS0FBSztZQUNaQyxRQUFRQyxLQUFLLENBQUMsMkNBQTJDRjtRQUMzRDtJQUNGO0FBQ0YiLCJzb3VyY2VzIjpbIi9ob21lL3J1bm5lci93b3Jrc3BhY2UvYXJ0aWZhY3RzL3dlYi9pbnN0cnVtZW50YXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyKCkge1xuICAvLyBNb25pdG9yaW5nIChwaW5naW5nICsgVGVsZWdyYW0gYWxlcnRzKSBpcyBvd25lZCBieSB0aGUgRXhwcmVzcyBhcGktc2VydmVyXG4gIC8vIGFydGlmYWN0LCB3aGljaCBydW5zIHRoZSBzY2hlZHVsZXIgYWdhaW5zdCB0aGUgc2hhcmVkIGRhdGFiYXNlLiBTdGFydGluZyBhXG4gIC8vIHNlY29uZCBzY2hlZHVsZXIgaGVyZSB3b3VsZCBkb3VibGUgZXZlcnkgY2hlY2sgYW5kIHNlbmQgZHVwbGljYXRlIGFsZXJ0cy5cbiAgLy8gU2V0IEVOQUJMRV9NT05JVE9SX1NDSEVEVUxFUj10cnVlIHRvIG9wdCB0aGlzIGJhY2tlbmQgaW4gaW5zdGVhZC5cbiAgaWYgKFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUlVOVElNRSA9PT0gXCJub2RlanNcIiAmJlxuICAgIHByb2Nlc3MuZW52LkVOQUJMRV9NT05JVE9SX1NDSEVEVUxFUiA9PT0gXCJ0cnVlXCJcbiAgKSB7XG4gICAgY29uc3QgeyBpbml0TW9uaXRvclNjaGVkdWxlciB9ID0gYXdhaXQgaW1wb3J0KFwiLi9saWIvbW9uaXRvci1zZXJ2aWNlXCIpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBpbml0TW9uaXRvclNjaGVkdWxlcigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBpbml0aWFsaXplIG1vbml0b3Igc2NoZWR1bGVyOlwiLCBlcnIpO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbInJlZ2lzdGVyIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUlVOVElNRSIsIkVOQUJMRV9NT05JVE9SX1NDSEVEVUxFUiIsImluaXRNb25pdG9yU2NoZWR1bGVyIiwiZXJyIiwiY29uc29sZSIsImVycm9yIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(instrument)/./instrumentation.ts\n");

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