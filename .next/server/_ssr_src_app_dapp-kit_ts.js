"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_src_app_dapp-kit_ts";
exports.ids = ["_ssr_src_app_dapp-kit_ts"];
exports.modules = {

/***/ "(ssr)/./src/app/dapp-kit.ts":
/*!*****************************!*\
  !*** ./src/app/dapp-kit.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   dAppKit: () => (/* binding */ dAppKit)\n/* harmony export */ });\n/* harmony import */ var _mysten_dapp_kit_react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @mysten/dapp-kit-react */ \"(ssr)/./node_modules/@mysten/dapp-kit-react/dist/index.mjs\");\n/* harmony import */ var _mysten_sui_grpc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @mysten/sui/grpc */ \"(ssr)/./node_modules/@mysten/sui/dist/grpc/client.mjs\");\n\n\nconst GRPC_URLS = {\n    testnet: \"https://fullnode.testnet.sui.io:443\"\n};\nconst dAppKit = (0,_mysten_dapp_kit_react__WEBPACK_IMPORTED_MODULE_0__.createDAppKit)({\n    networks: [\n        \"testnet\"\n    ],\n    createClient: (network)=>new _mysten_sui_grpc__WEBPACK_IMPORTED_MODULE_1__.SuiGrpcClient({\n            network,\n            baseUrl: GRPC_URLS[network]\n        })\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvYXBwL2RhcHAta2l0LnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUF1RDtBQUNOO0FBRWpELE1BQU1FLFlBQVk7SUFDakJDLFNBQVM7QUFDVjtBQUVPLE1BQU1DLFVBQVVKLHFFQUFhQSxDQUFDO0lBQ3BDSyxVQUFVO1FBQUM7S0FBVTtJQUNyQkMsY0FBYyxDQUFDQyxVQUFZLElBQUlOLDJEQUFhQSxDQUFDO1lBQUVNO1lBQVNDLFNBQVNOLFNBQVMsQ0FBQ0ssUUFBUTtRQUFDO0FBQ3JGLEdBQUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh1cy8uL3NyYy9hcHAvZGFwcC1raXQudHM/YjU0YSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVEQXBwS2l0IH0gZnJvbSAnQG15c3Rlbi9kYXBwLWtpdC1yZWFjdCc7XG5pbXBvcnQgeyBTdWlHcnBjQ2xpZW50IH0gZnJvbSAnQG15c3Rlbi9zdWkvZ3JwYyc7XG5cbmNvbnN0IEdSUENfVVJMUyA9IHtcblx0dGVzdG5ldDogJ2h0dHBzOi8vZnVsbG5vZGUudGVzdG5ldC5zdWkuaW86NDQzJyxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBkQXBwS2l0ID0gY3JlYXRlREFwcEtpdCh7XG5cdG5ldHdvcmtzOiBbJ3Rlc3RuZXQnXSxcblx0Y3JlYXRlQ2xpZW50OiAobmV0d29yaykgPT4gbmV3IFN1aUdycGNDbGllbnQoeyBuZXR3b3JrLCBiYXNlVXJsOiBHUlBDX1VSTFNbbmV0d29ya10gfSksXG59KTtcblxuZGVjbGFyZSBtb2R1bGUgJ0BteXN0ZW4vZGFwcC1raXQtcmVhY3QnIHtcblx0aW50ZXJmYWNlIFJlZ2lzdGVyIHtcblx0XHRkQXBwS2l0OiB0eXBlb2YgZEFwcEtpdDtcblx0fVxufVxuIl0sIm5hbWVzIjpbImNyZWF0ZURBcHBLaXQiLCJTdWlHcnBjQ2xpZW50IiwiR1JQQ19VUkxTIiwidGVzdG5ldCIsImRBcHBLaXQiLCJuZXR3b3JrcyIsImNyZWF0ZUNsaWVudCIsIm5ldHdvcmsiLCJiYXNlVXJsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./src/app/dapp-kit.ts\n");

/***/ })

};
;