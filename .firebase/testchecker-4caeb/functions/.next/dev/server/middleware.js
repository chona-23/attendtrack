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
exports.id = "proxy";
exports.ids = ["proxy"];
exports.modules = {

/***/ "(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti&matchers=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti&matchers=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   handler: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/build/adapter/setup-node-env.external */ \"next/dist/build/adapter/setup-node-env.external\");\n/* harmony import */ var next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/web/globals */ \"(middleware)/./node_modules/next/dist/server/web/globals.js\");\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/web/adapter */ \"(middleware)/./node_modules/next/dist/server/web/adapter.js\");\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/lib/incremental-cache */ \"(middleware)/./node_modules/next/dist/server/lib/incremental-cache/index.js\");\n/* harmony import */ var next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _proxy_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./proxy.ts */ \"(middleware)/./proxy.ts\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/client/components/is-next-router-error */ \"(middleware)/./node_modules/next/dist/client/components/is-next-router-error.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(middleware)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\nconst incrementalCacheHandler = null\n// Import the userland code.\n;\n\n\n\nconst mod = {\n    ..._proxy_ts__WEBPACK_IMPORTED_MODULE_4__\n};\nconst page = \"/proxy\";\nconst isProxy = page === '/proxy' || page === '/src/proxy';\nconst handlerUserland = (isProxy ? mod.proxy : mod.middleware) || mod.default;\nclass ProxyMissingExportError extends Error {\n    constructor(message){\n        super(message);\n        Object.defineProperty(this, \"__NEXT_ERROR_CODE\", {\n            value: \"E394\",\n            enumerable: false,\n            configurable: true\n        });\n        // Stack isn't useful here, remove it considering it spams logs during development.\n        this.stack = '';\n    }\n}\n// TODO: This spams logs during development. Find a better way to handle this.\n// Removing this will spam \"fn is not a function\" logs which is worse.\nif (typeof handlerUserland !== 'function') {\n    throw new ProxyMissingExportError(`The ${isProxy ? 'Proxy' : 'Middleware'} file \"${page}\" must export a function named \\`${isProxy ? 'proxy' : 'middleware'}\\` or a default function.`);\n}\n// Proxy will only sent out the FetchEvent to next server,\n// so load instrumentation module here and track the error inside proxy module.\nfunction errorHandledHandler(fn) {\n    return async (...args)=>{\n        try {\n            return await fn(...args);\n        } catch (err) {\n            // In development, error the navigation API usage in runtime,\n            // since it's not allowed to be used in proxy as it's outside of react component tree.\n            if (true) {\n                if ((0,next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__.isNextRouterError)(err)) {\n                    err.message = `Next.js navigation API is not allowed to be used in ${isProxy ? 'Proxy' : 'Middleware'}.`;\n                    throw err;\n                }\n            }\n            const req = args[0];\n            const url = new URL(req.url);\n            const resource = url.pathname + url.search;\n            await (0,next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__.edgeInstrumentationOnRequestError)(err, {\n                path: resource,\n                method: req.method,\n                headers: Object.fromEntries(req.headers.entries())\n            }, {\n                routerKind: 'Pages Router',\n                routePath: '/proxy',\n                routeType: 'proxy',\n                revalidateReason: undefined\n            });\n            throw err;\n        }\n    };\n}\nconst internalHandler = async (opts)=>{\n    if (true) {\n        var _opts_request_requestMeta, _opts_request_requestMeta1;\n        // This mirrors what `RouteModule#prepare` does for routes\n        // edge runtime handles loading instrumentation at the edge adapter level\n        const { join, relative } = __webpack_require__(/*! node:path */ \"node:path\");\n        const { ensureInstrumentationRegistered } = __webpack_require__(/*! next/dist/server/lib/router-utils/instrumentation-globals.external */ \"next/dist/server/lib/router-utils/instrumentation-globals.external\");\n        const absoluteProjectDir = join(/* turbopackIgnore: true */ process.cwd(), ((_opts_request_requestMeta = opts.request.requestMeta) == null ? void 0 : _opts_request_requestMeta.relativeProjectDir) || '');\n        const absoluteDistDir = (_opts_request_requestMeta1 = opts.request.requestMeta) == null ? void 0 : _opts_request_requestMeta1.distDir;\n        const distDir = absoluteDistDir ? relative(absoluteProjectDir, absoluteDistDir) : '.next';\n        await ensureInstrumentationRegistered(absoluteProjectDir, distDir);\n    }\n    return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__.adapter)({\n        ...opts,\n        IncrementalCache: next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__.IncrementalCache,\n        incrementalCacheHandler,\n        page,\n        handler: errorHandledHandler(handlerUserland)\n    });\n};\nasync function handler(request, ctx) {\n    const result = await internalHandler({\n        request: {\n            url: request.url,\n            method: request.method,\n            headers: (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__.toNodeOutgoingHttpHeaders)(request.headers),\n            nextConfig: {\n                basePath: \"\",\n                i18n: \"\",\n                trailingSlash: Boolean(false),\n                experimental: {\n                    cacheLife: {\"default\":{\"stale\":300,\"revalidate\":900,\"expire\":4294967294},\"seconds\":{\"stale\":30,\"revalidate\":1,\"expire\":60},\"minutes\":{\"stale\":300,\"revalidate\":60,\"expire\":3600},\"hours\":{\"stale\":300,\"revalidate\":3600,\"expire\":86400},\"days\":{\"stale\":300,\"revalidate\":86400,\"expire\":604800},\"weeks\":{\"stale\":300,\"revalidate\":604800,\"expire\":2592000},\"max\":{\"stale\":300,\"revalidate\":2592000,\"expire\":31536000}},\n                    authInterrupts: Boolean(false),\n                    clientParamParsingOrigins: []\n                }\n            },\n            page: {\n                name: page\n            },\n            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body ?? undefined : undefined,\n            waitUntil: ctx.waitUntil,\n            requestMeta: ctx.requestMeta,\n            signal: ctx.signal || new AbortController().signal\n        }\n    });\n    ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, result.waitUntil);\n    return result.response;\n}\n// backwards compat for non-adapter setups\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (internalHandler);\n\n//# sourceMappingURL=middleware.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1taWRkbGV3YXJlLWxvYWRlci5qcz9hYnNvbHV0ZVBhZ2VQYXRoPSUyRlVzZXJzJTJGaW1hZ2FuYWwlMkZEb2N1bWVudHMlMkZDU0NPTVNGVCUyMGNvcHklMkZkcmFwX3N0b3JlJTJGQW50aSUyRnByb3h5LnRzJnBhZ2U9JTJGcHJveHkmcm9vdERpcj0lMkZVc2VycyUyRmltYWdhbmFsJTJGRG9jdW1lbnRzJTJGQ1NDT01TRlQlMjBjb3B5JTJGZHJhcF9zdG9yZSUyRkFudGkmbWF0Y2hlcnM9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF5RDtBQUNuQjtBQUNpQjtBQUNtQjtBQUMxRTtBQUNBO0FBQ0EsQ0FBbUM7QUFDOEM7QUFDSTtBQUNkO0FBQ3ZFO0FBQ0EsT0FBTyxzQ0FBSTtBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsa0NBQWtDLFFBQVEsS0FBSyxtQ0FBbUMsaUNBQWlDO0FBQ2hLO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxnQkFBZ0IsSUFBcUM7QUFDckQsb0JBQW9CLG1HQUFpQjtBQUNyQyx5RkFBeUYsaUNBQWlDO0FBQzFIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwrRkFBaUM7QUFDbkQ7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQW1DO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixpQkFBaUIsRUFBRSxtQkFBTyxDQUFDLDRCQUFXO0FBQ3RELGdCQUFnQixrQ0FBa0MsRUFBRSxtQkFBTyxDQUFDLDhJQUFvRTtBQUNoSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxxRUFBTztBQUNsQjtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHFGQUF5QjtBQUM5QztBQUNBLDBCQUEwQixFQUE0QjtBQUN0RCxzQkFBc0IsRUFBOEI7QUFDcEQsdUNBQXVDLEtBQWlDO0FBQ3hFO0FBQ0EsK0JBQStCLDJZQUE2QjtBQUM1RCw0Q0FBNEMsS0FBK0M7QUFDM0YsK0NBQStDLEVBQStDO0FBQzlGO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLGVBQWUsRUFBQzs7QUFFL0IiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJuZXh0L2Rpc3QvYnVpbGQvYWRhcHRlci9zZXR1cC1ub2RlLWVudi5leHRlcm5hbFwiO1xuaW1wb3J0IFwibmV4dC9kaXN0L3NlcnZlci93ZWIvZ2xvYmFsc1wiO1xuaW1wb3J0IHsgYWRhcHRlciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9hZGFwdGVyXCI7XG5pbXBvcnQgeyBJbmNyZW1lbnRhbENhY2hlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL2luY3JlbWVudGFsLWNhY2hlXCI7XG5jb25zdCBpbmNyZW1lbnRhbENhY2hlSGFuZGxlciA9IG51bGxcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIF9tb2QgZnJvbSBcIi4vcHJveHkudHNcIjtcbmltcG9ydCB7IGVkZ2VJbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9nbG9iYWxzXCI7XG5pbXBvcnQgeyBpc05leHRSb3V0ZXJFcnJvciB9IGZyb20gXCJuZXh0L2Rpc3QvY2xpZW50L2NvbXBvbmVudHMvaXMtbmV4dC1yb3V0ZXItZXJyb3JcIjtcbmltcG9ydCB7IHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvdXRpbHNcIjtcbmNvbnN0IG1vZCA9IHtcbiAgICAuLi5fbW9kXG59O1xuY29uc3QgcGFnZSA9IFwiL3Byb3h5XCI7XG5jb25zdCBpc1Byb3h5ID0gcGFnZSA9PT0gJy9wcm94eScgfHwgcGFnZSA9PT0gJy9zcmMvcHJveHknO1xuY29uc3QgaGFuZGxlclVzZXJsYW5kID0gKGlzUHJveHkgPyBtb2QucHJveHkgOiBtb2QubWlkZGxld2FyZSkgfHwgbW9kLmRlZmF1bHQ7XG5jbGFzcyBQcm94eU1pc3NpbmdFeHBvcnRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIl9fTkVYVF9FUlJPUl9DT0RFXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBcIkUzOTRcIixcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTdGFjayBpc24ndCB1c2VmdWwgaGVyZSwgcmVtb3ZlIGl0IGNvbnNpZGVyaW5nIGl0IHNwYW1zIGxvZ3MgZHVyaW5nIGRldmVsb3BtZW50LlxuICAgICAgICB0aGlzLnN0YWNrID0gJyc7XG4gICAgfVxufVxuLy8gVE9ETzogVGhpcyBzcGFtcyBsb2dzIGR1cmluZyBkZXZlbG9wbWVudC4gRmluZCBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXMuXG4vLyBSZW1vdmluZyB0aGlzIHdpbGwgc3BhbSBcImZuIGlzIG5vdCBhIGZ1bmN0aW9uXCIgbG9ncyB3aGljaCBpcyB3b3JzZS5cbmlmICh0eXBlb2YgaGFuZGxlclVzZXJsYW5kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFByb3h5TWlzc2luZ0V4cG9ydEVycm9yKGBUaGUgJHtpc1Byb3h5ID8gJ1Byb3h5JyA6ICdNaWRkbGV3YXJlJ30gZmlsZSBcIiR7cGFnZX1cIiBtdXN0IGV4cG9ydCBhIGZ1bmN0aW9uIG5hbWVkIFxcYCR7aXNQcm94eSA/ICdwcm94eScgOiAnbWlkZGxld2FyZSd9XFxgIG9yIGEgZGVmYXVsdCBmdW5jdGlvbi5gKTtcbn1cbi8vIFByb3h5IHdpbGwgb25seSBzZW50IG91dCB0aGUgRmV0Y2hFdmVudCB0byBuZXh0IHNlcnZlcixcbi8vIHNvIGxvYWQgaW5zdHJ1bWVudGF0aW9uIG1vZHVsZSBoZXJlIGFuZCB0cmFjayB0aGUgZXJyb3IgaW5zaWRlIHByb3h5IG1vZHVsZS5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlZEhhbmRsZXIoZm4pIHtcbiAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQsIGVycm9yIHRoZSBuYXZpZ2F0aW9uIEFQSSB1c2FnZSBpbiBydW50aW1lLFxuICAgICAgICAgICAgLy8gc2luY2UgaXQncyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIHByb3h5IGFzIGl0J3Mgb3V0c2lkZSBvZiByZWFjdCBjb21wb25lbnQgdHJlZS5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmV4dFJvdXRlckVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBgTmV4dC5qcyBuYXZpZ2F0aW9uIEFQSSBpcyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluICR7aXNQcm94eSA/ICdQcm94eScgOiAnTWlkZGxld2FyZSd9LmA7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXEgPSBhcmdzWzBdO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgICAgICAgICAgIGF3YWl0IGVkZ2VJbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvcihlcnIsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiByZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzLmVudHJpZXMoKSlcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnUGFnZXMgUm91dGVyJyxcbiAgICAgICAgICAgICAgICByb3V0ZVBhdGg6ICcvcHJveHknLFxuICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ3Byb3h5JyxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmNvbnN0IGludGVybmFsSGFuZGxlciA9IGFzeW5jIChvcHRzKT0+e1xuICAgIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgIT09ICdlZGdlJykge1xuICAgICAgICB2YXIgX29wdHNfcmVxdWVzdF9yZXF1ZXN0TWV0YSwgX29wdHNfcmVxdWVzdF9yZXF1ZXN0TWV0YTE7XG4gICAgICAgIC8vIFRoaXMgbWlycm9ycyB3aGF0IGBSb3V0ZU1vZHVsZSNwcmVwYXJlYCBkb2VzIGZvciByb3V0ZXNcbiAgICAgICAgLy8gZWRnZSBydW50aW1lIGhhbmRsZXMgbG9hZGluZyBpbnN0cnVtZW50YXRpb24gYXQgdGhlIGVkZ2UgYWRhcHRlciBsZXZlbFxuICAgICAgICBjb25zdCB7IGpvaW4sIHJlbGF0aXZlIH0gPSByZXF1aXJlKCdub2RlOnBhdGgnKTtcbiAgICAgICAgY29uc3QgeyBlbnN1cmVJbnN0cnVtZW50YXRpb25SZWdpc3RlcmVkIH0gPSByZXF1aXJlKFwibmV4dC9kaXN0L3NlcnZlci9saWIvcm91dGVyLXV0aWxzL2luc3RydW1lbnRhdGlvbi1nbG9iYWxzLmV4dGVybmFsXCIpO1xuICAgICAgICBjb25zdCBhYnNvbHV0ZVByb2plY3REaXIgPSBqb2luKC8qIHR1cmJvcGFja0lnbm9yZTogdHJ1ZSAqLyBwcm9jZXNzLmN3ZCgpLCAoKF9vcHRzX3JlcXVlc3RfcmVxdWVzdE1ldGEgPSBvcHRzLnJlcXVlc3QucmVxdWVzdE1ldGEpID09IG51bGwgPyB2b2lkIDAgOiBfb3B0c19yZXF1ZXN0X3JlcXVlc3RNZXRhLnJlbGF0aXZlUHJvamVjdERpcikgfHwgJycpO1xuICAgICAgICBjb25zdCBhYnNvbHV0ZURpc3REaXIgPSAoX29wdHNfcmVxdWVzdF9yZXF1ZXN0TWV0YTEgPSBvcHRzLnJlcXVlc3QucmVxdWVzdE1ldGEpID09IG51bGwgPyB2b2lkIDAgOiBfb3B0c19yZXF1ZXN0X3JlcXVlc3RNZXRhMS5kaXN0RGlyO1xuICAgICAgICBjb25zdCBkaXN0RGlyID0gYWJzb2x1dGVEaXN0RGlyID8gcmVsYXRpdmUoYWJzb2x1dGVQcm9qZWN0RGlyLCBhYnNvbHV0ZURpc3REaXIpIDogJy5uZXh0JztcbiAgICAgICAgYXdhaXQgZW5zdXJlSW5zdHJ1bWVudGF0aW9uUmVnaXN0ZXJlZChhYnNvbHV0ZVByb2plY3REaXIsIGRpc3REaXIpO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcih7XG4gICAgICAgIC4uLm9wdHMsXG4gICAgICAgIEluY3JlbWVudGFsQ2FjaGUsXG4gICAgICAgIGluY3JlbWVudGFsQ2FjaGVIYW5kbGVyLFxuICAgICAgICBwYWdlLFxuICAgICAgICBoYW5kbGVyOiBlcnJvckhhbmRsZWRIYW5kbGVyKGhhbmRsZXJVc2VybGFuZClcbiAgICB9KTtcbn07XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXF1ZXN0LCBjdHgpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpbnRlcm5hbEhhbmRsZXIoe1xuICAgICAgICByZXF1ZXN0OiB7XG4gICAgICAgICAgICB1cmw6IHJlcXVlc3QudXJsLFxuICAgICAgICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKSxcbiAgICAgICAgICAgIG5leHRDb25maWc6IHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aDogcHJvY2Vzcy5lbnYuX19ORVhUX0JBU0VfUEFUSCxcbiAgICAgICAgICAgICAgICBpMThuOiBwcm9jZXNzLmVudi5fX05FWFRfSTE4Tl9DT05GSUcsXG4gICAgICAgICAgICAgICAgdHJhaWxpbmdTbGFzaDogQm9vbGVhbihwcm9jZXNzLmVudi5fX05FWFRfVFJBSUxJTkdfU0xBU0gpLFxuICAgICAgICAgICAgICAgIGV4cGVyaW1lbnRhbDoge1xuICAgICAgICAgICAgICAgICAgICBjYWNoZUxpZmU6IHByb2Nlc3MuZW52Ll9fTkVYVF9DQUNIRV9MSUZFLFxuICAgICAgICAgICAgICAgICAgICBhdXRoSW50ZXJydXB0czogQm9vbGVhbihwcm9jZXNzLmVudi5fX05FWFRfRVhQRVJJTUVOVEFMX0FVVEhfSU5URVJSVVBUUyksXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtUGFyc2luZ09yaWdpbnM6IHByb2Nlc3MuZW52Ll9fTkVYVF9DTElFTlRfUEFSQU1fUEFSU0lOR19PUklHSU5TXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhZ2U6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBwYWdlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogcmVxdWVzdC5tZXRob2QgIT09ICdHRVQnICYmIHJlcXVlc3QubWV0aG9kICE9PSAnSEVBRCcgPyByZXF1ZXN0LmJvZHkgPz8gdW5kZWZpbmVkIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgd2FpdFVudGlsOiBjdHgud2FpdFVudGlsLFxuICAgICAgICAgICAgcmVxdWVzdE1ldGE6IGN0eC5yZXF1ZXN0TWV0YSxcbiAgICAgICAgICAgIHNpZ25hbDogY3R4LnNpZ25hbCB8fCBuZXcgQWJvcnRDb250cm9sbGVyKCkuc2lnbmFsXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjdHgud2FpdFVudGlsID09IG51bGwgPyB2b2lkIDAgOiBjdHgud2FpdFVudGlsLmNhbGwoY3R4LCByZXN1bHQud2FpdFVudGlsKTtcbiAgICByZXR1cm4gcmVzdWx0LnJlc3BvbnNlO1xufVxuLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm9uLWFkYXB0ZXIgc2V0dXBzXG5leHBvcnQgZGVmYXVsdCBpbnRlcm5hbEhhbmRsZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGRsZXdhcmUuanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti&matchers=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(middleware)/./proxy.ts":
/*!******************!*\
  !*** ./proxy.ts ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   proxy: () => (/* binding */ proxy)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/api/server.js\");\n\nfunction proxy(request) {\n    const { pathname } = request.nextUrl;\n    // Protect /admin/* routes (except /admin/login)\n    if (pathname.startsWith(\"/admin\") && pathname !== \"/admin/login\") {\n        const adminSession = request.cookies.get(\"admin_session\");\n        if (!adminSession?.value) {\n            const loginUrl = new URL(\"/admin/login\", request.url);\n            loginUrl.searchParams.set(\"from\", pathname);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.redirect(loginUrl);\n        }\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next();\n}\nconst config = {\n    matcher: [\n        \"/admin/:path*\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vcHJveHkudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTJDO0FBR3BDLFNBQVNDLE1BQU1DLE9BQW9CO0lBQ3hDLE1BQU0sRUFBRUMsUUFBUSxFQUFFLEdBQUdELFFBQVFFLE9BQU87SUFFcEMsZ0RBQWdEO0lBQ2hELElBQUlELFNBQVNFLFVBQVUsQ0FBQyxhQUFhRixhQUFhLGdCQUFnQjtRQUNoRSxNQUFNRyxlQUFlSixRQUFRSyxPQUFPLENBQUNDLEdBQUcsQ0FBQztRQUV6QyxJQUFJLENBQUNGLGNBQWNHLE9BQU87WUFDeEIsTUFBTUMsV0FBVyxJQUFJQyxJQUFJLGdCQUFnQlQsUUFBUVUsR0FBRztZQUNwREYsU0FBU0csWUFBWSxDQUFDQyxHQUFHLENBQUMsUUFBUVg7WUFDbEMsT0FBT0gscURBQVlBLENBQUNlLFFBQVEsQ0FBQ0w7UUFDL0I7SUFDRjtJQUVBLE9BQU9WLHFEQUFZQSxDQUFDZ0IsSUFBSTtBQUMxQjtBQUVPLE1BQU1DLFNBQVM7SUFDcEJDLFNBQVM7UUFBQztLQUFnQjtBQUM1QixFQUFFIiwic291cmNlcyI6WyIvVXNlcnMvaW1hZ2FuYWwvRG9jdW1lbnRzL0NTQ09NU0ZUIGNvcHkvZHJhcF9zdG9yZS9BbnRpL3Byb3h5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IHR5cGUgeyBOZXh0UmVxdWVzdCB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJveHkocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgY29uc3QgeyBwYXRobmFtZSB9ID0gcmVxdWVzdC5uZXh0VXJsO1xuXG4gIC8vIFByb3RlY3QgL2FkbWluLyogcm91dGVzIChleGNlcHQgL2FkbWluL2xvZ2luKVxuICBpZiAocGF0aG5hbWUuc3RhcnRzV2l0aChcIi9hZG1pblwiKSAmJiBwYXRobmFtZSAhPT0gXCIvYWRtaW4vbG9naW5cIikge1xuICAgIGNvbnN0IGFkbWluU2Vzc2lvbiA9IHJlcXVlc3QuY29va2llcy5nZXQoXCJhZG1pbl9zZXNzaW9uXCIpO1xuXG4gICAgaWYgKCFhZG1pblNlc3Npb24/LnZhbHVlKSB7XG4gICAgICBjb25zdCBsb2dpblVybCA9IG5ldyBVUkwoXCIvYWRtaW4vbG9naW5cIiwgcmVxdWVzdC51cmwpO1xuICAgICAgbG9naW5Vcmwuc2VhcmNoUGFyYW1zLnNldChcImZyb21cIiwgcGF0aG5hbWUpO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5yZWRpcmVjdChsb2dpblVybCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE5leHRSZXNwb25zZS5uZXh0KCk7XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIG1hdGNoZXI6IFtcIi9hZG1pbi86cGF0aCpcIl0sXG59O1xuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByb3h5IiwicmVxdWVzdCIsInBhdGhuYW1lIiwibmV4dFVybCIsInN0YXJ0c1dpdGgiLCJhZG1pblNlc3Npb24iLCJjb29raWVzIiwiZ2V0IiwidmFsdWUiLCJsb2dpblVybCIsIlVSTCIsInVybCIsInNlYXJjaFBhcmFtcyIsInNldCIsInJlZGlyZWN0IiwibmV4dCIsImNvbmZpZyIsIm1hdGNoZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./proxy.ts\n");

/***/ }),

/***/ "../../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "../../app-render/work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "./memory-cache.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/memory-cache.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/memory-cache.external.js");

/***/ }),

/***/ "./runtime-reacts.external":
/*!**************************************************************!*\
  !*** external "next/dist/server/runtime-reacts.external.js" ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/runtime-reacts.external.js");

/***/ }),

/***/ "./shared-cache-controls.external":
/*!*******************************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/shared-cache-controls.external.js" ***!
  \*******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js");

/***/ }),

/***/ "./tags-manifest.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/tags-manifest.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/tags-manifest.external.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "next/dist/build/adapter/setup-node-env.external":
/*!******************************************************************!*\
  !*** external "next/dist/build/adapter/setup-node-env.external" ***!
  \******************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/build/adapter/setup-node-env.external");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/server/lib/router-utils/instrumentation-globals.external":
/*!*************************************************************************************!*\
  !*** external "next/dist/server/lib/router-utils/instrumentation-globals.external" ***!
  \*************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/router-utils/instrumentation-globals.external");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/@opentelemetry"], () => (__webpack_exec__("(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fimaganal%2FDocuments%2FCSCOMSFT%20copy%2Fdrap_store%2FAnti&matchers=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();