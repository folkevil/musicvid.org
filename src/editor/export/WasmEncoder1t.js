/* eslint-disable */

var WasmEncoder = (function () {
    var _scriptDir =
        typeof document !== "undefined" && document.currentScript
            ? document.currentScript.src
            : undefined;
    if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
    return function (WasmEncoder) {
        WasmEncoder = WasmEncoder || {};

        var Module = typeof WasmEncoder !== "undefined" ? WasmEncoder : {};
        var readyPromiseResolve, readyPromiseReject;
        Module["ready"] = new Promise(function (resolve, reject) {
            readyPromiseResolve = resolve;
            readyPromiseReject = reject;
        });
        var moduleOverrides = {};
        var key;
        for (key in Module) {
            if (Module.hasOwnProperty(key)) {
                moduleOverrides[key] = Module[key];
            }
        }
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = function (status, toThrow) {
            throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = false;
        var ENVIRONMENT_IS_WORKER = false;
        var ENVIRONMENT_IS_NODE = false;
        var ENVIRONMENT_IS_SHELL = false;
        ENVIRONMENT_IS_WEB = typeof window === "object";
        ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
        ENVIRONMENT_IS_NODE =
            typeof process === "object" &&
            typeof process.versions === "object" &&
            typeof process.versions.node === "string";
        ENVIRONMENT_IS_SHELL =
            !ENVIRONMENT_IS_WEB &&
            !ENVIRONMENT_IS_NODE &&
            !ENVIRONMENT_IS_WORKER;
        var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;
        if (ENVIRONMENT_IS_PTHREAD) {
            buffer = Module["buffer"];
            DYNAMIC_BASE = Module["DYNAMIC_BASE"];
            DYNAMICTOP_PTR = Module["DYNAMICTOP_PTR"];
        }
        var scriptDirectory = "";
        function locateFile(path) {
            if (Module["locateFile"]) {
                return Module["locateFile"](path, scriptDirectory);
            }
            return scriptDirectory + path;
        }
        var read_, readAsync, readBinary, setWindowTitle;
        var nodeFS;
        var nodePath;
        if (ENVIRONMENT_IS_NODE) {
            if (ENVIRONMENT_IS_WORKER) {
                scriptDirectory =
                    require("path").dirname(scriptDirectory) + "/";
            } else {
                scriptDirectory = __dirname + "/";
            }
            read_ = function shell_read(filename, binary) {
                if (!nodeFS) nodeFS = require("fs");
                if (!nodePath) nodePath = require("path");
                filename = nodePath["normalize"](filename);
                return nodeFS["readFileSync"](filename, binary ? null : "utf8");
            };
            readBinary = function readBinary(filename) {
                var ret = read_(filename, true);
                if (!ret.buffer) {
                    ret = new Uint8Array(ret);
                }
                assert(ret.buffer);
                return ret;
            };
            if (process["argv"].length > 1) {
                thisProgram = process["argv"][1].replace(/\\/g, "/");
            }
            arguments_ = process["argv"].slice(2);
            process["on"]("uncaughtException", function (ex) {
                if (!(ex instanceof ExitStatus)) {
                    throw ex;
                }
            });
            process["on"]("unhandledRejection", abort);
            quit_ = function (status) {
                process["exit"](status);
            };
            Module["inspect"] = function () {
                return "[Emscripten Module object]";
            };
            var nodeWorkerThreads;
            try {
                nodeWorkerThreads = require("worker_threads");
            } catch (e) {
                console.error(
                    'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'
                );
                throw e;
            }
            global.Worker = nodeWorkerThreads.Worker;
        } else if (ENVIRONMENT_IS_SHELL) {
            if (typeof read != "undefined") {
                read_ = function shell_read(f) {
                    return read(f);
                };
            }
            readBinary = function readBinary(f) {
                var data;
                if (typeof readbuffer === "function") {
                    return new Uint8Array(readbuffer(f));
                }
                data = read(f, "binary");
                assert(typeof data === "object");
                return data;
            };
            if (typeof scriptArgs != "undefined") {
                arguments_ = scriptArgs;
            } else if (typeof arguments != "undefined") {
                arguments_ = arguments;
            }
            if (typeof quit === "function") {
                quit_ = function (status) {
                    quit(status);
                };
            }
            if (typeof print !== "undefined") {
                if (typeof console === "undefined") console = {};
                console.log = print;
                console.warn = console.error =
                    typeof printErr !== "undefined" ? printErr : print;
            }
        } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
            if (ENVIRONMENT_IS_WORKER) {
                scriptDirectory = self.location.href;
            } else if (document.currentScript) {
                scriptDirectory = document.currentScript.src;
            }
            if (_scriptDir) {
                scriptDirectory = _scriptDir;
            }
            if (scriptDirectory.indexOf("blob:") !== 0) {
                scriptDirectory = scriptDirectory.substr(
                    0,
                    scriptDirectory.lastIndexOf("/") + 1
                );
            } else {
                scriptDirectory = "";
            }
            if (ENVIRONMENT_IS_NODE) {
                read_ = function shell_read(filename, binary) {
                    if (!nodeFS) nodeFS = require("fs");
                    if (!nodePath) nodePath = require("path");
                    filename = nodePath["normalize"](filename);
                    return nodeFS["readFileSync"](
                        filename,
                        binary ? null : "utf8"
                    );
                };
                readBinary = function readBinary(filename) {
                    var ret = read_(filename, true);
                    if (!ret.buffer) {
                        ret = new Uint8Array(ret);
                    }
                    assert(ret.buffer);
                    return ret;
                };
            } else {
                read_ = function shell_read(url) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, false);
                    xhr.send(null);
                    return xhr.responseText;
                };
                if (ENVIRONMENT_IS_WORKER) {
                    readBinary = function readBinary(url) {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", url, false);
                        xhr.responseType = "arraybuffer";
                        xhr.send(null);
                        return new Uint8Array(xhr.response);
                    };
                }
                readAsync = function readAsync(url, onload, onerror) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function xhr_onload() {
                        if (
                            xhr.status == 200 ||
                            (xhr.status == 0 && xhr.response)
                        ) {
                            onload(xhr.response);
                            return;
                        }
                        onerror();
                    };
                    xhr.onerror = onerror;
                    xhr.send(null);
                };
            }
            setWindowTitle = function (title) {
                document.title = title;
            };
        } else {
        }
        if (ENVIRONMENT_IS_NODE) {
            if (typeof performance === "undefined") {
                //global.performance = require("perf_hooks").performance;
            }
        }
        var out = Module["print"] || console.log.bind(console);
        var err = Module["printErr"] || console.warn.bind(console);
        for (key in moduleOverrides) {
            if (moduleOverrides.hasOwnProperty(key)) {
                Module[key] = moduleOverrides[key];
            }
        }
        moduleOverrides = null;
        if (Module["arguments"]) arguments_ = Module["arguments"];
        if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
        if (Module["quit"]) quit_ = Module["quit"];
        function warnOnce(text) {
            if (!warnOnce.shown) warnOnce.shown = {};
            if (!warnOnce.shown[text]) {
                warnOnce.shown[text] = 1;
                err(text);
            }
        }
        var Atomics_load = Atomics.load;
        var Atomics_store = Atomics.store;
        var Atomics_compareExchange = Atomics.compareExchange;
        var wasmBinary;
        if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
        var noExitRuntime;
        if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
        if (typeof WebAssembly !== "object") {
            err("no native wasm support detected");
        }
        var wasmMemory;
        var wasmTable = new WebAssembly.Table({
            initial: 594,
            maximum: 594 + 0,
            element: "anyfunc"
        });
        var wasmModule;
        var threadInfoStruct = 0;
        var selfThreadId = 0;
        var ABORT = false;
        var EXITSTATUS = 0;
        function assert(condition, text) {
            if (!condition) {
                abort("Assertion failed: " + text);
            }
        }
        function UTF8ArrayToString(heap, idx, maxBytesToRead) {
            var endIdx = idx + maxBytesToRead;
            var str = "";
            while (!(idx >= endIdx)) {
                var u0 = heap[idx++];
                if (!u0) return str;
                if (!(u0 & 128)) {
                    str += String.fromCharCode(u0);
                    continue;
                }
                var u1 = heap[idx++] & 63;
                if ((u0 & 224) == 192) {
                    str += String.fromCharCode(((u0 & 31) << 6) | u1);
                    continue;
                }
                var u2 = heap[idx++] & 63;
                if ((u0 & 240) == 224) {
                    u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
                } else {
                    u0 =
                        ((u0 & 7) << 18) |
                        (u1 << 12) |
                        (u2 << 6) |
                        (heap[idx++] & 63);
                }
                if (u0 < 65536) {
                    str += String.fromCharCode(u0);
                } else {
                    var ch = u0 - 65536;
                    str += String.fromCharCode(
                        55296 | (ch >> 10),
                        56320 | (ch & 1023)
                    );
                }
            }
            return str;
        }
        function UTF8ToString(ptr, maxBytesToRead) {
            return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        }
        function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
            if (!(maxBytesToWrite > 0)) return 0;
            var startIdx = outIdx;
            var endIdx = outIdx + maxBytesToWrite - 1;
            for (var i = 0; i < str.length; ++i) {
                var u = str.charCodeAt(i);
                if (u >= 55296 && u <= 57343) {
                    var u1 = str.charCodeAt(++i);
                    u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
                }
                if (u <= 127) {
                    if (outIdx >= endIdx) break;
                    heap[outIdx++] = u;
                } else if (u <= 2047) {
                    if (outIdx + 1 >= endIdx) break;
                    heap[outIdx++] = 192 | (u >> 6);
                    heap[outIdx++] = 128 | (u & 63);
                } else if (u <= 65535) {
                    if (outIdx + 2 >= endIdx) break;
                    heap[outIdx++] = 224 | (u >> 12);
                    heap[outIdx++] = 128 | ((u >> 6) & 63);
                    heap[outIdx++] = 128 | (u & 63);
                } else {
                    if (outIdx + 3 >= endIdx) break;
                    heap[outIdx++] = 240 | (u >> 18);
                    heap[outIdx++] = 128 | ((u >> 12) & 63);
                    heap[outIdx++] = 128 | ((u >> 6) & 63);
                    heap[outIdx++] = 128 | (u & 63);
                }
            }
            heap[outIdx] = 0;
            return outIdx - startIdx;
        }
        function stringToUTF8(str, outPtr, maxBytesToWrite) {
            return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        }
        function lengthBytesUTF8(str) {
            var len = 0;
            for (var i = 0; i < str.length; ++i) {
                var u = str.charCodeAt(i);
                if (u >= 55296 && u <= 57343)
                    u =
                        (65536 + ((u & 1023) << 10)) |
                        (str.charCodeAt(++i) & 1023);
                if (u <= 127) ++len;
                else if (u <= 2047) len += 2;
                else if (u <= 65535) len += 3;
                else len += 4;
            }
            return len;
        }
        function allocateUTF8(str) {
            var size = lengthBytesUTF8(str) + 1;
            var ret = _malloc(size);
            if (ret) stringToUTF8Array(str, HEAP8, ret, size);
            return ret;
        }
        function writeAsciiToMemory(str, buffer, dontAddNull) {
            for (var i = 0; i < str.length; ++i) {
                HEAP8[buffer++ >> 0] = str.charCodeAt(i);
            }
            if (!dontAddNull) HEAP8[buffer >> 0] = 0;
        }
        var WASM_PAGE_SIZE = 65536;
        var buffer,
            HEAP8,
            HEAPU8,
            HEAP16,
            HEAPU16,
            HEAP32,
            HEAPU32,
            HEAPF32,
            HEAPF64;
        function updateGlobalBufferAndViews(buf) {
            buffer = buf;
            Module["HEAP8"] = HEAP8 = new Int8Array(buf);
            Module["HEAP16"] = HEAP16 = new Int16Array(buf);
            Module["HEAP32"] = HEAP32 = new Int32Array(buf);
            Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
            Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
            Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
            Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
            Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
        }
        var STACK_BASE = 6576800,
            STACKTOP = STACK_BASE,
            STACK_MAX = 1333920,
            DYNAMIC_BASE = 6576800,
            DYNAMICTOP_PTR = 1332992;
        if (ENVIRONMENT_IS_PTHREAD) {
        }
        var INITIAL_INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 2097152e3;
        if (ENVIRONMENT_IS_PTHREAD) {
            wasmMemory = Module["wasmMemory"];
            buffer = Module["buffer"];
        } else {
            if (Module["wasmMemory"]) {
                wasmMemory = Module["wasmMemory"];
            } else {
                wasmMemory = new WebAssembly.Memory({
                    initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
                    maximum: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
                    shared: true
                });
                if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
                    err(
                        "requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"
                    );
                    if (ENVIRONMENT_IS_NODE) {
                        console.log(
                            "(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)"
                        );
                    }
                    throw Error("bad memory");
                }
            }
        }
        if (wasmMemory) {
            buffer = wasmMemory.buffer;
        }
        INITIAL_INITIAL_MEMORY = buffer.byteLength;
        updateGlobalBufferAndViews(buffer);
        if (!ENVIRONMENT_IS_PTHREAD) {
            HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
        }
        function callRuntimeCallbacks(callbacks) {
            while (callbacks.length > 0) {
                var callback = callbacks.shift();
                if (typeof callback == "function") {
                    callback(Module);
                    continue;
                }
                var func = callback.func;
                if (typeof func === "number") {
                    if (callback.arg === undefined) {
                        Module["dynCall_v"](func);
                    } else {
                        Module["dynCall_vi"](func, callback.arg);
                    }
                } else {
                    func(callback.arg === undefined ? null : callback.arg);
                }
            }
        }
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATMAIN__ = [];
        var __ATEXIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        var runtimeExited = false;
        if (ENVIRONMENT_IS_PTHREAD) runtimeInitialized = true;
        function preRun() {
            if (ENVIRONMENT_IS_PTHREAD) return;
            if (Module["preRun"]) {
                if (typeof Module["preRun"] == "function")
                    Module["preRun"] = [Module["preRun"]];
                while (Module["preRun"].length) {
                    addOnPreRun(Module["preRun"].shift());
                }
            }
            callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
            runtimeInitialized = true;
            if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
            TTY.init();
            callRuntimeCallbacks(__ATINIT__);
        }
        function preMain() {
            if (ENVIRONMENT_IS_PTHREAD) return;
            FS.ignorePermissions = false;
            callRuntimeCallbacks(__ATMAIN__);
        }
        function exitRuntime() {
            if (ENVIRONMENT_IS_PTHREAD) return;
            runtimeExited = true;
        }
        function postRun() {
            if (ENVIRONMENT_IS_PTHREAD) return;
            if (Module["postRun"]) {
                if (typeof Module["postRun"] == "function")
                    Module["postRun"] = [Module["postRun"]];
                while (Module["postRun"].length) {
                    addOnPostRun(Module["postRun"].shift());
                }
            }
            callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
            __ATPRERUN__.unshift(cb);
        }
        function addOnPostRun(cb) {
            __ATPOSTRUN__.unshift(cb);
        }
        var Math_abs = Math.abs;
        var Math_ceil = Math.ceil;
        var Math_floor = Math.floor;
        var Math_min = Math.min;
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function getUniqueRunDependency(id) {
            return id;
        }
        function addRunDependency(id) {
            assert(
                !ENVIRONMENT_IS_PTHREAD,
                "addRunDependency cannot be used in a pthread worker"
            );
            runDependencies++;
            if (Module["monitorRunDependencies"]) {
                Module["monitorRunDependencies"](runDependencies);
            }
        }
        function removeRunDependency(id) {
            runDependencies--;
            if (Module["monitorRunDependencies"]) {
                Module["monitorRunDependencies"](runDependencies);
            }
            if (runDependencies == 0) {
                if (runDependencyWatcher !== null) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                }
                if (dependenciesFulfilled) {
                    var callback = dependenciesFulfilled;
                    dependenciesFulfilled = null;
                    callback();
                }
            }
        }
        Module["preloadedImages"] = {};
        Module["preloadedAudios"] = {};
        function abort(what) {
            if (Module["onAbort"]) {
                Module["onAbort"](what);
            }
            if (ENVIRONMENT_IS_PTHREAD)
                console.error("Pthread aborting at " + new Error().stack);
            what += "";
            out(what);
            err(what);
            ABORT = true;
            EXITSTATUS = 1;
            what =
                "abort(" +
                what +
                "). Build with -s ASSERTIONS=1 for more info.";
            throw new WebAssembly.RuntimeError(what);
        }
        function hasPrefix(str, prefix) {
            return String.prototype.startsWith
                ? str.startsWith(prefix)
                : str.indexOf(prefix) === 0;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        function isDataURI(filename) {
            return hasPrefix(filename, dataURIPrefix);
        }
        var fileURIPrefix = "file://";
        function isFileURI(filename) {
            return hasPrefix(filename, fileURIPrefix);
        }
        var wasmBinaryFile = "workers/WasmEncoder1t.wasm";
        //if (!isDataURI(wasmBinaryFile)) {
        //wasmBinaryFile = locateFile(wasmBinaryFile);
        //}
        function getBinary() {
            try {
                if (wasmBinary) {
                    return new Uint8Array(wasmBinary);
                }
                if (readBinary) {
                    return readBinary(wasmBinaryFile);
                } else {
                    throw "both async and sync fetching of the wasm failed";
                }
            } catch (err) {
                abort(err);
            }
        }
        function getBinaryPromise() {
            if (
                !wasmBinary &&
                (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
                typeof fetch === "function" &&
                !isFileURI(wasmBinaryFile)
            ) {
                return fetch(wasmBinaryFile, { credentials: "same-origin" })
                    .then(function (response) {
                        if (!response["ok"]) {
                            throw (
                                "failed to load wasm binary file at '" +
                                wasmBinaryFile +
                                "'"
                            );
                        }
                        return response["arrayBuffer"]();
                    })
                    .catch(function () {
                        return getBinary();
                    });
            }
            return new Promise(function (resolve, reject) {
                resolve(getBinary());
            });
        }
        function createWasm() {
            var info = { a: asmLibraryArg };
            function receiveInstance(instance, module) {
                var exports = instance.exports;
                Module["asm"] = exports;
                wasmModule = module;
                if (!ENVIRONMENT_IS_PTHREAD) {
                    removeRunDependency("wasm-instantiate");
                }
            }
            if (!ENVIRONMENT_IS_PTHREAD) {
                addRunDependency("wasm-instantiate");
            }
            function receiveInstantiatedSource(output) {
                receiveInstance(output["instance"], output["module"]);
            }
            function instantiateArrayBuffer(receiver) {
                return getBinaryPromise()
                    .then(function (binary) {
                        return WebAssembly.instantiate(binary, info);
                    })
                    .then(receiver, function (reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason);
                    });
            }
            function instantiateAsync() {
                if (
                    !wasmBinary &&
                    typeof WebAssembly.instantiateStreaming === "function" &&
                    !isDataURI(wasmBinaryFile) &&
                    !isFileURI(wasmBinaryFile) &&
                    typeof fetch === "function"
                ) {
                    fetch(wasmBinaryFile, { credentials: "same-origin" }).then(
                        function (response) {
                            var result = WebAssembly.instantiateStreaming(
                                response,
                                info
                            );
                            return result.then(
                                receiveInstantiatedSource,
                                function (reason) {
                                    err(
                                        "wasm streaming compile failed: " +
                                            reason
                                    );
                                    err(
                                        "falling back to ArrayBuffer instantiation"
                                    );
                                    instantiateArrayBuffer(
                                        receiveInstantiatedSource
                                    );
                                }
                            );
                        }
                    );
                } else {
                    return instantiateArrayBuffer(receiveInstantiatedSource);
                }
            }
            if (Module["instantiateWasm"]) {
                try {
                    var exports = Module["instantiateWasm"](
                        info,
                        receiveInstance
                    );
                    return exports;
                } catch (e) {
                    err(
                        "Module.instantiateWasm callback failed with error: " +
                            e
                    );
                    return false;
                }
            }
            instantiateAsync();
            return {};
        }
        var tempDouble;
        var tempI64;
        var ASM_CONSTS = {
            228872: function () {
                throw "Canceled!";
            },
            229092: function ($0, $1) {
                setTimeout(function () {
                    _do_emscripten_dispatch_to_thread($0, $1);
                }, 0);
            }
        };
        function _emscripten_asm_const_iii(code, sigPtr, argbuf) {
            var args = readAsmConstArgs(sigPtr, argbuf);
            return ASM_CONSTS[code].apply(null, args);
        }
        function initPthreadsJS() {
            PThread.initRuntime();
        }
        if (!ENVIRONMENT_IS_PTHREAD)
            __ATINIT__.push({
                func: function () {
                    ___wasm_call_ctors();
                }
            });
        function demangle(func) {
            return func;
        }
        function demangleAll(text) {
            var regex = /\b_Z[\w\d_]+/g;
            return text.replace(regex, function (x) {
                var y = demangle(x);
                return x === y ? x : y + " [" + x + "]";
            });
        }
        var __pthread_ptr = 0;
        var __pthread_is_main_runtime_thread = 0;
        var __pthread_is_main_browser_thread = 0;
        function registerPthreadPtr(
            pthreadPtr,
            isMainBrowserThread,
            isMainRuntimeThread
        ) {
            pthreadPtr = pthreadPtr | 0;
            isMainBrowserThread = isMainBrowserThread | 0;
            isMainRuntimeThread = isMainRuntimeThread | 0;
            __pthread_ptr = pthreadPtr;
            __pthread_is_main_browser_thread = isMainBrowserThread;
            __pthread_is_main_runtime_thread = isMainRuntimeThread;
        }
        Module["registerPthreadPtr"] = registerPthreadPtr;
        var ERRNO_CODES = {
            EPERM: 63,
            ENOENT: 44,
            ESRCH: 71,
            EINTR: 27,
            EIO: 29,
            ENXIO: 60,
            E2BIG: 1,
            ENOEXEC: 45,
            EBADF: 8,
            ECHILD: 12,
            EAGAIN: 6,
            EWOULDBLOCK: 6,
            ENOMEM: 48,
            EACCES: 2,
            EFAULT: 21,
            ENOTBLK: 105,
            EBUSY: 10,
            EEXIST: 20,
            EXDEV: 75,
            ENODEV: 43,
            ENOTDIR: 54,
            EISDIR: 31,
            EINVAL: 28,
            ENFILE: 41,
            EMFILE: 33,
            ENOTTY: 59,
            ETXTBSY: 74,
            EFBIG: 22,
            ENOSPC: 51,
            ESPIPE: 70,
            EROFS: 69,
            EMLINK: 34,
            EPIPE: 64,
            EDOM: 18,
            ERANGE: 68,
            ENOMSG: 49,
            EIDRM: 24,
            ECHRNG: 106,
            EL2NSYNC: 156,
            EL3HLT: 107,
            EL3RST: 108,
            ELNRNG: 109,
            EUNATCH: 110,
            ENOCSI: 111,
            EL2HLT: 112,
            EDEADLK: 16,
            ENOLCK: 46,
            EBADE: 113,
            EBADR: 114,
            EXFULL: 115,
            ENOANO: 104,
            EBADRQC: 103,
            EBADSLT: 102,
            EDEADLOCK: 16,
            EBFONT: 101,
            ENOSTR: 100,
            ENODATA: 116,
            ETIME: 117,
            ENOSR: 118,
            ENONET: 119,
            ENOPKG: 120,
            EREMOTE: 121,
            ENOLINK: 47,
            EADV: 122,
            ESRMNT: 123,
            ECOMM: 124,
            EPROTO: 65,
            EMULTIHOP: 36,
            EDOTDOT: 125,
            EBADMSG: 9,
            ENOTUNIQ: 126,
            EBADFD: 127,
            EREMCHG: 128,
            ELIBACC: 129,
            ELIBBAD: 130,
            ELIBSCN: 131,
            ELIBMAX: 132,
            ELIBEXEC: 133,
            ENOSYS: 52,
            ENOTEMPTY: 55,
            ENAMETOOLONG: 37,
            ELOOP: 32,
            EOPNOTSUPP: 138,
            EPFNOSUPPORT: 139,
            ECONNRESET: 15,
            ENOBUFS: 42,
            EAFNOSUPPORT: 5,
            EPROTOTYPE: 67,
            ENOTSOCK: 57,
            ENOPROTOOPT: 50,
            ESHUTDOWN: 140,
            ECONNREFUSED: 14,
            EADDRINUSE: 3,
            ECONNABORTED: 13,
            ENETUNREACH: 40,
            ENETDOWN: 38,
            ETIMEDOUT: 73,
            EHOSTDOWN: 142,
            EHOSTUNREACH: 23,
            EINPROGRESS: 26,
            EALREADY: 7,
            EDESTADDRREQ: 17,
            EMSGSIZE: 35,
            EPROTONOSUPPORT: 66,
            ESOCKTNOSUPPORT: 137,
            EADDRNOTAVAIL: 4,
            ENETRESET: 39,
            EISCONN: 30,
            ENOTCONN: 53,
            ETOOMANYREFS: 141,
            EUSERS: 136,
            EDQUOT: 19,
            ESTALE: 72,
            ENOTSUP: 138,
            ENOMEDIUM: 148,
            EILSEQ: 25,
            EOVERFLOW: 61,
            ECANCELED: 11,
            ENOTRECOVERABLE: 56,
            EOWNERDEAD: 62,
            ESTRPIPE: 135
        };
        var __main_thread_futex_wait_address = 1333904;
        function _emscripten_futex_wake(addr, count) {
            if (
                addr <= 0 ||
                addr > HEAP8.length ||
                addr & (3 != 0) ||
                count < 0
            )
                return -28;
            if (count == 0) return 0;
            if (count >= 2147483647) count = Infinity;
            var mainThreadWaitAddress = Atomics.load(
                HEAP32,
                __main_thread_futex_wait_address >> 2
            );
            var mainThreadWoken = 0;
            if (mainThreadWaitAddress == addr) {
                var loadedAddr = Atomics.compareExchange(
                    HEAP32,
                    __main_thread_futex_wait_address >> 2,
                    mainThreadWaitAddress,
                    0
                );
                if (loadedAddr == mainThreadWaitAddress) {
                    --count;
                    mainThreadWoken = 1;
                    if (count <= 0) return 1;
                }
            }
            var ret = Atomics.notify(HEAP32, addr >> 2, count);
            if (ret >= 0) return ret + mainThreadWoken;
            throw "Atomics.notify returned an unexpected value " + ret;
        }
        Module["_emscripten_futex_wake"] = _emscripten_futex_wake;
        function killThread(pthread_ptr) {
            if (ENVIRONMENT_IS_PTHREAD)
                throw "Internal Error! killThread() can only ever be called from main application thread!";
            if (!pthread_ptr)
                throw "Internal Error! Null pthread_ptr in killThread!";
            HEAP32[(pthread_ptr + 12) >> 2] = 0;
            var pthread = PThread.pthreads[pthread_ptr];
            pthread.worker.terminate();
            PThread.freeThreadData(pthread);
            PThread.runningWorkers.splice(
                PThread.runningWorkers.indexOf(pthread.worker),
                1
            );
            pthread.worker.pthread = undefined;
        }
        function cancelThread(pthread_ptr) {
            if (ENVIRONMENT_IS_PTHREAD)
                throw "Internal Error! cancelThread() can only ever be called from main application thread!";
            if (!pthread_ptr)
                throw "Internal Error! Null pthread_ptr in cancelThread!";
            var pthread = PThread.pthreads[pthread_ptr];
            pthread.worker.postMessage({ cmd: "cancel" });
        }
        function cleanupThread(pthread_ptr) {
            if (ENVIRONMENT_IS_PTHREAD)
                throw "Internal Error! cleanupThread() can only ever be called from main application thread!";
            if (!pthread_ptr)
                throw "Internal Error! Null pthread_ptr in cleanupThread!";
            HEAP32[(pthread_ptr + 12) >> 2] = 0;
            var pthread = PThread.pthreads[pthread_ptr];
            if (pthread) {
                var worker = pthread.worker;
                PThread.returnWorkerToPool(worker);
            }
        }
        var PThread = {
            MAIN_THREAD_ID: 1,
            mainThreadInfo: { schedPolicy: 0, schedPrio: 0 },
            unusedWorkers: [],
            runningWorkers: [],
            initRuntime: function () {
                registerPthreadPtr(
                    PThread.mainThreadBlock,
                    !ENVIRONMENT_IS_WORKER,
                    1
                );
                _emscripten_register_main_browser_thread_id(
                    PThread.mainThreadBlock
                );
            },
            initMainThreadBlock: function () {
                PThread.mainThreadBlock = 1333152;
                for (var i = 0; i < 232 / 4; ++i)
                    HEAPU32[PThread.mainThreadBlock / 4 + i] = 0;
                HEAP32[(PThread.mainThreadBlock + 12) >> 2] =
                    PThread.mainThreadBlock;
                var headPtr = PThread.mainThreadBlock + 156;
                HEAP32[headPtr >> 2] = headPtr;
                var tlsMemory = 1333392;
                for (var i = 0; i < 128; ++i) HEAPU32[tlsMemory / 4 + i] = 0;
                Atomics.store(
                    HEAPU32,
                    (PThread.mainThreadBlock + 104) >> 2,
                    tlsMemory
                );
                Atomics.store(
                    HEAPU32,
                    (PThread.mainThreadBlock + 40) >> 2,
                    PThread.mainThreadBlock
                );
                Atomics.store(HEAPU32, (PThread.mainThreadBlock + 44) >> 2, 42);
            },
            initWorker: function () {},
            pthreads: {},
            exitHandlers: null,
            setThreadStatus: function () {},
            runExitHandlers: function () {
                if (PThread.exitHandlers !== null) {
                    while (PThread.exitHandlers.length > 0) {
                        PThread.exitHandlers.pop()();
                    }
                    PThread.exitHandlers = null;
                }
                if (ENVIRONMENT_IS_PTHREAD && threadInfoStruct)
                    ___pthread_tsd_run_dtors();
            },
            threadExit: function (exitCode) {
                var tb = _pthread_self();
                if (tb) {
                    Atomics.store(HEAPU32, (tb + 4) >> 2, exitCode);
                    Atomics.store(HEAPU32, (tb + 0) >> 2, 1);
                    Atomics.store(HEAPU32, (tb + 60) >> 2, 1);
                    Atomics.store(HEAPU32, (tb + 64) >> 2, 0);
                    PThread.runExitHandlers();
                    _emscripten_futex_wake(tb + 0, 2147483647);
                    registerPthreadPtr(0, 0, 0);
                    threadInfoStruct = 0;
                    if (ENVIRONMENT_IS_PTHREAD) {
                        postMessage({ cmd: "exit" });
                    }
                }
            },
            threadCancel: function () {
                PThread.runExitHandlers();
                Atomics.store(HEAPU32, (threadInfoStruct + 4) >> 2, -1);
                Atomics.store(HEAPU32, (threadInfoStruct + 0) >> 2, 1);
                _emscripten_futex_wake(threadInfoStruct + 0, 2147483647);
                threadInfoStruct = selfThreadId = 0;
                registerPthreadPtr(0, 0, 0);
                postMessage({ cmd: "cancelDone" });
            },
            terminateAllThreads: function () {
                for (var t in PThread.pthreads) {
                    var pthread = PThread.pthreads[t];
                    if (pthread && pthread.worker) {
                        PThread.returnWorkerToPool(pthread.worker);
                    }
                }
                PThread.pthreads = {};
                for (var i = 0; i < PThread.unusedWorkers.length; ++i) {
                    var worker = PThread.unusedWorkers[i];
                    worker.terminate();
                }
                PThread.unusedWorkers = [];
                for (var i = 0; i < PThread.runningWorkers.length; ++i) {
                    var worker = PThread.runningWorkers[i];
                    var pthread = worker.pthread;
                    PThread.freeThreadData(pthread);
                    worker.terminate();
                }
                PThread.runningWorkers = [];
            },
            freeThreadData: function (pthread) {
                if (!pthread) return;
                if (pthread.threadInfoStruct) {
                    var tlsMemory =
                        HEAP32[(pthread.threadInfoStruct + 104) >> 2];
                    HEAP32[(pthread.threadInfoStruct + 104) >> 2] = 0;
                    _free(tlsMemory);
                    _free(pthread.threadInfoStruct);
                }
                pthread.threadInfoStruct = 0;
                if (pthread.allocatedOwnStack && pthread.stackBase)
                    _free(pthread.stackBase);
                pthread.stackBase = 0;
                if (pthread.worker) pthread.worker.pthread = null;
            },
            returnWorkerToPool: function (worker) {
                delete PThread.pthreads[worker.pthread.thread];
                PThread.unusedWorkers.push(worker);
                PThread.runningWorkers.splice(
                    PThread.runningWorkers.indexOf(worker),
                    1
                );
                PThread.freeThreadData(worker.pthread);
                worker.pthread = undefined;
            },
            receiveObjectTransfer: function (data) {},
            loadWasmModuleToWorker: function (worker, onFinishedLoading) {
                worker.onmessage = function (e) {
                    var d = e["data"];
                    var cmd = d["cmd"];
                    if (worker.pthread)
                        PThread.currentProxiedOperationCallerThread =
                            worker.pthread.threadInfoStruct;
                    if (
                        d["targetThread"] &&
                        d["targetThread"] != _pthread_self()
                    ) {
                        var thread = PThread.pthreads[d.targetThread];
                        if (thread) {
                            thread.worker.postMessage(
                                e.data,
                                d["transferList"]
                            );
                        } else {
                            console.error(
                                'Internal error! Worker sent a message "' +
                                    cmd +
                                    '" to target pthread ' +
                                    d["targetThread"] +
                                    ", but that thread no longer exists!"
                            );
                        }
                        PThread.currentProxiedOperationCallerThread = undefined;
                        return;
                    }
                    if (cmd === "processQueuedMainThreadWork") {
                        _emscripten_main_thread_process_queued_calls();
                    } else if (cmd === "spawnThread") {
                        spawnThread(e.data);
                    } else if (cmd === "cleanupThread") {
                        cleanupThread(d["thread"]);
                    } else if (cmd === "killThread") {
                        killThread(d["thread"]);
                    } else if (cmd === "cancelThread") {
                        cancelThread(d["thread"]);
                    } else if (cmd === "loaded") {
                        worker.loaded = true;
                        if (onFinishedLoading) onFinishedLoading(worker);
                        if (worker.runPthread) {
                            worker.runPthread();
                            delete worker.runPthread;
                        }
                    } else if (cmd === "print") {
                        out("Thread " + d["threadId"] + ": " + d["text"]);
                    } else if (cmd === "printErr") {
                        err("Thread " + d["threadId"] + ": " + d["text"]);
                    } else if (cmd === "alert") {
                        alert("Thread " + d["threadId"] + ": " + d["text"]);
                    } else if (cmd === "exit") {
                        var detached =
                            worker.pthread &&
                            Atomics.load(
                                HEAPU32,
                                (worker.pthread.thread + 68) >> 2
                            );
                        if (detached) {
                            PThread.returnWorkerToPool(worker);
                        }
                    } else if (cmd === "cancelDone") {
                        PThread.returnWorkerToPool(worker);
                    } else if (cmd === "objectTransfer") {
                        PThread.receiveObjectTransfer(e.data);
                    } else if (e.data.target === "setimmediate") {
                        worker.postMessage(e.data);
                    } else {
                        err("worker sent an unknown command " + cmd);
                    }
                    PThread.currentProxiedOperationCallerThread = undefined;
                };
                worker.onerror = function (e) {
                    err(
                        "pthread sent an error! " +
                            e.filename +
                            ":" +
                            e.lineno +
                            ": " +
                            e.message
                    );
                };
                if (ENVIRONMENT_IS_NODE) {
                    worker.on("message", function (data) {
                        worker.onmessage({ data: data });
                    });
                    worker.on("error", function (data) {
                        worker.onerror(data);
                    });
                    worker.on("exit", function (data) {
                        console.log(
                            "worker exited - TODO: update the worker queue?"
                        );
                    });
                }
                worker.postMessage({
                    cmd: "load",
                    urlOrBlob: Module["mainScriptUrlOrBlob"] || _scriptDir,
                    wasmMemory: wasmMemory,
                    wasmModule: wasmModule,
                    DYNAMIC_BASE: DYNAMIC_BASE,
                    DYNAMICTOP_PTR: DYNAMICTOP_PTR
                });
            },
            allocateUnusedWorker: function () {
                var pthreadMainJs = locateFile("WasmEncoder1t.worker.js");
                PThread.unusedWorkers.push(new Worker(pthreadMainJs));
            },
            getNewWorker: function () {
                if (PThread.unusedWorkers.length == 0) {
                    PThread.allocateUnusedWorker();
                    PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
                }
                if (PThread.unusedWorkers.length > 0)
                    return PThread.unusedWorkers.pop();
                else return null;
            },
            busySpinWait: function (msecs) {
                var t = performance.now() + msecs;
                while (performance.now() < t) {}
            }
        };
        function establishStackSpace(stackTop, stackMax) {
            STACK_BASE = STACKTOP = stackTop;
            STACK_MAX = stackMax;
            stackRestore(stackTop);
        }
        Module["establishStackSpace"] = establishStackSpace;
        function getNoExitRuntime() {
            return noExitRuntime;
        }
        Module["getNoExitRuntime"] = getNoExitRuntime;
        function jsStackTrace() {
            var err = new Error();
            if (!err.stack) {
                try {
                    throw new Error();
                } catch (e) {
                    err = e;
                }
                if (!err.stack) {
                    return "(no stack trace available)";
                }
            }
            return err.stack.toString();
        }
        function stackTrace() {
            var js = jsStackTrace();
            if (Module["extraStackTrace"])
                js += "\n" + Module["extraStackTrace"]();
            return demangleAll(js);
        }
        function ___assert_fail(condition, filename, line, func) {
            abort(
                "Assertion failed: " +
                    UTF8ToString(condition) +
                    ", at: " +
                    [
                        filename ? UTF8ToString(filename) : "unknown filename",
                        line,
                        func ? UTF8ToString(func) : "unknown function"
                    ]
            );
        }
        var _emscripten_get_now;
        if (ENVIRONMENT_IS_NODE) {
            _emscripten_get_now = function () {
                var t = process["hrtime"]();
                return t[0] * 1e3 + t[1] / 1e6;
            };
        } else if (ENVIRONMENT_IS_PTHREAD) {
            _emscripten_get_now = function () {
                return (
                    performance.now() - Module["__performance_now_clock_drift"]
                );
            };
        } else if (typeof dateNow !== "undefined") {
            _emscripten_get_now = dateNow;
        } else
            _emscripten_get_now = function () {
                return performance.now();
            };
        var _emscripten_get_now_is_monotonic = true;
        function setErrNo(value) {
            HEAP32[___errno_location() >> 2] = value;
            return value;
        }
        function _clock_gettime(clk_id, tp) {
            var now;
            if (clk_id === 0) {
                now = Date.now();
            } else if (
                (clk_id === 1 || clk_id === 4) &&
                _emscripten_get_now_is_monotonic
            ) {
                now = _emscripten_get_now();
            } else {
                setErrNo(28);
                return -1;
            }
            HEAP32[tp >> 2] = (now / 1e3) | 0;
            HEAP32[(tp + 4) >> 2] = ((now % 1e3) * 1e3 * 1e3) | 0;
            return 0;
        }
        var PATH = {
            splitPath: function (filename) {
                var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                return splitPathRe.exec(filename).slice(1);
            },
            normalizeArray: function (parts, allowAboveRoot) {
                var up = 0;
                for (var i = parts.length - 1; i >= 0; i--) {
                    var last = parts[i];
                    if (last === ".") {
                        parts.splice(i, 1);
                    } else if (last === "..") {
                        parts.splice(i, 1);
                        up++;
                    } else if (up) {
                        parts.splice(i, 1);
                        up--;
                    }
                }
                if (allowAboveRoot) {
                    for (; up; up--) {
                        parts.unshift("..");
                    }
                }
                return parts;
            },
            normalize: function (path) {
                var isAbsolute = path.charAt(0) === "/",
                    trailingSlash = path.substr(-1) === "/";
                path = PATH.normalizeArray(
                    path.split("/").filter(function (p) {
                        return !!p;
                    }),
                    !isAbsolute
                ).join("/");
                if (!path && !isAbsolute) {
                    path = ".";
                }
                if (path && trailingSlash) {
                    path += "/";
                }
                return (isAbsolute ? "/" : "") + path;
            },
            dirname: function (path) {
                var result = PATH.splitPath(path),
                    root = result[0],
                    dir = result[1];
                if (!root && !dir) {
                    return ".";
                }
                if (dir) {
                    dir = dir.substr(0, dir.length - 1);
                }
                return root + dir;
            },
            basename: function (path) {
                if (path === "/") return "/";
                var lastSlash = path.lastIndexOf("/");
                if (lastSlash === -1) return path;
                return path.substr(lastSlash + 1);
            },
            extname: function (path) {
                return PATH.splitPath(path)[3];
            },
            join: function () {
                var paths = Array.prototype.slice.call(arguments, 0);
                return PATH.normalize(paths.join("/"));
            },
            join2: function (l, r) {
                return PATH.normalize(l + "/" + r);
            }
        };
        var PATH_FS = {
            resolve: function () {
                var resolvedPath = "",
                    resolvedAbsolute = false;
                for (
                    var i = arguments.length - 1;
                    i >= -1 && !resolvedAbsolute;
                    i--
                ) {
                    var path = i >= 0 ? arguments[i] : FS.cwd();
                    if (typeof path !== "string") {
                        throw new TypeError(
                            "Arguments to path.resolve must be strings"
                        );
                    } else if (!path) {
                        return "";
                    }
                    resolvedPath = path + "/" + resolvedPath;
                    resolvedAbsolute = path.charAt(0) === "/";
                }
                resolvedPath = PATH.normalizeArray(
                    resolvedPath.split("/").filter(function (p) {
                        return !!p;
                    }),
                    !resolvedAbsolute
                ).join("/");
                return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
            },
            relative: function (from, to) {
                from = PATH_FS.resolve(from).substr(1);
                to = PATH_FS.resolve(to).substr(1);
                function trim(arr) {
                    var start = 0;
                    for (; start < arr.length; start++) {
                        if (arr[start] !== "") break;
                    }
                    var end = arr.length - 1;
                    for (; end >= 0; end--) {
                        if (arr[end] !== "") break;
                    }
                    if (start > end) return [];
                    return arr.slice(start, end - start + 1);
                }
                var fromParts = trim(from.split("/"));
                var toParts = trim(to.split("/"));
                var length = Math.min(fromParts.length, toParts.length);
                var samePartsLength = length;
                for (var i = 0; i < length; i++) {
                    if (fromParts[i] !== toParts[i]) {
                        samePartsLength = i;
                        break;
                    }
                }
                var outputParts = [];
                for (var i = samePartsLength; i < fromParts.length; i++) {
                    outputParts.push("..");
                }
                outputParts = outputParts.concat(
                    toParts.slice(samePartsLength)
                );
                return outputParts.join("/");
            }
        };
        var TTY = {
            ttys: [],
            init: function () {},
            shutdown: function () {},
            register: function (dev, ops) {
                TTY.ttys[dev] = { input: [], output: [], ops: ops };
                FS.registerDevice(dev, TTY.stream_ops);
            },
            stream_ops: {
                open: function (stream) {
                    var tty = TTY.ttys[stream.node.rdev];
                    if (!tty) {
                        throw new FS.ErrnoError(43);
                    }
                    stream.tty = tty;
                    stream.seekable = false;
                },
                close: function (stream) {
                    stream.tty.ops.flush(stream.tty);
                },
                flush: function (stream) {
                    stream.tty.ops.flush(stream.tty);
                },
                read: function (stream, buffer, offset, length, pos) {
                    if (!stream.tty || !stream.tty.ops.get_char) {
                        throw new FS.ErrnoError(60);
                    }
                    var bytesRead = 0;
                    for (var i = 0; i < length; i++) {
                        var result;
                        try {
                            result = stream.tty.ops.get_char(stream.tty);
                        } catch (e) {
                            throw new FS.ErrnoError(29);
                        }
                        if (result === undefined && bytesRead === 0) {
                            throw new FS.ErrnoError(6);
                        }
                        if (result === null || result === undefined) break;
                        bytesRead++;
                        buffer[offset + i] = result;
                    }
                    if (bytesRead) {
                        stream.node.timestamp = Date.now();
                    }
                    return bytesRead;
                },
                write: function (stream, buffer, offset, length, pos) {
                    if (!stream.tty || !stream.tty.ops.put_char) {
                        throw new FS.ErrnoError(60);
                    }
                    try {
                        for (var i = 0; i < length; i++) {
                            stream.tty.ops.put_char(
                                stream.tty,
                                buffer[offset + i]
                            );
                        }
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                    if (length) {
                        stream.node.timestamp = Date.now();
                    }
                    return i;
                }
            },
            default_tty_ops: {
                get_char: function (tty) {
                    if (!tty.input.length) {
                        var result = null;
                        if (ENVIRONMENT_IS_NODE) {
                            var BUFSIZE = 256;
                            var buf = Buffer.alloc
                                ? Buffer.alloc(BUFSIZE)
                                : new Buffer(BUFSIZE);
                            var bytesRead = 0;
                            try {
                                bytesRead = nodeFS.readSync(
                                    process.stdin.fd,
                                    buf,
                                    0,
                                    BUFSIZE,
                                    null
                                );
                            } catch (e) {
                                if (e.toString().indexOf("EOF") != -1)
                                    bytesRead = 0;
                                else throw e;
                            }
                            if (bytesRead > 0) {
                                result = buf
                                    .slice(0, bytesRead)
                                    .toString("utf-8");
                            } else {
                                result = null;
                            }
                        } else if (
                            typeof window != "undefined" &&
                            typeof window.prompt == "function"
                        ) {
                            result = window.prompt("Input: ");
                            if (result !== null) {
                                result += "\n";
                            }
                        } else if (typeof readline == "function") {
                            result = readline();
                            if (result !== null) {
                                result += "\n";
                            }
                        }
                        if (!result) {
                            return null;
                        }
                        tty.input = intArrayFromString(result, true);
                    }
                    return tty.input.shift();
                },
                put_char: function (tty, val) {
                    if (val === null || val === 10) {
                        out(UTF8ArrayToString(tty.output, 0));
                        tty.output = [];
                    } else {
                        if (val != 0) tty.output.push(val);
                    }
                },
                flush: function (tty) {
                    if (tty.output && tty.output.length > 0) {
                        out(UTF8ArrayToString(tty.output, 0));
                        tty.output = [];
                    }
                }
            },
            default_tty1_ops: {
                put_char: function (tty, val) {
                    if (val === null || val === 10) {
                        err(UTF8ArrayToString(tty.output, 0));
                        tty.output = [];
                    } else {
                        if (val != 0) tty.output.push(val);
                    }
                },
                flush: function (tty) {
                    if (tty.output && tty.output.length > 0) {
                        err(UTF8ArrayToString(tty.output, 0));
                        tty.output = [];
                    }
                }
            }
        };
        var MEMFS = {
            ops_table: null,
            mount: function (mount) {
                return MEMFS.createNode(null, "/", 16384 | 511, 0);
            },
            createNode: function (parent, name, mode, dev) {
                if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                    throw new FS.ErrnoError(63);
                }
                if (!MEMFS.ops_table) {
                    MEMFS.ops_table = {
                        dir: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr,
                                lookup: MEMFS.node_ops.lookup,
                                mknod: MEMFS.node_ops.mknod,
                                rename: MEMFS.node_ops.rename,
                                unlink: MEMFS.node_ops.unlink,
                                rmdir: MEMFS.node_ops.rmdir,
                                readdir: MEMFS.node_ops.readdir,
                                symlink: MEMFS.node_ops.symlink
                            },
                            stream: { llseek: MEMFS.stream_ops.llseek }
                        },
                        file: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr
                            },
                            stream: {
                                llseek: MEMFS.stream_ops.llseek,
                                read: MEMFS.stream_ops.read,
                                write: MEMFS.stream_ops.write,
                                allocate: MEMFS.stream_ops.allocate,
                                mmap: MEMFS.stream_ops.mmap,
                                msync: MEMFS.stream_ops.msync
                            }
                        },
                        link: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr,
                                readlink: MEMFS.node_ops.readlink
                            },
                            stream: {}
                        },
                        chrdev: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr
                            },
                            stream: FS.chrdev_stream_ops
                        }
                    };
                }
                var node = FS.createNode(parent, name, mode, dev);
                if (FS.isDir(node.mode)) {
                    node.node_ops = MEMFS.ops_table.dir.node;
                    node.stream_ops = MEMFS.ops_table.dir.stream;
                    node.contents = {};
                } else if (FS.isFile(node.mode)) {
                    node.node_ops = MEMFS.ops_table.file.node;
                    node.stream_ops = MEMFS.ops_table.file.stream;
                    node.usedBytes = 0;
                    node.contents = null;
                } else if (FS.isLink(node.mode)) {
                    node.node_ops = MEMFS.ops_table.link.node;
                    node.stream_ops = MEMFS.ops_table.link.stream;
                } else if (FS.isChrdev(node.mode)) {
                    node.node_ops = MEMFS.ops_table.chrdev.node;
                    node.stream_ops = MEMFS.ops_table.chrdev.stream;
                }
                node.timestamp = Date.now();
                if (parent) {
                    parent.contents[name] = node;
                }
                return node;
            },
            getFileDataAsRegularArray: function (node) {
                if (node.contents && node.contents.subarray) {
                    var arr = [];
                    for (var i = 0; i < node.usedBytes; ++i)
                        arr.push(node.contents[i]);
                    return arr;
                }
                return node.contents;
            },
            getFileDataAsTypedArray: function (node) {
                if (!node.contents) return new Uint8Array(0);
                if (node.contents.subarray)
                    return node.contents.subarray(0, node.usedBytes);
                return new Uint8Array(node.contents);
            },
            expandFileStorage: function (node, newCapacity) {
                var prevCapacity = node.contents ? node.contents.length : 0;
                if (prevCapacity >= newCapacity) return;
                var CAPACITY_DOUBLING_MAX = 1024 * 1024;
                newCapacity = Math.max(
                    newCapacity,
                    (prevCapacity *
                        (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>>
                        0
                );
                if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
                var oldContents = node.contents;
                node.contents = new Uint8Array(newCapacity);
                if (node.usedBytes > 0)
                    node.contents.set(
                        oldContents.subarray(0, node.usedBytes),
                        0
                    );
                return;
            },
            resizeFileStorage: function (node, newSize) {
                if (node.usedBytes == newSize) return;
                if (newSize == 0) {
                    node.contents = null;
                    node.usedBytes = 0;
                    return;
                }
                if (!node.contents || node.contents.subarray) {
                    var oldContents = node.contents;
                    node.contents = new Uint8Array(newSize);
                    if (oldContents) {
                        node.contents.set(
                            oldContents.subarray(
                                0,
                                Math.min(newSize, node.usedBytes)
                            )
                        );
                    }
                    node.usedBytes = newSize;
                    return;
                }
                if (!node.contents) node.contents = [];
                if (node.contents.length > newSize)
                    node.contents.length = newSize;
                else
                    while (node.contents.length < newSize)
                        node.contents.push(0);
                node.usedBytes = newSize;
            },
            node_ops: {
                getattr: function (node) {
                    var attr = {};
                    attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                    attr.ino = node.id;
                    attr.mode = node.mode;
                    attr.nlink = 1;
                    attr.uid = 0;
                    attr.gid = 0;
                    attr.rdev = node.rdev;
                    if (FS.isDir(node.mode)) {
                        attr.size = 4096;
                    } else if (FS.isFile(node.mode)) {
                        attr.size = node.usedBytes;
                    } else if (FS.isLink(node.mode)) {
                        attr.size = node.link.length;
                    } else {
                        attr.size = 0;
                    }
                    attr.atime = new Date(node.timestamp);
                    attr.mtime = new Date(node.timestamp);
                    attr.ctime = new Date(node.timestamp);
                    attr.blksize = 4096;
                    attr.blocks = Math.ceil(attr.size / attr.blksize);
                    return attr;
                },
                setattr: function (node, attr) {
                    if (attr.mode !== undefined) {
                        node.mode = attr.mode;
                    }
                    if (attr.timestamp !== undefined) {
                        node.timestamp = attr.timestamp;
                    }
                    if (attr.size !== undefined) {
                        MEMFS.resizeFileStorage(node, attr.size);
                    }
                },
                lookup: function (parent, name) {
                    throw FS.genericErrors[44];
                },
                mknod: function (parent, name, mode, dev) {
                    return MEMFS.createNode(parent, name, mode, dev);
                },
                rename: function (old_node, new_dir, new_name) {
                    if (FS.isDir(old_node.mode)) {
                        var new_node;
                        try {
                            new_node = FS.lookupNode(new_dir, new_name);
                        } catch (e) {}
                        if (new_node) {
                            for (var i in new_node.contents) {
                                throw new FS.ErrnoError(55);
                            }
                        }
                    }
                    delete old_node.parent.contents[old_node.name];
                    old_node.name = new_name;
                    new_dir.contents[new_name] = old_node;
                    old_node.parent = new_dir;
                },
                unlink: function (parent, name) {
                    delete parent.contents[name];
                },
                rmdir: function (parent, name) {
                    var node = FS.lookupNode(parent, name);
                    for (var i in node.contents) {
                        throw new FS.ErrnoError(55);
                    }
                    delete parent.contents[name];
                },
                readdir: function (node) {
                    var entries = [".", ".."];
                    for (var key in node.contents) {
                        if (!node.contents.hasOwnProperty(key)) {
                            continue;
                        }
                        entries.push(key);
                    }
                    return entries;
                },
                symlink: function (parent, newname, oldpath) {
                    var node = MEMFS.createNode(
                        parent,
                        newname,
                        511 | 40960,
                        0
                    );
                    node.link = oldpath;
                    return node;
                },
                readlink: function (node) {
                    if (!FS.isLink(node.mode)) {
                        throw new FS.ErrnoError(28);
                    }
                    return node.link;
                }
            },
            stream_ops: {
                read: function (stream, buffer, offset, length, position) {
                    var contents = stream.node.contents;
                    if (position >= stream.node.usedBytes) return 0;
                    var size = Math.min(
                        stream.node.usedBytes - position,
                        length
                    );
                    if (size > 8 && contents.subarray) {
                        buffer.set(
                            contents.subarray(position, position + size),
                            offset
                        );
                    } else {
                        for (var i = 0; i < size; i++)
                            buffer[offset + i] = contents[position + i];
                    }
                    return size;
                },
                write: function (
                    stream,
                    buffer,
                    offset,
                    length,
                    position,
                    canOwn
                ) {
                    if (!length) return 0;
                    var node = stream.node;
                    node.timestamp = Date.now();
                    if (
                        buffer.subarray &&
                        (!node.contents || node.contents.subarray)
                    ) {
                        if (canOwn) {
                            node.contents = buffer.subarray(
                                offset,
                                offset + length
                            );
                            node.usedBytes = length;
                            return length;
                        } else if (node.usedBytes === 0 && position === 0) {
                            node.contents = buffer.slice(
                                offset,
                                offset + length
                            );
                            node.usedBytes = length;
                            return length;
                        } else if (position + length <= node.usedBytes) {
                            node.contents.set(
                                buffer.subarray(offset, offset + length),
                                position
                            );
                            return length;
                        }
                    }
                    MEMFS.expandFileStorage(node, position + length);
                    if (node.contents.subarray && buffer.subarray)
                        node.contents.set(
                            buffer.subarray(offset, offset + length),
                            position
                        );
                    else {
                        for (var i = 0; i < length; i++) {
                            node.contents[position + i] = buffer[offset + i];
                        }
                    }
                    node.usedBytes = Math.max(
                        node.usedBytes,
                        position + length
                    );
                    return length;
                },
                llseek: function (stream, offset, whence) {
                    var position = offset;
                    if (whence === 1) {
                        position += stream.position;
                    } else if (whence === 2) {
                        if (FS.isFile(stream.node.mode)) {
                            position += stream.node.usedBytes;
                        }
                    }
                    if (position < 0) {
                        throw new FS.ErrnoError(28);
                    }
                    return position;
                },
                allocate: function (stream, offset, length) {
                    MEMFS.expandFileStorage(stream.node, offset + length);
                    stream.node.usedBytes = Math.max(
                        stream.node.usedBytes,
                        offset + length
                    );
                },
                mmap: function (
                    stream,
                    buffer,
                    offset,
                    length,
                    position,
                    prot,
                    flags
                ) {
                    if (!FS.isFile(stream.node.mode)) {
                        throw new FS.ErrnoError(43);
                    }
                    var ptr;
                    var allocated;
                    var contents = stream.node.contents;
                    if (!(flags & 2) && contents.buffer === buffer.buffer) {
                        allocated = false;
                        ptr = contents.byteOffset;
                    } else {
                        if (
                            position > 0 ||
                            position + length < contents.length
                        ) {
                            if (contents.subarray) {
                                contents = contents.subarray(
                                    position,
                                    position + length
                                );
                            } else {
                                contents = Array.prototype.slice.call(
                                    contents,
                                    position,
                                    position + length
                                );
                            }
                        }
                        allocated = true;
                        var fromHeap = buffer.buffer == HEAP8.buffer;
                        ptr = _malloc(length);
                        if (!ptr) {
                            throw new FS.ErrnoError(48);
                        }
                        (fromHeap ? HEAP8 : buffer).set(contents, ptr);
                    }
                    return { ptr: ptr, allocated: allocated };
                },
                msync: function (stream, buffer, offset, length, mmapFlags) {
                    if (!FS.isFile(stream.node.mode)) {
                        throw new FS.ErrnoError(43);
                    }
                    if (mmapFlags & 2) {
                        return 0;
                    }
                    var bytesWritten = MEMFS.stream_ops.write(
                        stream,
                        buffer,
                        0,
                        length,
                        offset,
                        false
                    );
                    return 0;
                }
            }
        };
        var FS = {
            root: null,
            mounts: [],
            devices: {},
            streams: [],
            nextInode: 1,
            nameTable: null,
            currentPath: "/",
            initialized: false,
            ignorePermissions: true,
            trackingDelegate: {},
            tracking: { openFlags: { READ: 1, WRITE: 2 } },
            ErrnoError: null,
            genericErrors: {},
            filesystems: null,
            syncFSRequests: 0,
            handleFSError: function (e) {
                if (!(e instanceof FS.ErrnoError))
                    throw e + " : " + stackTrace();
                return setErrNo(e.errno);
            },
            lookupPath: function (path, opts) {
                path = PATH_FS.resolve(FS.cwd(), path);
                opts = opts || {};
                if (!path) return { path: "", node: null };
                var defaults = { follow_mount: true, recurse_count: 0 };
                for (var key in defaults) {
                    if (opts[key] === undefined) {
                        opts[key] = defaults[key];
                    }
                }
                if (opts.recurse_count > 8) {
                    throw new FS.ErrnoError(32);
                }
                var parts = PATH.normalizeArray(
                    path.split("/").filter(function (p) {
                        return !!p;
                    }),
                    false
                );
                var current = FS.root;
                var current_path = "/";
                for (var i = 0; i < parts.length; i++) {
                    var islast = i === parts.length - 1;
                    if (islast && opts.parent) {
                        break;
                    }
                    current = FS.lookupNode(current, parts[i]);
                    current_path = PATH.join2(current_path, parts[i]);
                    if (FS.isMountpoint(current)) {
                        if (!islast || (islast && opts.follow_mount)) {
                            current = current.mounted.root;
                        }
                    }
                    if (!islast || opts.follow) {
                        var count = 0;
                        while (FS.isLink(current.mode)) {
                            var link = FS.readlink(current_path);
                            current_path = PATH_FS.resolve(
                                PATH.dirname(current_path),
                                link
                            );
                            var lookup = FS.lookupPath(current_path, {
                                recurse_count: opts.recurse_count
                            });
                            current = lookup.node;
                            if (count++ > 40) {
                                throw new FS.ErrnoError(32);
                            }
                        }
                    }
                }
                return { path: current_path, node: current };
            },
            getPath: function (node) {
                var path;
                while (true) {
                    if (FS.isRoot(node)) {
                        var mount = node.mount.mountpoint;
                        if (!path) return mount;
                        return mount[mount.length - 1] !== "/"
                            ? mount + "/" + path
                            : mount + path;
                    }
                    path = path ? node.name + "/" + path : node.name;
                    node = node.parent;
                }
            },
            hashName: function (parentid, name) {
                var hash = 0;
                for (var i = 0; i < name.length; i++) {
                    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
                }
                return ((parentid + hash) >>> 0) % FS.nameTable.length;
            },
            hashAddNode: function (node) {
                var hash = FS.hashName(node.parent.id, node.name);
                node.name_next = FS.nameTable[hash];
                FS.nameTable[hash] = node;
            },
            hashRemoveNode: function (node) {
                var hash = FS.hashName(node.parent.id, node.name);
                if (FS.nameTable[hash] === node) {
                    FS.nameTable[hash] = node.name_next;
                } else {
                    var current = FS.nameTable[hash];
                    while (current) {
                        if (current.name_next === node) {
                            current.name_next = node.name_next;
                            break;
                        }
                        current = current.name_next;
                    }
                }
            },
            lookupNode: function (parent, name) {
                var errCode = FS.mayLookup(parent);
                if (errCode) {
                    throw new FS.ErrnoError(errCode, parent);
                }
                var hash = FS.hashName(parent.id, name);
                for (
                    var node = FS.nameTable[hash];
                    node;
                    node = node.name_next
                ) {
                    var nodeName = node.name;
                    if (node.parent.id === parent.id && nodeName === name) {
                        return node;
                    }
                }
                return FS.lookup(parent, name);
            },
            createNode: function (parent, name, mode, rdev) {
                var node = new FS.FSNode(parent, name, mode, rdev);
                FS.hashAddNode(node);
                return node;
            },
            destroyNode: function (node) {
                FS.hashRemoveNode(node);
            },
            isRoot: function (node) {
                return node === node.parent;
            },
            isMountpoint: function (node) {
                return !!node.mounted;
            },
            isFile: function (mode) {
                return (mode & 61440) === 32768;
            },
            isDir: function (mode) {
                return (mode & 61440) === 16384;
            },
            isLink: function (mode) {
                return (mode & 61440) === 40960;
            },
            isChrdev: function (mode) {
                return (mode & 61440) === 8192;
            },
            isBlkdev: function (mode) {
                return (mode & 61440) === 24576;
            },
            isFIFO: function (mode) {
                return (mode & 61440) === 4096;
            },
            isSocket: function (mode) {
                return (mode & 49152) === 49152;
            },
            flagModes: {
                r: 0,
                rs: 1052672,
                "r+": 2,
                w: 577,
                wx: 705,
                xw: 705,
                "w+": 578,
                "wx+": 706,
                "xw+": 706,
                a: 1089,
                ax: 1217,
                xa: 1217,
                "a+": 1090,
                "ax+": 1218,
                "xa+": 1218
            },
            modeStringToFlags: function (str) {
                var flags = FS.flagModes[str];
                if (typeof flags === "undefined") {
                    throw new Error("Unknown file open mode: " + str);
                }
                return flags;
            },
            flagsToPermissionString: function (flag) {
                var perms = ["r", "w", "rw"][flag & 3];
                if (flag & 512) {
                    perms += "w";
                }
                return perms;
            },
            nodePermissions: function (node, perms) {
                if (FS.ignorePermissions) {
                    return 0;
                }
                if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
                    return 2;
                } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
                    return 2;
                } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
                    return 2;
                }
                return 0;
            },
            mayLookup: function (dir) {
                var errCode = FS.nodePermissions(dir, "x");
                if (errCode) return errCode;
                if (!dir.node_ops.lookup) return 2;
                return 0;
            },
            mayCreate: function (dir, name) {
                try {
                    var node = FS.lookupNode(dir, name);
                    return 20;
                } catch (e) {}
                return FS.nodePermissions(dir, "wx");
            },
            mayDelete: function (dir, name, isdir) {
                var node;
                try {
                    node = FS.lookupNode(dir, name);
                } catch (e) {
                    return e.errno;
                }
                var errCode = FS.nodePermissions(dir, "wx");
                if (errCode) {
                    return errCode;
                }
                if (isdir) {
                    if (!FS.isDir(node.mode)) {
                        return 54;
                    }
                    if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                        return 10;
                    }
                } else {
                    if (FS.isDir(node.mode)) {
                        return 31;
                    }
                }
                return 0;
            },
            mayOpen: function (node, flags) {
                if (!node) {
                    return 44;
                }
                if (FS.isLink(node.mode)) {
                    return 32;
                } else if (FS.isDir(node.mode)) {
                    if (
                        FS.flagsToPermissionString(flags) !== "r" ||
                        flags & 512
                    ) {
                        return 31;
                    }
                }
                return FS.nodePermissions(
                    node,
                    FS.flagsToPermissionString(flags)
                );
            },
            MAX_OPEN_FDS: 4096,
            nextfd: function (fd_start, fd_end) {
                fd_start = fd_start || 0;
                fd_end = fd_end || FS.MAX_OPEN_FDS;
                for (var fd = fd_start; fd <= fd_end; fd++) {
                    if (!FS.streams[fd]) {
                        return fd;
                    }
                }
                throw new FS.ErrnoError(33);
            },
            getStream: function (fd) {
                return FS.streams[fd];
            },
            createStream: function (stream, fd_start, fd_end) {
                if (!FS.FSStream) {
                    FS.FSStream = function () {};
                    FS.FSStream.prototype = {
                        object: {
                            get: function () {
                                return this.node;
                            },
                            set: function (val) {
                                this.node = val;
                            }
                        },
                        isRead: {
                            get: function () {
                                return (this.flags & 2097155) !== 1;
                            }
                        },
                        isWrite: {
                            get: function () {
                                return (this.flags & 2097155) !== 0;
                            }
                        },
                        isAppend: {
                            get: function () {
                                return this.flags & 1024;
                            }
                        }
                    };
                }
                var newStream = new FS.FSStream();
                for (var p in stream) {
                    newStream[p] = stream[p];
                }
                stream = newStream;
                var fd = FS.nextfd(fd_start, fd_end);
                stream.fd = fd;
                FS.streams[fd] = stream;
                return stream;
            },
            closeStream: function (fd) {
                FS.streams[fd] = null;
            },
            chrdev_stream_ops: {
                open: function (stream) {
                    var device = FS.getDevice(stream.node.rdev);
                    stream.stream_ops = device.stream_ops;
                    if (stream.stream_ops.open) {
                        stream.stream_ops.open(stream);
                    }
                },
                llseek: function () {
                    throw new FS.ErrnoError(70);
                }
            },
            major: function (dev) {
                return dev >> 8;
            },
            minor: function (dev) {
                return dev & 255;
            },
            makedev: function (ma, mi) {
                return (ma << 8) | mi;
            },
            registerDevice: function (dev, ops) {
                FS.devices[dev] = { stream_ops: ops };
            },
            getDevice: function (dev) {
                return FS.devices[dev];
            },
            getMounts: function (mount) {
                var mounts = [];
                var check = [mount];
                while (check.length) {
                    var m = check.pop();
                    mounts.push(m);
                    check.push.apply(check, m.mounts);
                }
                return mounts;
            },
            syncfs: function (populate, callback) {
                if (typeof populate === "function") {
                    callback = populate;
                    populate = false;
                }
                FS.syncFSRequests++;
                if (FS.syncFSRequests > 1) {
                    err(
                        "warning: " +
                            FS.syncFSRequests +
                            " FS.syncfs operations in flight at once, probably just doing extra work"
                    );
                }
                var mounts = FS.getMounts(FS.root.mount);
                var completed = 0;
                function doCallback(errCode) {
                    FS.syncFSRequests--;
                    return callback(errCode);
                }
                function done(errCode) {
                    if (errCode) {
                        if (!done.errored) {
                            done.errored = true;
                            return doCallback(errCode);
                        }
                        return;
                    }
                    if (++completed >= mounts.length) {
                        doCallback(null);
                    }
                }
                mounts.forEach(function (mount) {
                    if (!mount.type.syncfs) {
                        return done(null);
                    }
                    mount.type.syncfs(mount, populate, done);
                });
            },
            mount: function (type, opts, mountpoint) {
                var root = mountpoint === "/";
                var pseudo = !mountpoint;
                var node;
                if (root && FS.root) {
                    throw new FS.ErrnoError(10);
                } else if (!root && !pseudo) {
                    var lookup = FS.lookupPath(mountpoint, {
                        follow_mount: false
                    });
                    mountpoint = lookup.path;
                    node = lookup.node;
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10);
                    }
                    if (!FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(54);
                    }
                }
                var mount = {
                    type: type,
                    opts: opts,
                    mountpoint: mountpoint,
                    mounts: []
                };
                var mountRoot = type.mount(mount);
                mountRoot.mount = mount;
                mount.root = mountRoot;
                if (root) {
                    FS.root = mountRoot;
                } else if (node) {
                    node.mounted = mount;
                    if (node.mount) {
                        node.mount.mounts.push(mount);
                    }
                }
                return mountRoot;
            },
            unmount: function (mountpoint) {
                var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
                if (!FS.isMountpoint(lookup.node)) {
                    throw new FS.ErrnoError(28);
                }
                var node = lookup.node;
                var mount = node.mounted;
                var mounts = FS.getMounts(mount);
                Object.keys(FS.nameTable).forEach(function (hash) {
                    var current = FS.nameTable[hash];
                    while (current) {
                        var next = current.name_next;
                        if (mounts.indexOf(current.mount) !== -1) {
                            FS.destroyNode(current);
                        }
                        current = next;
                    }
                });
                node.mounted = null;
                var idx = node.mount.mounts.indexOf(mount);
                node.mount.mounts.splice(idx, 1);
            },
            lookup: function (parent, name) {
                return parent.node_ops.lookup(parent, name);
            },
            mknod: function (path, mode, dev) {
                var lookup = FS.lookupPath(path, { parent: true });
                var parent = lookup.node;
                var name = PATH.basename(path);
                if (!name || name === "." || name === "..") {
                    throw new FS.ErrnoError(28);
                }
                var errCode = FS.mayCreate(parent, name);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.mknod) {
                    throw new FS.ErrnoError(63);
                }
                return parent.node_ops.mknod(parent, name, mode, dev);
            },
            create: function (path, mode) {
                mode = mode !== undefined ? mode : 438;
                mode &= 4095;
                mode |= 32768;
                return FS.mknod(path, mode, 0);
            },
            mkdir: function (path, mode) {
                mode = mode !== undefined ? mode : 511;
                mode &= 511 | 512;
                mode |= 16384;
                return FS.mknod(path, mode, 0);
            },
            mkdirTree: function (path, mode) {
                var dirs = path.split("/");
                var d = "";
                for (var i = 0; i < dirs.length; ++i) {
                    if (!dirs[i]) continue;
                    d += "/" + dirs[i];
                    try {
                        FS.mkdir(d, mode);
                    } catch (e) {
                        if (e.errno != 20) throw e;
                    }
                }
            },
            mkdev: function (path, mode, dev) {
                if (typeof dev === "undefined") {
                    dev = mode;
                    mode = 438;
                }
                mode |= 8192;
                return FS.mknod(path, mode, dev);
            },
            symlink: function (oldpath, newpath) {
                if (!PATH_FS.resolve(oldpath)) {
                    throw new FS.ErrnoError(44);
                }
                var lookup = FS.lookupPath(newpath, { parent: true });
                var parent = lookup.node;
                if (!parent) {
                    throw new FS.ErrnoError(44);
                }
                var newname = PATH.basename(newpath);
                var errCode = FS.mayCreate(parent, newname);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.symlink) {
                    throw new FS.ErrnoError(63);
                }
                return parent.node_ops.symlink(parent, newname, oldpath);
            },
            rename: function (old_path, new_path) {
                var old_dirname = PATH.dirname(old_path);
                var new_dirname = PATH.dirname(new_path);
                var old_name = PATH.basename(old_path);
                var new_name = PATH.basename(new_path);
                var lookup, old_dir, new_dir;
                try {
                    lookup = FS.lookupPath(old_path, { parent: true });
                    old_dir = lookup.node;
                    lookup = FS.lookupPath(new_path, { parent: true });
                    new_dir = lookup.node;
                } catch (e) {
                    throw new FS.ErrnoError(10);
                }
                if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
                if (old_dir.mount !== new_dir.mount) {
                    throw new FS.ErrnoError(75);
                }
                var old_node = FS.lookupNode(old_dir, old_name);
                var relative = PATH_FS.relative(old_path, new_dirname);
                if (relative.charAt(0) !== ".") {
                    throw new FS.ErrnoError(28);
                }
                relative = PATH_FS.relative(new_path, old_dirname);
                if (relative.charAt(0) !== ".") {
                    throw new FS.ErrnoError(55);
                }
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name);
                } catch (e) {}
                if (old_node === new_node) {
                    return;
                }
                var isdir = FS.isDir(old_node.mode);
                var errCode = FS.mayDelete(old_dir, old_name, isdir);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                errCode = new_node
                    ? FS.mayDelete(new_dir, new_name, isdir)
                    : FS.mayCreate(new_dir, new_name);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                if (!old_dir.node_ops.rename) {
                    throw new FS.ErrnoError(63);
                }
                if (
                    FS.isMountpoint(old_node) ||
                    (new_node && FS.isMountpoint(new_node))
                ) {
                    throw new FS.ErrnoError(10);
                }
                if (new_dir !== old_dir) {
                    errCode = FS.nodePermissions(old_dir, "w");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode);
                    }
                }
                try {
                    if (FS.trackingDelegate["willMovePath"]) {
                        FS.trackingDelegate["willMovePath"](old_path, new_path);
                    }
                } catch (e) {
                    err(
                        "FS.trackingDelegate['willMovePath']('" +
                            old_path +
                            "', '" +
                            new_path +
                            "') threw an exception: " +
                            e.message
                    );
                }
                FS.hashRemoveNode(old_node);
                try {
                    old_dir.node_ops.rename(old_node, new_dir, new_name);
                } catch (e) {
                    throw e;
                } finally {
                    FS.hashAddNode(old_node);
                }
                try {
                    if (FS.trackingDelegate["onMovePath"])
                        FS.trackingDelegate["onMovePath"](old_path, new_path);
                } catch (e) {
                    err(
                        "FS.trackingDelegate['onMovePath']('" +
                            old_path +
                            "', '" +
                            new_path +
                            "') threw an exception: " +
                            e.message
                    );
                }
            },
            rmdir: function (path) {
                var lookup = FS.lookupPath(path, { parent: true });
                var parent = lookup.node;
                var name = PATH.basename(path);
                var node = FS.lookupNode(parent, name);
                var errCode = FS.mayDelete(parent, name, true);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.rmdir) {
                    throw new FS.ErrnoError(63);
                }
                if (FS.isMountpoint(node)) {
                    throw new FS.ErrnoError(10);
                }
                try {
                    if (FS.trackingDelegate["willDeletePath"]) {
                        FS.trackingDelegate["willDeletePath"](path);
                    }
                } catch (e) {
                    err(
                        "FS.trackingDelegate['willDeletePath']('" +
                            path +
                            "') threw an exception: " +
                            e.message
                    );
                }
                parent.node_ops.rmdir(parent, name);
                FS.destroyNode(node);
                try {
                    if (FS.trackingDelegate["onDeletePath"])
                        FS.trackingDelegate["onDeletePath"](path);
                } catch (e) {
                    err(
                        "FS.trackingDelegate['onDeletePath']('" +
                            path +
                            "') threw an exception: " +
                            e.message
                    );
                }
            },
            readdir: function (path) {
                var lookup = FS.lookupPath(path, { follow: true });
                var node = lookup.node;
                if (!node.node_ops.readdir) {
                    throw new FS.ErrnoError(54);
                }
                return node.node_ops.readdir(node);
            },
            unlink: function (path) {
                var lookup = FS.lookupPath(path, { parent: true });
                var parent = lookup.node;
                var name = PATH.basename(path);
                var node = FS.lookupNode(parent, name);
                var errCode = FS.mayDelete(parent, name, false);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.unlink) {
                    throw new FS.ErrnoError(63);
                }
                if (FS.isMountpoint(node)) {
                    throw new FS.ErrnoError(10);
                }
                try {
                    if (FS.trackingDelegate["willDeletePath"]) {
                        FS.trackingDelegate["willDeletePath"](path);
                    }
                } catch (e) {
                    err(
                        "FS.trackingDelegate['willDeletePath']('" +
                            path +
                            "') threw an exception: " +
                            e.message
                    );
                }
                parent.node_ops.unlink(parent, name);
                FS.destroyNode(node);
                try {
                    if (FS.trackingDelegate["onDeletePath"])
                        FS.trackingDelegate["onDeletePath"](path);
                } catch (e) {
                    err(
                        "FS.trackingDelegate['onDeletePath']('" +
                            path +
                            "') threw an exception: " +
                            e.message
                    );
                }
            },
            readlink: function (path) {
                var lookup = FS.lookupPath(path);
                var link = lookup.node;
                if (!link) {
                    throw new FS.ErrnoError(44);
                }
                if (!link.node_ops.readlink) {
                    throw new FS.ErrnoError(28);
                }
                return PATH_FS.resolve(
                    FS.getPath(link.parent),
                    link.node_ops.readlink(link)
                );
            },
            stat: function (path, dontFollow) {
                var lookup = FS.lookupPath(path, { follow: !dontFollow });
                var node = lookup.node;
                if (!node) {
                    throw new FS.ErrnoError(44);
                }
                if (!node.node_ops.getattr) {
                    throw new FS.ErrnoError(63);
                }
                return node.node_ops.getattr(node);
            },
            lstat: function (path) {
                return FS.stat(path, true);
            },
            chmod: function (path, mode, dontFollow) {
                var node;
                if (typeof path === "string") {
                    var lookup = FS.lookupPath(path, { follow: !dontFollow });
                    node = lookup.node;
                } else {
                    node = path;
                }
                if (!node.node_ops.setattr) {
                    throw new FS.ErrnoError(63);
                }
                node.node_ops.setattr(node, {
                    mode: (mode & 4095) | (node.mode & ~4095),
                    timestamp: Date.now()
                });
            },
            lchmod: function (path, mode) {
                FS.chmod(path, mode, true);
            },
            fchmod: function (fd, mode) {
                var stream = FS.getStream(fd);
                if (!stream) {
                    throw new FS.ErrnoError(8);
                }
                FS.chmod(stream.node, mode);
            },
            chown: function (path, uid, gid, dontFollow) {
                var node;
                if (typeof path === "string") {
                    var lookup = FS.lookupPath(path, { follow: !dontFollow });
                    node = lookup.node;
                } else {
                    node = path;
                }
                if (!node.node_ops.setattr) {
                    throw new FS.ErrnoError(63);
                }
                node.node_ops.setattr(node, { timestamp: Date.now() });
            },
            lchown: function (path, uid, gid) {
                FS.chown(path, uid, gid, true);
            },
            fchown: function (fd, uid, gid) {
                var stream = FS.getStream(fd);
                if (!stream) {
                    throw new FS.ErrnoError(8);
                }
                FS.chown(stream.node, uid, gid);
            },
            truncate: function (path, len) {
                if (len < 0) {
                    throw new FS.ErrnoError(28);
                }
                var node;
                if (typeof path === "string") {
                    var lookup = FS.lookupPath(path, { follow: true });
                    node = lookup.node;
                } else {
                    node = path;
                }
                if (!node.node_ops.setattr) {
                    throw new FS.ErrnoError(63);
                }
                if (FS.isDir(node.mode)) {
                    throw new FS.ErrnoError(31);
                }
                if (!FS.isFile(node.mode)) {
                    throw new FS.ErrnoError(28);
                }
                var errCode = FS.nodePermissions(node, "w");
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                node.node_ops.setattr(node, {
                    size: len,
                    timestamp: Date.now()
                });
            },
            ftruncate: function (fd, len) {
                var stream = FS.getStream(fd);
                if (!stream) {
                    throw new FS.ErrnoError(8);
                }
                if ((stream.flags & 2097155) === 0) {
                    throw new FS.ErrnoError(28);
                }
                FS.truncate(stream.node, len);
            },
            utime: function (path, atime, mtime) {
                var lookup = FS.lookupPath(path, { follow: true });
                var node = lookup.node;
                node.node_ops.setattr(node, {
                    timestamp: Math.max(atime, mtime)
                });
            },
            open: function (path, flags, mode, fd_start, fd_end) {
                if (path === "") {
                    throw new FS.ErrnoError(44);
                }
                flags =
                    typeof flags === "string"
                        ? FS.modeStringToFlags(flags)
                        : flags;
                mode = typeof mode === "undefined" ? 438 : mode;
                if (flags & 64) {
                    mode = (mode & 4095) | 32768;
                } else {
                    mode = 0;
                }
                var node;
                if (typeof path === "object") {
                    node = path;
                } else {
                    path = PATH.normalize(path);
                    try {
                        var lookup = FS.lookupPath(path, {
                            follow: !(flags & 131072)
                        });
                        node = lookup.node;
                    } catch (e) {}
                }
                var created = false;
                if (flags & 64) {
                    if (node) {
                        if (flags & 128) {
                            throw new FS.ErrnoError(20);
                        }
                    } else {
                        node = FS.mknod(path, mode, 0);
                        created = true;
                    }
                }
                if (!node) {
                    throw new FS.ErrnoError(44);
                }
                if (FS.isChrdev(node.mode)) {
                    flags &= ~512;
                }
                if (flags & 65536 && !FS.isDir(node.mode)) {
                    throw new FS.ErrnoError(54);
                }
                if (!created) {
                    var errCode = FS.mayOpen(node, flags);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode);
                    }
                }
                if (flags & 512) {
                    FS.truncate(node, 0);
                }
                flags &= ~(128 | 512 | 131072);
                var stream = FS.createStream(
                    {
                        node: node,
                        path: FS.getPath(node),
                        flags: flags,
                        seekable: true,
                        position: 0,
                        stream_ops: node.stream_ops,
                        ungotten: [],
                        error: false
                    },
                    fd_start,
                    fd_end
                );
                if (stream.stream_ops.open) {
                    stream.stream_ops.open(stream);
                }
                if (Module["logReadFiles"] && !(flags & 1)) {
                    if (!FS.readFiles) FS.readFiles = {};
                    if (!(path in FS.readFiles)) {
                        FS.readFiles[path] = 1;
                        err("FS.trackingDelegate error on read file: " + path);
                    }
                }
                try {
                    if (FS.trackingDelegate["onOpenFile"]) {
                        var trackingFlags = 0;
                        if ((flags & 2097155) !== 1) {
                            trackingFlags |= FS.tracking.openFlags.READ;
                        }
                        if ((flags & 2097155) !== 0) {
                            trackingFlags |= FS.tracking.openFlags.WRITE;
                        }
                        FS.trackingDelegate["onOpenFile"](path, trackingFlags);
                    }
                } catch (e) {
                    err(
                        "FS.trackingDelegate['onOpenFile']('" +
                            path +
                            "', flags) threw an exception: " +
                            e.message
                    );
                }
                return stream;
            },
            close: function (stream) {
                if (FS.isClosed(stream)) {
                    throw new FS.ErrnoError(8);
                }
                if (stream.getdents) stream.getdents = null;
                try {
                    if (stream.stream_ops.close) {
                        stream.stream_ops.close(stream);
                    }
                } catch (e) {
                    throw e;
                } finally {
                    FS.closeStream(stream.fd);
                }
                stream.fd = null;
            },
            isClosed: function (stream) {
                return stream.fd === null;
            },
            llseek: function (stream, offset, whence) {
                if (FS.isClosed(stream)) {
                    throw new FS.ErrnoError(8);
                }
                if (!stream.seekable || !stream.stream_ops.llseek) {
                    throw new FS.ErrnoError(70);
                }
                if (whence != 0 && whence != 1 && whence != 2) {
                    throw new FS.ErrnoError(28);
                }
                stream.position = stream.stream_ops.llseek(
                    stream,
                    offset,
                    whence
                );
                stream.ungotten = [];
                return stream.position;
            },
            read: function (stream, buffer, offset, length, position) {
                if (length < 0 || position < 0) {
                    throw new FS.ErrnoError(28);
                }
                if (FS.isClosed(stream)) {
                    throw new FS.ErrnoError(8);
                }
                if ((stream.flags & 2097155) === 1) {
                    throw new FS.ErrnoError(8);
                }
                if (FS.isDir(stream.node.mode)) {
                    throw new FS.ErrnoError(31);
                }
                if (!stream.stream_ops.read) {
                    throw new FS.ErrnoError(28);
                }
                var seeking = typeof position !== "undefined";
                if (!seeking) {
                    position = stream.position;
                } else if (!stream.seekable) {
                    throw new FS.ErrnoError(70);
                }
                var bytesRead = stream.stream_ops.read(
                    stream,
                    buffer,
                    offset,
                    length,
                    position
                );
                if (!seeking) stream.position += bytesRead;
                return bytesRead;
            },
            write: function (stream, buffer, offset, length, position, canOwn) {
                if (length < 0 || position < 0) {
                    throw new FS.ErrnoError(28);
                }
                if (FS.isClosed(stream)) {
                    throw new FS.ErrnoError(8);
                }
                if ((stream.flags & 2097155) === 0) {
                    throw new FS.ErrnoError(8);
                }
                if (FS.isDir(stream.node.mode)) {
                    throw new FS.ErrnoError(31);
                }
                if (!stream.stream_ops.write) {
                    throw new FS.ErrnoError(28);
                }
                if (stream.seekable && stream.flags & 1024) {
                    FS.llseek(stream, 0, 2);
                }
                var seeking = typeof position !== "undefined";
                if (!seeking) {
                    position = stream.position;
                } else if (!stream.seekable) {
                    throw new FS.ErrnoError(70);
                }
                var bytesWritten = stream.stream_ops.write(
                    stream,
                    buffer,
                    offset,
                    length,
                    position,
                    canOwn
                );
                if (!seeking) stream.position += bytesWritten;
                try {
                    if (stream.path && FS.trackingDelegate["onWriteToFile"])
                        FS.trackingDelegate["onWriteToFile"](stream.path);
                } catch (e) {
                    err(
                        "FS.trackingDelegate['onWriteToFile']('" +
                            stream.path +
                            "') threw an exception: " +
                            e.message
                    );
                }
                return bytesWritten;
            },
            allocate: function (stream, offset, length) {
                if (FS.isClosed(stream)) {
                    throw new FS.ErrnoError(8);
                }
                if (offset < 0 || length <= 0) {
                    throw new FS.ErrnoError(28);
                }
                if ((stream.flags & 2097155) === 0) {
                    throw new FS.ErrnoError(8);
                }
                if (
                    !FS.isFile(stream.node.mode) &&
                    !FS.isDir(stream.node.mode)
                ) {
                    throw new FS.ErrnoError(43);
                }
                if (!stream.stream_ops.allocate) {
                    throw new FS.ErrnoError(138);
                }
                stream.stream_ops.allocate(stream, offset, length);
            },
            mmap: function (
                stream,
                buffer,
                offset,
                length,
                position,
                prot,
                flags
            ) {
                if (
                    (prot & 2) !== 0 &&
                    (flags & 2) === 0 &&
                    (stream.flags & 2097155) !== 2
                ) {
                    throw new FS.ErrnoError(2);
                }
                if ((stream.flags & 2097155) === 1) {
                    throw new FS.ErrnoError(2);
                }
                if (!stream.stream_ops.mmap) {
                    throw new FS.ErrnoError(43);
                }
                return stream.stream_ops.mmap(
                    stream,
                    buffer,
                    offset,
                    length,
                    position,
                    prot,
                    flags
                );
            },
            msync: function (stream, buffer, offset, length, mmapFlags) {
                if (!stream || !stream.stream_ops.msync) {
                    return 0;
                }
                return stream.stream_ops.msync(
                    stream,
                    buffer,
                    offset,
                    length,
                    mmapFlags
                );
            },
            munmap: function (stream) {
                return 0;
            },
            ioctl: function (stream, cmd, arg) {
                if (!stream.stream_ops.ioctl) {
                    throw new FS.ErrnoError(59);
                }
                return stream.stream_ops.ioctl(stream, cmd, arg);
            },
            readFile: function (path, opts) {
                opts = opts || {};
                opts.flags = opts.flags || "r";
                opts.encoding = opts.encoding || "binary";
                if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                    throw new Error(
                        'Invalid encoding type "' + opts.encoding + '"'
                    );
                }
                var ret;
                var stream = FS.open(path, opts.flags);
                var stat = FS.stat(path);
                var length = stat.size;
                var buf = new Uint8Array(length);
                FS.read(stream, buf, 0, length, 0);
                if (opts.encoding === "utf8") {
                    ret = UTF8ArrayToString(buf, 0);
                } else if (opts.encoding === "binary") {
                    ret = buf;
                }
                FS.close(stream);
                return ret;
            },
            writeFile: function (path, data, opts) {
                opts = opts || {};
                opts.flags = opts.flags || "w";
                var stream = FS.open(path, opts.flags, opts.mode);
                if (typeof data === "string") {
                    var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
                    var actualNumBytes = stringToUTF8Array(
                        data,
                        buf,
                        0,
                        buf.length
                    );
                    FS.write(
                        stream,
                        buf,
                        0,
                        actualNumBytes,
                        undefined,
                        opts.canOwn
                    );
                } else if (ArrayBuffer.isView(data)) {
                    FS.write(
                        stream,
                        data,
                        0,
                        data.byteLength,
                        undefined,
                        opts.canOwn
                    );
                } else {
                    throw new Error("Unsupported data type");
                }
                FS.close(stream);
            },
            cwd: function () {
                return FS.currentPath;
            },
            chdir: function (path) {
                var lookup = FS.lookupPath(path, { follow: true });
                if (lookup.node === null) {
                    throw new FS.ErrnoError(44);
                }
                if (!FS.isDir(lookup.node.mode)) {
                    throw new FS.ErrnoError(54);
                }
                var errCode = FS.nodePermissions(lookup.node, "x");
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
                FS.currentPath = lookup.path;
            },
            createDefaultDirectories: function () {
                FS.mkdir("/tmp");
                FS.mkdir("/home");
                FS.mkdir("/home/web_user");
            },
            createDefaultDevices: function () {
                FS.mkdir("/dev");
                FS.registerDevice(FS.makedev(1, 3), {
                    read: function () {
                        return 0;
                    },
                    write: function (stream, buffer, offset, length, pos) {
                        return length;
                    }
                });
                FS.mkdev("/dev/null", FS.makedev(1, 3));
                TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
                TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
                FS.mkdev("/dev/tty", FS.makedev(5, 0));
                FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                var random_device;
                if (
                    typeof crypto === "object" &&
                    typeof crypto["getRandomValues"] === "function"
                ) {
                    var randomBuffer = new Uint8Array(1);
                    random_device = function () {
                        crypto.getRandomValues(randomBuffer);
                        return randomBuffer[0];
                    };
                } else if (ENVIRONMENT_IS_NODE) {
                    try {
                        var crypto_module = require("crypto");
                        random_device = function () {
                            return crypto_module["randomBytes"](1)[0];
                        };
                    } catch (e) {}
                } else {
                }
                if (!random_device) {
                    random_device = function () {
                        abort("random_device");
                    };
                }
                FS.createDevice("/dev", "random", random_device);
                FS.createDevice("/dev", "urandom", random_device);
                FS.mkdir("/dev/shm");
                FS.mkdir("/dev/shm/tmp");
            },
            createSpecialDirectories: function () {
                FS.mkdir("/proc");
                FS.mkdir("/proc/self");
                FS.mkdir("/proc/self/fd");
                FS.mount(
                    {
                        mount: function () {
                            var node = FS.createNode(
                                "/proc/self",
                                "fd",
                                16384 | 511,
                                73
                            );
                            node.node_ops = {
                                lookup: function (parent, name) {
                                    var fd = +name;
                                    var stream = FS.getStream(fd);
                                    if (!stream) throw new FS.ErrnoError(8);
                                    var ret = {
                                        parent: null,
                                        mount: { mountpoint: "fake" },
                                        node_ops: {
                                            readlink: function () {
                                                return stream.path;
                                            }
                                        }
                                    };
                                    ret.parent = ret;
                                    return ret;
                                }
                            };
                            return node;
                        }
                    },
                    {},
                    "/proc/self/fd"
                );
            },
            createStandardStreams: function () {
                if (Module["stdin"]) {
                    FS.createDevice("/dev", "stdin", Module["stdin"]);
                } else {
                    FS.symlink("/dev/tty", "/dev/stdin");
                }
                if (Module["stdout"]) {
                    FS.createDevice("/dev", "stdout", null, Module["stdout"]);
                } else {
                    FS.symlink("/dev/tty", "/dev/stdout");
                }
                if (Module["stderr"]) {
                    FS.createDevice("/dev", "stderr", null, Module["stderr"]);
                } else {
                    FS.symlink("/dev/tty1", "/dev/stderr");
                }
                var stdin = FS.open("/dev/stdin", "r");
                var stdout = FS.open("/dev/stdout", "w");
                var stderr = FS.open("/dev/stderr", "w");
            },
            ensureErrnoError: function () {
                if (FS.ErrnoError) return;
                FS.ErrnoError = function ErrnoError(errno, node) {
                    this.node = node;
                    this.setErrno = function (errno) {
                        this.errno = errno;
                    };
                    this.setErrno(errno);
                    this.message = "FS error";
                };
                FS.ErrnoError.prototype = new Error();
                FS.ErrnoError.prototype.constructor = FS.ErrnoError;
                [44].forEach(function (code) {
                    FS.genericErrors[code] = new FS.ErrnoError(code);
                    FS.genericErrors[code].stack = "<generic error, no stack>";
                });
            },
            staticInit: function () {
                FS.ensureErrnoError();
                FS.nameTable = new Array(4096);
                FS.mount(MEMFS, {}, "/");
                FS.createDefaultDirectories();
                FS.createDefaultDevices();
                FS.createSpecialDirectories();
                FS.filesystems = { MEMFS: MEMFS };
            },
            init: function (input, output, error) {
                FS.init.initialized = true;
                FS.ensureErrnoError();
                Module["stdin"] = input || Module["stdin"];
                Module["stdout"] = output || Module["stdout"];
                Module["stderr"] = error || Module["stderr"];
                FS.createStandardStreams();
            },
            quit: function () {
                FS.init.initialized = false;
                var fflush = Module["_fflush"];
                if (fflush) fflush(0);
                for (var i = 0; i < FS.streams.length; i++) {
                    var stream = FS.streams[i];
                    if (!stream) {
                        continue;
                    }
                    FS.close(stream);
                }
            },
            getMode: function (canRead, canWrite) {
                var mode = 0;
                if (canRead) mode |= 292 | 73;
                if (canWrite) mode |= 146;
                return mode;
            },
            joinPath: function (parts, forceRelative) {
                var path = PATH.join.apply(null, parts);
                if (forceRelative && path[0] == "/") path = path.substr(1);
                return path;
            },
            absolutePath: function (relative, base) {
                return PATH_FS.resolve(base, relative);
            },
            standardizePath: function (path) {
                return PATH.normalize(path);
            },
            findObject: function (path, dontResolveLastLink) {
                var ret = FS.analyzePath(path, dontResolveLastLink);
                if (ret.exists) {
                    return ret.object;
                } else {
                    setErrNo(ret.error);
                    return null;
                }
            },
            analyzePath: function (path, dontResolveLastLink) {
                try {
                    var lookup = FS.lookupPath(path, {
                        follow: !dontResolveLastLink
                    });
                    path = lookup.path;
                } catch (e) {}
                var ret = {
                    isRoot: false,
                    exists: false,
                    error: 0,
                    name: null,
                    path: null,
                    object: null,
                    parentExists: false,
                    parentPath: null,
                    parentObject: null
                };
                try {
                    var lookup = FS.lookupPath(path, { parent: true });
                    ret.parentExists = true;
                    ret.parentPath = lookup.path;
                    ret.parentObject = lookup.node;
                    ret.name = PATH.basename(path);
                    lookup = FS.lookupPath(path, {
                        follow: !dontResolveLastLink
                    });
                    ret.exists = true;
                    ret.path = lookup.path;
                    ret.object = lookup.node;
                    ret.name = lookup.node.name;
                    ret.isRoot = lookup.path === "/";
                } catch (e) {
                    ret.error = e.errno;
                }
                return ret;
            },
            createFolder: function (parent, name, canRead, canWrite) {
                var path = PATH.join2(
                    typeof parent === "string" ? parent : FS.getPath(parent),
                    name
                );
                var mode = FS.getMode(canRead, canWrite);
                return FS.mkdir(path, mode);
            },
            createPath: function (parent, path, canRead, canWrite) {
                parent =
                    typeof parent === "string" ? parent : FS.getPath(parent);
                var parts = path.split("/").reverse();
                while (parts.length) {
                    var part = parts.pop();
                    if (!part) continue;
                    var current = PATH.join2(parent, part);
                    try {
                        FS.mkdir(current);
                    } catch (e) {}
                    parent = current;
                }
                return current;
            },
            createFile: function (parent, name, properties, canRead, canWrite) {
                var path = PATH.join2(
                    typeof parent === "string" ? parent : FS.getPath(parent),
                    name
                );
                var mode = FS.getMode(canRead, canWrite);
                return FS.create(path, mode);
            },
            createDataFile: function (
                parent,
                name,
                data,
                canRead,
                canWrite,
                canOwn
            ) {
                var path = name
                    ? PATH.join2(
                          typeof parent === "string"
                              ? parent
                              : FS.getPath(parent),
                          name
                      )
                    : parent;
                var mode = FS.getMode(canRead, canWrite);
                var node = FS.create(path, mode);
                if (data) {
                    if (typeof data === "string") {
                        var arr = new Array(data.length);
                        for (var i = 0, len = data.length; i < len; ++i)
                            arr[i] = data.charCodeAt(i);
                        data = arr;
                    }
                    FS.chmod(node, mode | 146);
                    var stream = FS.open(node, "w");
                    FS.write(stream, data, 0, data.length, 0, canOwn);
                    FS.close(stream);
                    FS.chmod(node, mode);
                }
                return node;
            },
            createDevice: function (parent, name, input, output) {
                var path = PATH.join2(
                    typeof parent === "string" ? parent : FS.getPath(parent),
                    name
                );
                var mode = FS.getMode(!!input, !!output);
                if (!FS.createDevice.major) FS.createDevice.major = 64;
                var dev = FS.makedev(FS.createDevice.major++, 0);
                FS.registerDevice(dev, {
                    open: function (stream) {
                        stream.seekable = false;
                    },
                    close: function (stream) {
                        if (output && output.buffer && output.buffer.length) {
                            output(10);
                        }
                    },
                    read: function (stream, buffer, offset, length, pos) {
                        var bytesRead = 0;
                        for (var i = 0; i < length; i++) {
                            var result;
                            try {
                                result = input();
                            } catch (e) {
                                throw new FS.ErrnoError(29);
                            }
                            if (result === undefined && bytesRead === 0) {
                                throw new FS.ErrnoError(6);
                            }
                            if (result === null || result === undefined) break;
                            bytesRead++;
                            buffer[offset + i] = result;
                        }
                        if (bytesRead) {
                            stream.node.timestamp = Date.now();
                        }
                        return bytesRead;
                    },
                    write: function (stream, buffer, offset, length, pos) {
                        for (var i = 0; i < length; i++) {
                            try {
                                output(buffer[offset + i]);
                            } catch (e) {
                                throw new FS.ErrnoError(29);
                            }
                        }
                        if (length) {
                            stream.node.timestamp = Date.now();
                        }
                        return i;
                    }
                });
                return FS.mkdev(path, mode, dev);
            },
            createLink: function (parent, name, target, canRead, canWrite) {
                var path = PATH.join2(
                    typeof parent === "string" ? parent : FS.getPath(parent),
                    name
                );
                return FS.symlink(target, path);
            },
            forceLoadFile: function (obj) {
                if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
                    return true;
                var success = true;
                if (typeof XMLHttpRequest !== "undefined") {
                    throw new Error(
                        "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
                    );
                } else if (read_) {
                    try {
                        obj.contents = intArrayFromString(read_(obj.url), true);
                        obj.usedBytes = obj.contents.length;
                    } catch (e) {
                        success = false;
                    }
                } else {
                    throw new Error(
                        "Cannot load without read() or XMLHttpRequest."
                    );
                }
                if (!success) setErrNo(29);
                return success;
            },
            createLazyFile: function (parent, name, url, canRead, canWrite) {
                function LazyUint8Array() {
                    this.lengthKnown = false;
                    this.chunks = [];
                }
                LazyUint8Array.prototype.get = function LazyUint8Array_get(
                    idx
                ) {
                    if (idx > this.length - 1 || idx < 0) {
                        return undefined;
                    }
                    var chunkOffset = idx % this.chunkSize;
                    var chunkNum = (idx / this.chunkSize) | 0;
                    return this.getter(chunkNum)[chunkOffset];
                };
                LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(
                    getter
                ) {
                    this.getter = getter;
                };
                LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
                    var xhr = new XMLHttpRequest();
                    xhr.open("HEAD", url, false);
                    xhr.send(null);
                    if (
                        !(
                            (xhr.status >= 200 && xhr.status < 300) ||
                            xhr.status === 304
                        )
                    )
                        throw new Error(
                            "Couldn't load " + url + ". Status: " + xhr.status
                        );
                    var datalength = Number(
                        xhr.getResponseHeader("Content-length")
                    );
                    var header;
                    var hasByteServing =
                        (header = xhr.getResponseHeader("Accept-Ranges")) &&
                        header === "bytes";
                    var usesGzip =
                        (header = xhr.getResponseHeader("Content-Encoding")) &&
                        header === "gzip";
                    var chunkSize = 1024 * 1024;
                    if (!hasByteServing) chunkSize = datalength;
                    var doXHR = function (from, to) {
                        if (from > to)
                            throw new Error(
                                "invalid range (" +
                                    from +
                                    ", " +
                                    to +
                                    ") or no bytes requested!"
                            );
                        if (to > datalength - 1)
                            throw new Error(
                                "only " +
                                    datalength +
                                    " bytes available! programmer error!"
                            );
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", url, false);
                        if (datalength !== chunkSize)
                            xhr.setRequestHeader(
                                "Range",
                                "bytes=" + from + "-" + to
                            );
                        if (typeof Uint8Array != "undefined")
                            xhr.responseType = "arraybuffer";
                        if (xhr.overrideMimeType) {
                            xhr.overrideMimeType(
                                "text/plain; charset=x-user-defined"
                            );
                        }
                        xhr.send(null);
                        if (
                            !(
                                (xhr.status >= 200 && xhr.status < 300) ||
                                xhr.status === 304
                            )
                        )
                            throw new Error(
                                "Couldn't load " +
                                    url +
                                    ". Status: " +
                                    xhr.status
                            );
                        if (xhr.response !== undefined) {
                            return new Uint8Array(xhr.response || []);
                        } else {
                            return intArrayFromString(
                                xhr.responseText || "",
                                true
                            );
                        }
                    };
                    var lazyArray = this;
                    lazyArray.setDataGetter(function (chunkNum) {
                        var start = chunkNum * chunkSize;
                        var end = (chunkNum + 1) * chunkSize - 1;
                        end = Math.min(end, datalength - 1);
                        if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                            lazyArray.chunks[chunkNum] = doXHR(start, end);
                        }
                        if (typeof lazyArray.chunks[chunkNum] === "undefined")
                            throw new Error("doXHR failed!");
                        return lazyArray.chunks[chunkNum];
                    });
                    if (usesGzip || !datalength) {
                        chunkSize = datalength = 1;
                        datalength = this.getter(0).length;
                        chunkSize = datalength;
                        out(
                            "LazyFiles on gzip forces download of the whole file when length is accessed"
                        );
                    }
                    this._length = datalength;
                    this._chunkSize = chunkSize;
                    this.lengthKnown = true;
                };
                if (typeof XMLHttpRequest !== "undefined") {
                    if (!ENVIRONMENT_IS_WORKER)
                        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                    var lazyArray = new LazyUint8Array();
                    Object.defineProperties(lazyArray, {
                        length: {
                            get: function () {
                                if (!this.lengthKnown) {
                                    this.cacheLength();
                                }
                                return this._length;
                            }
                        },
                        chunkSize: {
                            get: function () {
                                if (!this.lengthKnown) {
                                    this.cacheLength();
                                }
                                return this._chunkSize;
                            }
                        }
                    });
                    var properties = { isDevice: false, contents: lazyArray };
                } else {
                    var properties = { isDevice: false, url: url };
                }
                var node = FS.createFile(
                    parent,
                    name,
                    properties,
                    canRead,
                    canWrite
                );
                if (properties.contents) {
                    node.contents = properties.contents;
                } else if (properties.url) {
                    node.contents = null;
                    node.url = properties.url;
                }
                Object.defineProperties(node, {
                    usedBytes: {
                        get: function () {
                            return this.contents.length;
                        }
                    }
                });
                var stream_ops = {};
                var keys = Object.keys(node.stream_ops);
                keys.forEach(function (key) {
                    var fn = node.stream_ops[key];
                    stream_ops[key] = function forceLoadLazyFile() {
                        if (!FS.forceLoadFile(node)) {
                            throw new FS.ErrnoError(29);
                        }
                        return fn.apply(null, arguments);
                    };
                });
                stream_ops.read = function stream_ops_read(
                    stream,
                    buffer,
                    offset,
                    length,
                    position
                ) {
                    if (!FS.forceLoadFile(node)) {
                        throw new FS.ErrnoError(29);
                    }
                    var contents = stream.node.contents;
                    if (position >= contents.length) return 0;
                    var size = Math.min(contents.length - position, length);
                    if (contents.slice) {
                        for (var i = 0; i < size; i++) {
                            buffer[offset + i] = contents[position + i];
                        }
                    } else {
                        for (var i = 0; i < size; i++) {
                            buffer[offset + i] = contents.get(position + i);
                        }
                    }
                    return size;
                };
                node.stream_ops = stream_ops;
                return node;
            },
            createPreloadedFile: function (
                parent,
                name,
                url,
                canRead,
                canWrite,
                onload,
                onerror,
                dontCreateFile,
                canOwn,
                preFinish
            ) {
                Browser.init();
                var fullname = name
                    ? PATH_FS.resolve(PATH.join2(parent, name))
                    : parent;
                var dep = getUniqueRunDependency("cp " + fullname);
                function processData(byteArray) {
                    function finish(byteArray) {
                        if (preFinish) preFinish();
                        if (!dontCreateFile) {
                            FS.createDataFile(
                                parent,
                                name,
                                byteArray,
                                canRead,
                                canWrite,
                                canOwn
                            );
                        }
                        if (onload) onload();
                        removeRunDependency(dep);
                    }
                    var handled = false;
                    Module["preloadPlugins"].forEach(function (plugin) {
                        if (handled) return;
                        if (plugin["canHandle"](fullname)) {
                            plugin["handle"](
                                byteArray,
                                fullname,
                                finish,
                                function () {
                                    if (onerror) onerror();
                                    removeRunDependency(dep);
                                }
                            );
                            handled = true;
                        }
                    });
                    if (!handled) finish(byteArray);
                }
                addRunDependency(dep);
                if (typeof url == "string") {
                    Browser.asyncLoad(
                        url,
                        function (byteArray) {
                            processData(byteArray);
                        },
                        onerror
                    );
                } else {
                    processData(url);
                }
            },
            indexedDB: function () {
                return (
                    window.indexedDB ||
                    window.mozIndexedDB ||
                    window.webkitIndexedDB ||
                    window.msIndexedDB
                );
            },
            DB_NAME: function () {
                return "EM_FS_" + window.location.pathname;
            },
            DB_VERSION: 20,
            DB_STORE_NAME: "FILE_DATA",
            saveFilesToDB: function (paths, onload, onerror) {
                onload = onload || function () {};
                onerror = onerror || function () {};
                var indexedDB = FS.indexedDB();
                try {
                    var openRequest = indexedDB.open(
                        FS.DB_NAME(),
                        FS.DB_VERSION
                    );
                } catch (e) {
                    return onerror(e);
                }
                openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
                    out("creating db");
                    var db = openRequest.result;
                    db.createObjectStore(FS.DB_STORE_NAME);
                };
                openRequest.onsuccess = function openRequest_onsuccess() {
                    var db = openRequest.result;
                    var transaction = db.transaction(
                        [FS.DB_STORE_NAME],
                        "readwrite"
                    );
                    var files = transaction.objectStore(FS.DB_STORE_NAME);
                    var ok = 0,
                        fail = 0,
                        total = paths.length;
                    function finish() {
                        if (fail == 0) onload();
                        else onerror();
                    }
                    paths.forEach(function (path) {
                        var putRequest = files.put(
                            FS.analyzePath(path).object.contents,
                            path
                        );
                        putRequest.onsuccess = function putRequest_onsuccess() {
                            ok++;
                            if (ok + fail == total) finish();
                        };
                        putRequest.onerror = function putRequest_onerror() {
                            fail++;
                            if (ok + fail == total) finish();
                        };
                    });
                    transaction.onerror = onerror;
                };
                openRequest.onerror = onerror;
            },
            loadFilesFromDB: function (paths, onload, onerror) {
                onload = onload || function () {};
                onerror = onerror || function () {};
                var indexedDB = FS.indexedDB();
                try {
                    var openRequest = indexedDB.open(
                        FS.DB_NAME(),
                        FS.DB_VERSION
                    );
                } catch (e) {
                    return onerror(e);
                }
                openRequest.onupgradeneeded = onerror;
                openRequest.onsuccess = function openRequest_onsuccess() {
                    var db = openRequest.result;
                    try {
                        var transaction = db.transaction(
                            [FS.DB_STORE_NAME],
                            "readonly"
                        );
                    } catch (e) {
                        onerror(e);
                        return;
                    }
                    var files = transaction.objectStore(FS.DB_STORE_NAME);
                    var ok = 0,
                        fail = 0,
                        total = paths.length;
                    function finish() {
                        if (fail == 0) onload();
                        else onerror();
                    }
                    paths.forEach(function (path) {
                        var getRequest = files.get(path);
                        getRequest.onsuccess = function getRequest_onsuccess() {
                            if (FS.analyzePath(path).exists) {
                                FS.unlink(path);
                            }
                            FS.createDataFile(
                                PATH.dirname(path),
                                PATH.basename(path),
                                getRequest.result,
                                true,
                                true,
                                true
                            );
                            ok++;
                            if (ok + fail == total) finish();
                        };
                        getRequest.onerror = function getRequest_onerror() {
                            fail++;
                            if (ok + fail == total) finish();
                        };
                    });
                    transaction.onerror = onerror;
                };
                openRequest.onerror = onerror;
            }
        };
        var SYSCALLS = {
            mappings: {},
            DEFAULT_POLLMASK: 5,
            umask: 511,
            calculateAt: function (dirfd, path) {
                if (path[0] !== "/") {
                    var dir;
                    if (dirfd === -100) {
                        dir = FS.cwd();
                    } else {
                        var dirstream = FS.getStream(dirfd);
                        if (!dirstream) throw new FS.ErrnoError(8);
                        dir = dirstream.path;
                    }
                    path = PATH.join2(dir, path);
                }
                return path;
            },
            doStat: function (func, path, buf) {
                try {
                    var stat = func(path);
                } catch (e) {
                    if (
                        e &&
                        e.node &&
                        PATH.normalize(path) !==
                            PATH.normalize(FS.getPath(e.node))
                    ) {
                        return -54;
                    }
                    throw e;
                }
                HEAP32[buf >> 2] = stat.dev;
                HEAP32[(buf + 4) >> 2] = 0;
                HEAP32[(buf + 8) >> 2] = stat.ino;
                HEAP32[(buf + 12) >> 2] = stat.mode;
                HEAP32[(buf + 16) >> 2] = stat.nlink;
                HEAP32[(buf + 20) >> 2] = stat.uid;
                HEAP32[(buf + 24) >> 2] = stat.gid;
                HEAP32[(buf + 28) >> 2] = stat.rdev;
                HEAP32[(buf + 32) >> 2] = 0;
                (tempI64 = [
                    stat.size >>> 0,
                    ((tempDouble = stat.size),
                    +Math_abs(tempDouble) >= 1
                        ? tempDouble > 0
                            ? (Math_min(
                                  +Math_floor(tempDouble / 4294967296),
                                  4294967295
                              ) |
                                  0) >>>
                              0
                            : ~~+Math_ceil(
                                  (tempDouble - +(~~tempDouble >>> 0)) /
                                      4294967296
                              ) >>> 0
                        : 0)
                ]),
                    (HEAP32[(buf + 40) >> 2] = tempI64[0]),
                    (HEAP32[(buf + 44) >> 2] = tempI64[1]);
                HEAP32[(buf + 48) >> 2] = 4096;
                HEAP32[(buf + 52) >> 2] = stat.blocks;
                HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
                HEAP32[(buf + 60) >> 2] = 0;
                HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
                HEAP32[(buf + 68) >> 2] = 0;
                HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
                HEAP32[(buf + 76) >> 2] = 0;
                (tempI64 = [
                    stat.ino >>> 0,
                    ((tempDouble = stat.ino),
                    +Math_abs(tempDouble) >= 1
                        ? tempDouble > 0
                            ? (Math_min(
                                  +Math_floor(tempDouble / 4294967296),
                                  4294967295
                              ) |
                                  0) >>>
                              0
                            : ~~+Math_ceil(
                                  (tempDouble - +(~~tempDouble >>> 0)) /
                                      4294967296
                              ) >>> 0
                        : 0)
                ]),
                    (HEAP32[(buf + 80) >> 2] = tempI64[0]),
                    (HEAP32[(buf + 84) >> 2] = tempI64[1]);
                return 0;
            },
            doMsync: function (addr, stream, len, flags, offset) {
                var buffer = HEAPU8.slice(addr, addr + len);
                FS.msync(stream, buffer, offset, len, flags);
            },
            doMkdir: function (path, mode) {
                path = PATH.normalize(path);
                if (path[path.length - 1] === "/")
                    path = path.substr(0, path.length - 1);
                FS.mkdir(path, mode, 0);
                return 0;
            },
            doMknod: function (path, mode, dev) {
                switch (mode & 61440) {
                    case 32768:
                    case 8192:
                    case 24576:
                    case 4096:
                    case 49152:
                        break;
                    default:
                        return -28;
                }
                FS.mknod(path, mode, dev);
                return 0;
            },
            doReadlink: function (path, buf, bufsize) {
                if (bufsize <= 0) return -28;
                var ret = FS.readlink(path);
                var len = Math.min(bufsize, lengthBytesUTF8(ret));
                var endChar = HEAP8[buf + len];
                stringToUTF8(ret, buf, bufsize + 1);
                HEAP8[buf + len] = endChar;
                return len;
            },
            doAccess: function (path, amode) {
                if (amode & ~7) {
                    return -28;
                }
                var node;
                var lookup = FS.lookupPath(path, { follow: true });
                node = lookup.node;
                if (!node) {
                    return -44;
                }
                var perms = "";
                if (amode & 4) perms += "r";
                if (amode & 2) perms += "w";
                if (amode & 1) perms += "x";
                if (perms && FS.nodePermissions(node, perms)) {
                    return -2;
                }
                return 0;
            },
            doDup: function (path, flags, suggestFD) {
                var suggest = FS.getStream(suggestFD);
                if (suggest) FS.close(suggest);
                return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
            },
            doReadv: function (stream, iov, iovcnt, offset) {
                var ret = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAP32[(iov + i * 8) >> 2];
                    var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
                    var curr = FS.read(stream, HEAP8, ptr, len, offset);
                    if (curr < 0) return -1;
                    ret += curr;
                    if (curr < len) break;
                }
                return ret;
            },
            doWritev: function (stream, iov, iovcnt, offset) {
                var ret = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAP32[(iov + i * 8) >> 2];
                    var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
                    var curr = FS.write(stream, HEAP8, ptr, len, offset);
                    if (curr < 0) return -1;
                    ret += curr;
                }
                return ret;
            },
            varargs: undefined,
            get: function () {
                SYSCALLS.varargs += 4;
                var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
                return ret;
            },
            getStr: function (ptr) {
                var ret = UTF8ToString(ptr);
                return ret;
            },
            getStreamFromFD: function (fd) {
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                return stream;
            },
            get64: function (low, high) {
                return low;
            }
        };
        function ___sys_access(path, amode) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(1, 1, path, amode);
            try {
                path = SYSCALLS.getStr(path);
                return SYSCALLS.doAccess(path, amode);
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_fcntl64(fd, cmd, varargs) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    2,
                    1,
                    fd,
                    cmd,
                    varargs
                );
            SYSCALLS.varargs = varargs;
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                switch (cmd) {
                    case 0: {
                        var arg = SYSCALLS.get();
                        if (arg < 0) {
                            return -28;
                        }
                        var newStream;
                        newStream = FS.open(stream.path, stream.flags, 0, arg);
                        return newStream.fd;
                    }
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return stream.flags;
                    case 4: {
                        var arg = SYSCALLS.get();
                        stream.flags |= arg;
                        return 0;
                    }
                    case 12: {
                        var arg = SYSCALLS.get();
                        var offset = 0;
                        HEAP16[(arg + offset) >> 1] = 2;
                        return 0;
                    }
                    case 13:
                    case 14:
                        return 0;
                    case 16:
                    case 8:
                        return -28;
                    case 9:
                        setErrNo(28);
                        return -1;
                    default: {
                        return -28;
                    }
                }
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_fstat64(fd, buf) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(3, 1, fd, buf);
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                return SYSCALLS.doStat(FS.stat, stream.path, buf);
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_getdents64(fd, dirp, count) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    4,
                    1,
                    fd,
                    dirp,
                    count
                );
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                if (!stream.getdents) {
                    stream.getdents = FS.readdir(stream.path);
                }
                var struct_size = 280;
                var pos = 0;
                var off = FS.llseek(stream, 0, 1);
                var idx = Math.floor(off / struct_size);
                while (
                    idx < stream.getdents.length &&
                    pos + struct_size <= count
                ) {
                    var id;
                    var type;
                    var name = stream.getdents[idx];
                    if (name[0] === ".") {
                        id = 1;
                        type = 4;
                    } else {
                        var child = FS.lookupNode(stream.node, name);
                        id = child.id;
                        type = FS.isChrdev(child.mode)
                            ? 2
                            : FS.isDir(child.mode)
                            ? 4
                            : FS.isLink(child.mode)
                            ? 10
                            : 8;
                    }
                    (tempI64 = [
                        id >>> 0,
                        ((tempDouble = id),
                        +Math_abs(tempDouble) >= 1
                            ? tempDouble > 0
                                ? (Math_min(
                                      +Math_floor(tempDouble / 4294967296),
                                      4294967295
                                  ) |
                                      0) >>>
                                  0
                                : ~~+Math_ceil(
                                      (tempDouble - +(~~tempDouble >>> 0)) /
                                          4294967296
                                  ) >>> 0
                            : 0)
                    ]),
                        (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
                        (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]);
                    (tempI64 = [
                        ((idx + 1) * struct_size) >>> 0,
                        ((tempDouble = (idx + 1) * struct_size),
                        +Math_abs(tempDouble) >= 1
                            ? tempDouble > 0
                                ? (Math_min(
                                      +Math_floor(tempDouble / 4294967296),
                                      4294967295
                                  ) |
                                      0) >>>
                                  0
                                : ~~+Math_ceil(
                                      (tempDouble - +(~~tempDouble >>> 0)) /
                                          4294967296
                                  ) >>> 0
                            : 0)
                    ]),
                        (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
                        (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]);
                    HEAP16[(dirp + pos + 16) >> 1] = 280;
                    HEAP8[(dirp + pos + 18) >> 0] = type;
                    stringToUTF8(name, dirp + pos + 19, 256);
                    pos += struct_size;
                    idx += 1;
                }
                FS.llseek(stream, idx * struct_size, 0);
                return pos;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_ioctl(fd, op, varargs) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    5,
                    1,
                    fd,
                    op,
                    varargs
                );
            SYSCALLS.varargs = varargs;
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                switch (op) {
                    case 21509:
                    case 21505: {
                        if (!stream.tty) return -59;
                        return 0;
                    }
                    case 21510:
                    case 21511:
                    case 21512:
                    case 21506:
                    case 21507:
                    case 21508: {
                        if (!stream.tty) return -59;
                        return 0;
                    }
                    case 21519: {
                        if (!stream.tty) return -59;
                        var argp = SYSCALLS.get();
                        HEAP32[argp >> 2] = 0;
                        return 0;
                    }
                    case 21520: {
                        if (!stream.tty) return -59;
                        return -28;
                    }
                    case 21531: {
                        var argp = SYSCALLS.get();
                        return FS.ioctl(stream, op, argp);
                    }
                    case 21523: {
                        if (!stream.tty) return -59;
                        return 0;
                    }
                    case 21524: {
                        if (!stream.tty) return -59;
                        return 0;
                    }
                    default:
                        abort("bad ioctl syscall " + op);
                }
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_lstat64(path, buf) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(6, 1, path, buf);
            try {
                path = SYSCALLS.getStr(path);
                return SYSCALLS.doStat(FS.lstat, path, buf);
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_madvise1(addr, length, advice) {
            return 0;
        }
        function ___sys_nice(inc) {
            return -63;
        }
        function ___sys_open(path, flags, varargs) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    7,
                    1,
                    path,
                    flags,
                    varargs
                );
            SYSCALLS.varargs = varargs;
            try {
                var pathname = SYSCALLS.getStr(path);
                var mode = SYSCALLS.get();
                var stream = FS.open(pathname, flags, mode);
                return stream.fd;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_read(fd, buf, count) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    8,
                    1,
                    fd,
                    buf,
                    count
                );
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                return FS.read(stream, HEAP8, buf, count);
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_rename(old_path, new_path) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    9,
                    1,
                    old_path,
                    new_path
                );
            try {
                old_path = SYSCALLS.getStr(old_path);
                new_path = SYSCALLS.getStr(new_path);
                FS.rename(old_path, new_path);
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_rmdir(path) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(10, 1, path);
            try {
                path = SYSCALLS.getStr(path);
                FS.rmdir(path);
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_stat64(path, buf) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(11, 1, path, buf);
            try {
                path = SYSCALLS.getStr(path);
                return SYSCALLS.doStat(FS.stat, path, buf);
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function ___sys_unlink(path) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(12, 1, path);
            try {
                path = SYSCALLS.getStr(path);
                FS.unlink(path);
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return -e.errno;
            }
        }
        function __emscripten_notify_thread_queue(
            targetThreadId,
            mainThreadId
        ) {
            if (targetThreadId == mainThreadId) {
                postMessage({ cmd: "processQueuedMainThreadWork" });
            } else if (ENVIRONMENT_IS_PTHREAD) {
                postMessage({
                    targetThread: targetThreadId,
                    cmd: "processThreadQueue"
                });
            } else {
                var pthread = PThread.pthreads[targetThreadId];
                var worker = pthread && pthread.worker;
                if (!worker) {
                    return;
                }
                worker.postMessage({ cmd: "processThreadQueue" });
            }
            return 1;
        }
        function _abort() {
            abort();
        }
        function _clock() {
            if (_clock.start === undefined) _clock.start = Date.now();
            return ((Date.now() - _clock.start) * (1e6 / 1e3)) | 0;
        }
        function _emscripten_check_blocking_allowed() {
            if (ENVIRONMENT_IS_NODE) return;
            if (ENVIRONMENT_IS_PTHREAD) return;
            warnOnce(
                "Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"
            );
        }
        function _emscripten_conditional_set_current_thread_status(
            expectedStatus,
            newStatus
        ) {
            expectedStatus = expectedStatus | 0;
            newStatus = newStatus | 0;
        }
        function _emscripten_futex_wait(addr, val, timeout) {
            if (addr <= 0 || addr > HEAP8.length || addr & (3 != 0)) return -28;
            if (ENVIRONMENT_IS_WORKER) {
                var ret = Atomics.wait(HEAP32, addr >> 2, val, timeout);
                if (ret === "timed-out") return -73;
                if (ret === "not-equal") return -6;
                if (ret === "ok") return 0;
                throw "Atomics.wait returned an unexpected value " + ret;
            } else {
                var loadedVal = Atomics.load(HEAP32, addr >> 2);
                if (val != loadedVal) return -6;
                var tNow = performance.now();
                var tEnd = tNow + timeout;
                Atomics.store(
                    HEAP32,
                    __main_thread_futex_wait_address >> 2,
                    addr
                );
                var ourWaitAddress = addr;
                while (addr == ourWaitAddress) {
                    tNow = performance.now();
                    if (tNow > tEnd) {
                        return -73;
                    }
                    _emscripten_main_thread_process_queued_calls();
                    addr = Atomics.load(
                        HEAP32,
                        __main_thread_futex_wait_address >> 2
                    );
                }
                return 0;
            }
        }
        function _emscripten_is_main_browser_thread() {
            return __pthread_is_main_browser_thread | 0;
        }
        function _emscripten_is_main_runtime_thread() {
            return __pthread_is_main_runtime_thread | 0;
        }
        function _emscripten_memcpy_big(dest, src, num) {
            HEAPU8.copyWithin(dest, src, src + num);
        }
        function _emscripten_num_logical_cores() {
            return navigator["hardwareConcurrency"];
        }
        function _emscripten_proxy_to_main_thread_js(index, sync) {
            var numCallArgs = arguments.length - 2;
            var stack = stackSave();
            var args = stackAlloc(numCallArgs * 8);
            var b = args >> 3;
            for (var i = 0; i < numCallArgs; i++) {
                HEAPF64[b + i] = arguments[2 + i];
            }
            var ret = _emscripten_run_in_main_runtime_thread_js(
                index,
                numCallArgs,
                args,
                sync
            );
            stackRestore(stack);
            return ret;
        }
        var _emscripten_receive_on_main_thread_js_callArgs = [];
        function readAsmConstArgs(sigPtr, buf) {
            if (!readAsmConstArgs.array) {
                readAsmConstArgs.array = [];
            }
            var args = readAsmConstArgs.array;
            args.length = 0;
            var ch;
            while ((ch = HEAPU8[sigPtr++])) {
                if (ch === 100 || ch === 102) {
                    buf = (buf + 7) & ~7;
                    args.push(HEAPF64[buf >> 3]);
                    buf += 8;
                } else {
                    buf = (buf + 3) & ~3;
                    args.push(HEAP32[buf >> 2]);
                    buf += 4;
                }
            }
            return args;
        }
        function _emscripten_receive_on_main_thread_js(
            index,
            numCallArgs,
            args
        ) {
            _emscripten_receive_on_main_thread_js_callArgs.length = numCallArgs;
            var b = args >> 3;
            for (var i = 0; i < numCallArgs; i++) {
                _emscripten_receive_on_main_thread_js_callArgs[i] =
                    HEAPF64[b + i];
            }
            var isEmAsmConst = index < 0;
            var func = !isEmAsmConst
                ? proxiedFunctionTable[index]
                : ASM_CONSTS[-index - 1];
            if (isEmAsmConst) {
                var sigPtr = _emscripten_receive_on_main_thread_js_callArgs[1];
                var varargPtr =
                    _emscripten_receive_on_main_thread_js_callArgs[2];
                var constArgs = readAsmConstArgs(sigPtr, varargPtr);
                return func.apply(null, constArgs);
            }
            return func.apply(
                null,
                _emscripten_receive_on_main_thread_js_callArgs
            );
        }
        function abortOnCannotGrowMemory(requestedSize) {
            abort("OOM");
        }
        function _emscripten_resize_heap(requestedSize) {
            requestedSize = requestedSize >>> 0;
            abortOnCannotGrowMemory(requestedSize);
        }
        var JSEvents = {
            keyEvent: 0,
            mouseEvent: 0,
            wheelEvent: 0,
            uiEvent: 0,
            focusEvent: 0,
            deviceOrientationEvent: 0,
            deviceMotionEvent: 0,
            fullscreenChangeEvent: 0,
            pointerlockChangeEvent: 0,
            visibilityChangeEvent: 0,
            touchEvent: 0,
            previousFullscreenElement: null,
            previousScreenX: null,
            previousScreenY: null,
            removeEventListenersRegistered: false,
            removeAllEventListeners: function () {
                for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
                    JSEvents._removeHandler(i);
                }
                JSEvents.eventHandlers = [];
                JSEvents.deferredCalls = [];
            },
            registerRemoveEventListeners: function () {
                if (!JSEvents.removeEventListenersRegistered) {
                    __ATEXIT__.push(JSEvents.removeAllEventListeners);
                    JSEvents.removeEventListenersRegistered = true;
                }
            },
            deferredCalls: [],
            deferCall: function (targetFunction, precedence, argsList) {
                function arraysHaveEqualContent(arrA, arrB) {
                    if (arrA.length != arrB.length) return false;
                    for (var i in arrA) {
                        if (arrA[i] != arrB[i]) return false;
                    }
                    return true;
                }
                for (var i in JSEvents.deferredCalls) {
                    var call = JSEvents.deferredCalls[i];
                    if (
                        call.targetFunction == targetFunction &&
                        arraysHaveEqualContent(call.argsList, argsList)
                    ) {
                        return;
                    }
                }
                JSEvents.deferredCalls.push({
                    targetFunction: targetFunction,
                    precedence: precedence,
                    argsList: argsList
                });
                JSEvents.deferredCalls.sort(function (x, y) {
                    return x.precedence < y.precedence;
                });
            },
            removeDeferredCalls: function (targetFunction) {
                for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
                    if (
                        JSEvents.deferredCalls[i].targetFunction ==
                        targetFunction
                    ) {
                        JSEvents.deferredCalls.splice(i, 1);
                        --i;
                    }
                }
            },
            canPerformEventHandlerRequests: function () {
                return (
                    JSEvents.inEventHandler &&
                    JSEvents.currentEventHandler.allowsDeferredCalls
                );
            },
            runDeferredCalls: function () {
                if (!JSEvents.canPerformEventHandlerRequests()) {
                    return;
                }
                for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
                    var call = JSEvents.deferredCalls[i];
                    JSEvents.deferredCalls.splice(i, 1);
                    --i;
                    call.targetFunction.apply(null, call.argsList);
                }
            },
            inEventHandler: 0,
            currentEventHandler: null,
            eventHandlers: [],
            removeAllHandlersOnTarget: function (target, eventTypeString) {
                for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                    if (
                        JSEvents.eventHandlers[i].target == target &&
                        (!eventTypeString ||
                            eventTypeString ==
                                JSEvents.eventHandlers[i].eventTypeString)
                    ) {
                        JSEvents._removeHandler(i--);
                    }
                }
            },
            _removeHandler: function (i) {
                var h = JSEvents.eventHandlers[i];
                h.target.removeEventListener(
                    h.eventTypeString,
                    h.eventListenerFunc,
                    h.useCapture
                );
                JSEvents.eventHandlers.splice(i, 1);
            },
            registerOrRemoveHandler: function (eventHandler) {
                var jsEventHandler = function jsEventHandler(event) {
                    ++JSEvents.inEventHandler;
                    JSEvents.currentEventHandler = eventHandler;
                    JSEvents.runDeferredCalls();
                    eventHandler.handlerFunc(event);
                    JSEvents.runDeferredCalls();
                    --JSEvents.inEventHandler;
                };
                if (eventHandler.callbackfunc) {
                    eventHandler.eventListenerFunc = jsEventHandler;
                    eventHandler.target.addEventListener(
                        eventHandler.eventTypeString,
                        jsEventHandler,
                        eventHandler.useCapture
                    );
                    JSEvents.eventHandlers.push(eventHandler);
                    JSEvents.registerRemoveEventListeners();
                } else {
                    for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                        if (
                            JSEvents.eventHandlers[i].target ==
                                eventHandler.target &&
                            JSEvents.eventHandlers[i].eventTypeString ==
                                eventHandler.eventTypeString
                        ) {
                            JSEvents._removeHandler(i--);
                        }
                    }
                }
            },
            queueEventHandlerOnThread_iiii: function (
                targetThread,
                eventHandlerFunc,
                eventTypeId,
                eventData,
                userData
            ) {
                var stackTop = stackSave();
                var varargs = stackAlloc(12);
                HEAP32[varargs >> 2] = eventTypeId;
                HEAP32[(varargs + 4) >> 2] = eventData;
                HEAP32[(varargs + 8) >> 2] = userData;
                __emscripten_call_on_thread(
                    0,
                    targetThread,
                    637534208,
                    eventHandlerFunc,
                    eventData,
                    varargs
                );
                stackRestore(stackTop);
            },
            getTargetThreadForEventCallback: function (targetThread) {
                switch (targetThread) {
                    case 1:
                        return 0;
                    case 2:
                        return PThread.currentProxiedOperationCallerThread;
                    default:
                        return targetThread;
                }
            },
            getNodeNameForTarget: function (target) {
                if (!target) return "";
                if (target == window) return "#window";
                if (target == screen) return "#screen";
                return target && target.nodeName ? target.nodeName : "";
            },
            fullscreenEnabled: function () {
                return (
                    document.fullscreenEnabled ||
                    document.webkitFullscreenEnabled
                );
            }
        };
        function stringToNewUTF8(jsString) {
            var length = lengthBytesUTF8(jsString) + 1;
            var cString = _malloc(length);
            stringToUTF8(jsString, cString, length);
            return cString;
        }
        function _emscripten_set_offscreencanvas_size_on_target_thread_js(
            targetThread,
            targetCanvas,
            width,
            height
        ) {
            var stackTop = stackSave();
            var varargs = stackAlloc(12);
            var targetCanvasPtr = 0;
            if (targetCanvas) {
                targetCanvasPtr = stringToNewUTF8(targetCanvas);
            }
            HEAP32[varargs >> 2] = targetCanvasPtr;
            HEAP32[(varargs + 4) >> 2] = width;
            HEAP32[(varargs + 8) >> 2] = height;
            __emscripten_call_on_thread(
                0,
                targetThread,
                657457152,
                0,
                targetCanvasPtr,
                varargs
            );
            stackRestore(stackTop);
        }
        function _emscripten_set_offscreencanvas_size_on_target_thread(
            targetThread,
            targetCanvas,
            width,
            height
        ) {
            targetCanvas = targetCanvas ? UTF8ToString(targetCanvas) : "";
            _emscripten_set_offscreencanvas_size_on_target_thread_js(
                targetThread,
                targetCanvas,
                width,
                height
            );
        }
        function __maybeCStringToJsString(cString) {
            return cString > 2 ? UTF8ToString(cString) : cString;
        }
        var specialHTMLTargets = [
            0,
            typeof document !== "undefined" ? document : 0,
            typeof window !== "undefined" ? window : 0
        ];
        function __findEventTarget(target) {
            target = __maybeCStringToJsString(target);
            var domElement =
                specialHTMLTargets[target] ||
                (typeof document !== "undefined"
                    ? document.querySelector(target)
                    : undefined);
            return domElement;
        }
        function __findCanvasEventTarget(target) {
            return __findEventTarget(target);
        }
        function _emscripten_set_canvas_element_size_calling_thread(
            target,
            width,
            height
        ) {
            var canvas = __findCanvasEventTarget(target);
            if (!canvas) return -4;
            if (canvas.canvasSharedPtr) {
                HEAP32[canvas.canvasSharedPtr >> 2] = width;
                HEAP32[(canvas.canvasSharedPtr + 4) >> 2] = height;
            }
            if (canvas.offscreenCanvas || !canvas.controlTransferredOffscreen) {
                if (canvas.offscreenCanvas) canvas = canvas.offscreenCanvas;
                var autoResizeViewport = false;
                if (canvas.GLctxObject && canvas.GLctxObject.GLctx) {
                    var prevViewport = canvas.GLctxObject.GLctx.getParameter(
                        2978
                    );
                    autoResizeViewport =
                        prevViewport[0] === 0 &&
                        prevViewport[1] === 0 &&
                        prevViewport[2] === canvas.width &&
                        prevViewport[3] === canvas.height;
                }
                canvas.width = width;
                canvas.height = height;
                if (autoResizeViewport) {
                    canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
                }
            } else if (canvas.canvasSharedPtr) {
                var targetThread = HEAP32[(canvas.canvasSharedPtr + 8) >> 2];
                _emscripten_set_offscreencanvas_size_on_target_thread(
                    targetThread,
                    target,
                    width,
                    height
                );
                return 1;
            } else {
                return -4;
            }
            return 0;
        }
        function _emscripten_set_canvas_element_size_main_thread(
            target,
            width,
            height
        ) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    13,
                    1,
                    target,
                    width,
                    height
                );
            return _emscripten_set_canvas_element_size_calling_thread(
                target,
                width,
                height
            );
        }
        function _emscripten_set_canvas_element_size(target, width, height) {
            var canvas = __findCanvasEventTarget(target);
            if (canvas) {
                return _emscripten_set_canvas_element_size_calling_thread(
                    target,
                    width,
                    height
                );
            } else {
                return _emscripten_set_canvas_element_size_main_thread(
                    target,
                    width,
                    height
                );
            }
        }
        function _emscripten_set_current_thread_status(newStatus) {
            newStatus = newStatus | 0;
        }
        function __webgl_enable_ANGLE_instanced_arrays(ctx) {
            var ext = ctx.getExtension("ANGLE_instanced_arrays");
            if (ext) {
                ctx["vertexAttribDivisor"] = function (index, divisor) {
                    ext["vertexAttribDivisorANGLE"](index, divisor);
                };
                ctx["drawArraysInstanced"] = function (
                    mode,
                    first,
                    count,
                    primcount
                ) {
                    ext["drawArraysInstancedANGLE"](
                        mode,
                        first,
                        count,
                        primcount
                    );
                };
                ctx["drawElementsInstanced"] = function (
                    mode,
                    count,
                    type,
                    indices,
                    primcount
                ) {
                    ext["drawElementsInstancedANGLE"](
                        mode,
                        count,
                        type,
                        indices,
                        primcount
                    );
                };
                return 1;
            }
        }
        function __webgl_enable_OES_vertex_array_object(ctx) {
            var ext = ctx.getExtension("OES_vertex_array_object");
            if (ext) {
                ctx["createVertexArray"] = function () {
                    return ext["createVertexArrayOES"]();
                };
                ctx["deleteVertexArray"] = function (vao) {
                    ext["deleteVertexArrayOES"](vao);
                };
                ctx["bindVertexArray"] = function (vao) {
                    ext["bindVertexArrayOES"](vao);
                };
                ctx["isVertexArray"] = function (vao) {
                    return ext["isVertexArrayOES"](vao);
                };
                return 1;
            }
        }
        function __webgl_enable_WEBGL_draw_buffers(ctx) {
            var ext = ctx.getExtension("WEBGL_draw_buffers");
            if (ext) {
                ctx["drawBuffers"] = function (n, bufs) {
                    ext["drawBuffersWEBGL"](n, bufs);
                };
                return 1;
            }
        }
        var GL = {
            counter: 1,
            lastError: 0,
            buffers: [],
            mappedBuffers: {},
            programs: [],
            framebuffers: [],
            renderbuffers: [],
            textures: [],
            uniforms: [],
            shaders: [],
            vaos: [],
            contexts: {},
            currentContext: null,
            offscreenCanvases: {},
            timerQueriesEXT: [],
            programInfos: {},
            stringCache: {},
            unpackAlignment: 4,
            init: function () {
                var miniTempFloatBuffer = new Float32Array(
                    GL.MINI_TEMP_BUFFER_SIZE
                );
                for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
                    GL.miniTempBufferFloatViews[
                        i
                    ] = miniTempFloatBuffer.subarray(0, i + 1);
                }
                var miniTempIntBuffer = new Int32Array(
                    GL.MINI_TEMP_BUFFER_SIZE
                );
                for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
                    GL.miniTempBufferIntViews[i] = miniTempIntBuffer.subarray(
                        0,
                        i + 1
                    );
                }
            },
            recordError: function recordError(errorCode) {
                if (!GL.lastError) {
                    GL.lastError = errorCode;
                }
            },
            getNewId: function (table) {
                var ret = GL.counter++;
                for (var i = table.length; i < ret; i++) {
                    table[i] = null;
                }
                return ret;
            },
            MINI_TEMP_BUFFER_SIZE: 256,
            miniTempBufferFloatViews: [0],
            miniTempBufferIntViews: [0],
            getSource: function (shader, count, string, length) {
                var source = "";
                for (var i = 0; i < count; ++i) {
                    var len = length ? HEAP32[(length + i * 4) >> 2] : -1;
                    source += UTF8ToString(
                        HEAP32[(string + i * 4) >> 2],
                        len < 0 ? undefined : len
                    );
                }
                return source;
            },
            createContext: function (canvas, webGLContextAttributes) {
                var ctx = canvas.getContext("webgl", webGLContextAttributes);
                if (!ctx) return 0;
                var handle = GL.registerContext(ctx, webGLContextAttributes);
                return handle;
            },
            registerContext: function (ctx, webGLContextAttributes) {
                var handle = _malloc(8);
                HEAP32[(handle + 4) >> 2] = _pthread_self();
                var context = {
                    handle: handle,
                    attributes: webGLContextAttributes,
                    version: webGLContextAttributes.majorVersion,
                    GLctx: ctx
                };
                if (ctx.canvas) ctx.canvas.GLctxObject = context;
                GL.contexts[handle] = context;
                if (
                    typeof webGLContextAttributes.enableExtensionsByDefault ===
                        "undefined" ||
                    webGLContextAttributes.enableExtensionsByDefault
                ) {
                    GL.initExtensions(context);
                }
                return handle;
            },
            makeContextCurrent: function (contextHandle) {
                GL.currentContext = GL.contexts[contextHandle];
                Module.ctx = GLctx =
                    GL.currentContext && GL.currentContext.GLctx;
                return !(contextHandle && !GLctx);
            },
            getContext: function (contextHandle) {
                return GL.contexts[contextHandle];
            },
            deleteContext: function (contextHandle) {
                if (GL.currentContext === GL.contexts[contextHandle])
                    GL.currentContext = null;
                if (typeof JSEvents === "object")
                    JSEvents.removeAllHandlersOnTarget(
                        GL.contexts[contextHandle].GLctx.canvas
                    );
                if (
                    GL.contexts[contextHandle] &&
                    GL.contexts[contextHandle].GLctx.canvas
                )
                    GL.contexts[
                        contextHandle
                    ].GLctx.canvas.GLctxObject = undefined;
                _free(GL.contexts[contextHandle].handle);
                GL.contexts[contextHandle] = null;
            },
            initExtensions: function (context) {
                if (!context) context = GL.currentContext;
                if (context.initExtensionsDone) return;
                context.initExtensionsDone = true;
                var GLctx = context.GLctx;
                __webgl_enable_ANGLE_instanced_arrays(GLctx);
                __webgl_enable_OES_vertex_array_object(GLctx);
                __webgl_enable_WEBGL_draw_buffers(GLctx);
                GLctx.disjointTimerQueryExt = GLctx.getExtension(
                    "EXT_disjoint_timer_query"
                );
                var automaticallyEnabledExtensions = [
                    "OES_texture_float",
                    "OES_texture_half_float",
                    "OES_standard_derivatives",
                    "OES_vertex_array_object",
                    "WEBGL_compressed_texture_s3tc",
                    "WEBGL_depth_texture",
                    "OES_element_index_uint",
                    "EXT_texture_filter_anisotropic",
                    "EXT_frag_depth",
                    "WEBGL_draw_buffers",
                    "ANGLE_instanced_arrays",
                    "OES_texture_float_linear",
                    "OES_texture_half_float_linear",
                    "EXT_blend_minmax",
                    "EXT_shader_texture_lod",
                    "EXT_texture_norm16",
                    "WEBGL_compressed_texture_pvrtc",
                    "EXT_color_buffer_half_float",
                    "WEBGL_color_buffer_float",
                    "EXT_sRGB",
                    "WEBGL_compressed_texture_etc1",
                    "EXT_disjoint_timer_query",
                    "WEBGL_compressed_texture_etc",
                    "WEBGL_compressed_texture_astc",
                    "EXT_color_buffer_float",
                    "WEBGL_compressed_texture_s3tc_srgb",
                    "EXT_disjoint_timer_query_webgl2",
                    "WEBKIT_WEBGL_compressed_texture_pvrtc"
                ];
                var exts = GLctx.getSupportedExtensions() || [];
                exts.forEach(function (ext) {
                    if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
                        GLctx.getExtension(ext);
                    }
                });
            },
            populateUniformTable: function (program) {
                var p = GL.programs[program];
                var ptable = (GL.programInfos[program] = {
                    uniforms: {},
                    maxUniformLength: 0,
                    maxAttributeLength: -1,
                    maxUniformBlockNameLength: -1
                });
                var utable = ptable.uniforms;
                var numUniforms = GLctx.getProgramParameter(p, 35718);
                for (var i = 0; i < numUniforms; ++i) {
                    var u = GLctx.getActiveUniform(p, i);
                    var name = u.name;
                    ptable.maxUniformLength = Math.max(
                        ptable.maxUniformLength,
                        name.length + 1
                    );
                    if (name.slice(-1) == "]") {
                        name = name.slice(0, name.lastIndexOf("["));
                    }
                    var loc = GLctx.getUniformLocation(p, name);
                    if (loc) {
                        var id = GL.getNewId(GL.uniforms);
                        utable[name] = [u.size, id];
                        GL.uniforms[id] = loc;
                        for (var j = 1; j < u.size; ++j) {
                            var n = name + "[" + j + "]";
                            loc = GLctx.getUniformLocation(p, n);
                            id = GL.getNewId(GL.uniforms);
                            GL.uniforms[id] = loc;
                        }
                    }
                }
            }
        };
        var __emscripten_webgl_power_preferences = [
            "default",
            "low-power",
            "high-performance"
        ];
        function _emscripten_webgl_do_create_context(target, attributes) {
            var contextAttributes = {};
            var a = attributes >> 2;
            contextAttributes["alpha"] = !!HEAP32[a + (0 >> 2)];
            contextAttributes["depth"] = !!HEAP32[a + (4 >> 2)];
            contextAttributes["stencil"] = !!HEAP32[a + (8 >> 2)];
            contextAttributes["antialias"] = !!HEAP32[a + (12 >> 2)];
            contextAttributes["premultipliedAlpha"] = !!HEAP32[a + (16 >> 2)];
            contextAttributes["preserveDrawingBuffer"] = !!HEAP32[
                a + (20 >> 2)
            ];
            var powerPreference = HEAP32[a + (24 >> 2)];
            contextAttributes["powerPreference"] =
                __emscripten_webgl_power_preferences[powerPreference];
            contextAttributes["failIfMajorPerformanceCaveat"] = !!HEAP32[
                a + (28 >> 2)
            ];
            contextAttributes.majorVersion = HEAP32[a + (32 >> 2)];
            contextAttributes.minorVersion = HEAP32[a + (36 >> 2)];
            contextAttributes.enableExtensionsByDefault = HEAP32[a + (40 >> 2)];
            contextAttributes.explicitSwapControl = HEAP32[a + (44 >> 2)];
            contextAttributes.proxyContextToMainThread = HEAP32[a + (48 >> 2)];
            contextAttributes.renderViaOffscreenBackBuffer =
                HEAP32[a + (52 >> 2)];
            var canvas = __findCanvasEventTarget(target);
            if (!canvas) {
                return -4;
            }
            if (contextAttributes.explicitSwapControl) {
                return -1;
            }
            var contextHandle = GL.createContext(canvas, contextAttributes);
            return contextHandle;
        }
        function _emscripten_webgl_create_context(a0, a1) {
            return _emscripten_webgl_do_create_context(a0, a1);
        }
        var ENV = {};
        function __getExecutableName() {
            return thisProgram || "./this.program";
        }
        function getEnvStrings() {
            if (!getEnvStrings.strings) {
                var env = {
                    USER: "web_user",
                    LOGNAME: "web_user",
                    PATH: "/",
                    PWD: "/",
                    HOME: "/home/web_user",
                    LANG:
                        (
                            (typeof navigator === "object" &&
                                navigator.languages &&
                                navigator.languages[0]) ||
                            "C"
                        ).replace("-", "_") + ".UTF-8",
                    _: __getExecutableName()
                };
                for (var x in ENV) {
                    env[x] = ENV[x];
                }
                var strings = [];
                for (var x in env) {
                    strings.push(x + "=" + env[x]);
                }
                getEnvStrings.strings = strings;
            }
            return getEnvStrings.strings;
        }
        function _environ_get(__environ, environ_buf) {
            var bufSize = 0;
            getEnvStrings().forEach(function (string, i) {
                var ptr = environ_buf + bufSize;
                HEAP32[(__environ + i * 4) >> 2] = ptr;
                writeAsciiToMemory(string, ptr);
                bufSize += string.length + 1;
            });
            return 0;
        }
        function _environ_sizes_get(penviron_count, penviron_buf_size) {
            var strings = getEnvStrings();
            HEAP32[penviron_count >> 2] = strings.length;
            var bufSize = 0;
            strings.forEach(function (string) {
                bufSize += string.length + 1;
            });
            HEAP32[penviron_buf_size >> 2] = bufSize;
            return 0;
        }
        function _exit(status) {
            exit(status);
        }
        function _fd_close(fd) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(14, 1, fd);
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                FS.close(stream);
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return e.errno;
            }
        }
        function _fd_fdstat_get(fd, pbuf) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(15, 1, fd, pbuf);
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var type = stream.tty
                    ? 2
                    : FS.isDir(stream.mode)
                    ? 3
                    : FS.isLink(stream.mode)
                    ? 7
                    : 4;
                HEAP8[pbuf >> 0] = type;
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return e.errno;
            }
        }
        function _fd_read(fd, iov, iovcnt, pnum) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    16,
                    1,
                    fd,
                    iov,
                    iovcnt,
                    pnum
                );
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var num = SYSCALLS.doReadv(stream, iov, iovcnt);
                HEAP32[pnum >> 2] = num;
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return e.errno;
            }
        }
        function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    17,
                    1,
                    fd,
                    offset_low,
                    offset_high,
                    whence,
                    newOffset
                );
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var HIGH_OFFSET = 4294967296;
                var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
                var DOUBLE_LIMIT = 9007199254740992;
                if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
                    return -61;
                }
                FS.llseek(stream, offset, whence);
                (tempI64 = [
                    stream.position >>> 0,
                    ((tempDouble = stream.position),
                    +Math_abs(tempDouble) >= 1
                        ? tempDouble > 0
                            ? (Math_min(
                                  +Math_floor(tempDouble / 4294967296),
                                  4294967295
                              ) |
                                  0) >>>
                              0
                            : ~~+Math_ceil(
                                  (tempDouble - +(~~tempDouble >>> 0)) /
                                      4294967296
                              ) >>> 0
                        : 0)
                ]),
                    (HEAP32[newOffset >> 2] = tempI64[0]),
                    (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
                if (stream.getdents && offset === 0 && whence === 0)
                    stream.getdents = null;
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return e.errno;
            }
        }
        function _fd_write(fd, iov, iovcnt, pnum) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(
                    18,
                    1,
                    fd,
                    iov,
                    iovcnt,
                    pnum
                );
            try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var num = SYSCALLS.doWritev(stream, iov, iovcnt);
                HEAP32[pnum >> 2] = num;
                return 0;
            } catch (e) {
                if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
                    abort(e);
                return e.errno;
            }
        }
        function _gettimeofday(ptr) {
            var now = Date.now();
            HEAP32[ptr >> 2] = (now / 1e3) | 0;
            HEAP32[(ptr + 4) >> 2] = ((now % 1e3) * 1e3) | 0;
            return 0;
        }
        var ___tm_timezone = (stringToUTF8("GMT", 1333056, 4), 1333056);
        function _gmtime_r(time, tmPtr) {
            var date = new Date(HEAP32[time >> 2] * 1e3);
            HEAP32[tmPtr >> 2] = date.getUTCSeconds();
            HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
            HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
            HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
            HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
            HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
            HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
            HEAP32[(tmPtr + 36) >> 2] = 0;
            HEAP32[(tmPtr + 32) >> 2] = 0;
            var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
            var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
            HEAP32[(tmPtr + 28) >> 2] = yday;
            HEAP32[(tmPtr + 40) >> 2] = ___tm_timezone;
            return tmPtr;
        }
        function _tzset() {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(19, 1);
            if (_tzset.called) return;
            _tzset.called = true;
            HEAP32[__get_timezone() >> 2] = new Date().getTimezoneOffset() * 60;
            var currentYear = new Date().getFullYear();
            var winter = new Date(currentYear, 0, 1);
            var summer = new Date(currentYear, 6, 1);
            HEAP32[__get_daylight() >> 2] = Number(
                winter.getTimezoneOffset() != summer.getTimezoneOffset()
            );
            function extractZone(date) {
                var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
                return match ? match[1] : "GMT";
            }
            var winterName = extractZone(winter);
            var summerName = extractZone(summer);
            var winterNamePtr = allocateUTF8(winterName);
            var summerNamePtr = allocateUTF8(summerName);
            if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
                HEAP32[__get_tzname() >> 2] = winterNamePtr;
                HEAP32[(__get_tzname() + 4) >> 2] = summerNamePtr;
            } else {
                HEAP32[__get_tzname() >> 2] = summerNamePtr;
                HEAP32[(__get_tzname() + 4) >> 2] = winterNamePtr;
            }
        }
        function _localtime_r(time, tmPtr) {
            _tzset();
            var date = new Date(HEAP32[time >> 2] * 1e3);
            HEAP32[tmPtr >> 2] = date.getSeconds();
            HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
            HEAP32[(tmPtr + 8) >> 2] = date.getHours();
            HEAP32[(tmPtr + 12) >> 2] = date.getDate();
            HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
            HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
            HEAP32[(tmPtr + 24) >> 2] = date.getDay();
            var start = new Date(date.getFullYear(), 0, 1);
            var yday =
                ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
            HEAP32[(tmPtr + 28) >> 2] = yday;
            HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);
            var summerOffset = new Date(
                date.getFullYear(),
                6,
                1
            ).getTimezoneOffset();
            var winterOffset = start.getTimezoneOffset();
            var dst =
                (summerOffset != winterOffset &&
                    date.getTimezoneOffset() ==
                        Math.min(winterOffset, summerOffset)) | 0;
            HEAP32[(tmPtr + 32) >> 2] = dst;
            var zonePtr = HEAP32[(__get_tzname() + (dst ? 4 : 0)) >> 2];
            HEAP32[(tmPtr + 40) >> 2] = zonePtr;
            return tmPtr;
        }
        function _mktime(tmPtr) {
            _tzset();
            var date = new Date(
                HEAP32[(tmPtr + 20) >> 2] + 1900,
                HEAP32[(tmPtr + 16) >> 2],
                HEAP32[(tmPtr + 12) >> 2],
                HEAP32[(tmPtr + 8) >> 2],
                HEAP32[(tmPtr + 4) >> 2],
                HEAP32[tmPtr >> 2],
                0
            );
            var dst = HEAP32[(tmPtr + 32) >> 2];
            var guessedOffset = date.getTimezoneOffset();
            var start = new Date(date.getFullYear(), 0, 1);
            var summerOffset = new Date(
                date.getFullYear(),
                6,
                1
            ).getTimezoneOffset();
            var winterOffset = start.getTimezoneOffset();
            var dstOffset = Math.min(winterOffset, summerOffset);
            if (dst < 0) {
                HEAP32[(tmPtr + 32) >> 2] = Number(
                    summerOffset != winterOffset && dstOffset == guessedOffset
                );
            } else if (dst > 0 != (dstOffset == guessedOffset)) {
                var nonDstOffset = Math.max(winterOffset, summerOffset);
                var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
                date.setTime(
                    date.getTime() + (trueOffset - guessedOffset) * 6e4
                );
            }
            HEAP32[(tmPtr + 24) >> 2] = date.getDay();
            var yday =
                ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
            HEAP32[(tmPtr + 28) >> 2] = yday;
            return (date.getTime() / 1e3) | 0;
        }
        function _pthread_cleanup_pop(execute) {
            var routine = PThread.exitHandlers.pop();
            if (execute) routine();
        }
        function _pthread_cleanup_push(routine, arg) {
            if (PThread.exitHandlers === null) {
                PThread.exitHandlers = [];
            }
            PThread.exitHandlers.push(function () {
                dynCall_vi(routine, arg);
            });
        }
        function spawnThread(threadParams) {
            if (ENVIRONMENT_IS_PTHREAD)
                throw "Internal Error! spawnThread() can only ever be called from main application thread!";
            var worker = PThread.getNewWorker();
            if (worker.pthread !== undefined) throw "Internal error!";
            if (!threadParams.pthread_ptr)
                throw "Internal error, no pthread ptr!";
            PThread.runningWorkers.push(worker);
            var tlsMemory = _malloc(128 * 4);
            for (var i = 0; i < 128; ++i) {
                HEAP32[(tlsMemory + i * 4) >> 2] = 0;
            }
            var stackHigh = threadParams.stackBase + threadParams.stackSize;
            var pthread = (PThread.pthreads[threadParams.pthread_ptr] = {
                worker: worker,
                stackBase: threadParams.stackBase,
                stackSize: threadParams.stackSize,
                allocatedOwnStack: threadParams.allocatedOwnStack,
                thread: threadParams.pthread_ptr,
                threadInfoStruct: threadParams.pthread_ptr
            });
            var tis = pthread.threadInfoStruct >> 2;
            Atomics.store(HEAPU32, tis + (0 >> 2), 0);
            Atomics.store(HEAPU32, tis + (4 >> 2), 0);
            Atomics.store(HEAPU32, tis + (8 >> 2), 0);
            Atomics.store(HEAPU32, tis + (68 >> 2), threadParams.detached);
            Atomics.store(HEAPU32, tis + (104 >> 2), tlsMemory);
            Atomics.store(HEAPU32, tis + (48 >> 2), 0);
            Atomics.store(HEAPU32, tis + (40 >> 2), pthread.threadInfoStruct);
            Atomics.store(HEAPU32, tis + (44 >> 2), 42);
            Atomics.store(HEAPU32, tis + (108 >> 2), threadParams.stackSize);
            Atomics.store(HEAPU32, tis + (84 >> 2), threadParams.stackSize);
            Atomics.store(HEAPU32, tis + (80 >> 2), stackHigh);
            Atomics.store(HEAPU32, tis + ((108 + 8) >> 2), stackHigh);
            Atomics.store(
                HEAPU32,
                tis + ((108 + 12) >> 2),
                threadParams.detached
            );
            Atomics.store(
                HEAPU32,
                tis + ((108 + 20) >> 2),
                threadParams.schedPolicy
            );
            Atomics.store(
                HEAPU32,
                tis + ((108 + 24) >> 2),
                threadParams.schedPrio
            );
            var global_libc = _emscripten_get_global_libc();
            var global_locale = global_libc + 40;
            Atomics.store(HEAPU32, tis + (176 >> 2), global_locale);
            worker.pthread = pthread;
            var msg = {
                cmd: "run",
                start_routine: threadParams.startRoutine,
                arg: threadParams.arg,
                threadInfoStruct: threadParams.pthread_ptr,
                selfThreadId: threadParams.pthread_ptr,
                parentThreadId: threadParams.parent_pthread_ptr,
                stackBase: threadParams.stackBase,
                stackSize: threadParams.stackSize
            };
            worker.runPthread = function () {
                msg.time = performance.now();
                worker.postMessage(msg, threadParams.transferList);
            };
            if (worker.loaded) {
                worker.runPthread();
                delete worker.runPthread;
            }
        }
        function _pthread_getschedparam(thread, policy, schedparam) {
            if (!policy && !schedparam) return ERRNO_CODES.EINVAL;
            if (!thread) {
                err("pthread_getschedparam called with a null thread pointer!");
                return ERRNO_CODES.ESRCH;
            }
            var self = HEAP32[(thread + 12) >> 2];
            if (self !== thread) {
                err(
                    "pthread_getschedparam attempted on thread " +
                        thread +
                        ", which does not point to a valid thread, or does not exist anymore!"
                );
                return ERRNO_CODES.ESRCH;
            }
            var schedPolicy = Atomics.load(HEAPU32, (thread + 108 + 20) >> 2);
            var schedPrio = Atomics.load(HEAPU32, (thread + 108 + 24) >> 2);
            if (policy) HEAP32[policy >> 2] = schedPolicy;
            if (schedparam) HEAP32[schedparam >> 2] = schedPrio;
            return 0;
        }
        function _pthread_self() {
            return __pthread_ptr | 0;
        }
        Module["_pthread_self"] = _pthread_self;
        function _pthread_create(pthread_ptr, attr, start_routine, arg) {
            if (typeof SharedArrayBuffer === "undefined") {
                err(
                    "Current environment does not support SharedArrayBuffer, pthreads are not available!"
                );
                return 6;
            }
            if (!pthread_ptr) {
                err("pthread_create called with a null thread pointer!");
                return 28;
            }
            var transferList = [];
            var error = 0;
            if (
                ENVIRONMENT_IS_PTHREAD &&
                (transferList.length === 0 || error)
            ) {
                return _emscripten_sync_run_in_main_thread_4(
                    687865856,
                    pthread_ptr,
                    attr,
                    start_routine,
                    arg
                );
            }
            if (error) return error;
            var stackSize = 0;
            var stackBase = 0;
            var detached = 0;
            var schedPolicy = 0;
            var schedPrio = 0;
            if (attr) {
                stackSize = HEAP32[attr >> 2];
                stackSize += 81920;
                stackBase = HEAP32[(attr + 8) >> 2];
                detached = HEAP32[(attr + 12) >> 2] !== 0;
                var inheritSched = HEAP32[(attr + 16) >> 2] === 0;
                if (inheritSched) {
                    var prevSchedPolicy = HEAP32[(attr + 20) >> 2];
                    var prevSchedPrio = HEAP32[(attr + 24) >> 2];
                    var parentThreadPtr = PThread.currentProxiedOperationCallerThread
                        ? PThread.currentProxiedOperationCallerThread
                        : _pthread_self();
                    _pthread_getschedparam(
                        parentThreadPtr,
                        attr + 20,
                        attr + 24
                    );
                    schedPolicy = HEAP32[(attr + 20) >> 2];
                    schedPrio = HEAP32[(attr + 24) >> 2];
                    HEAP32[(attr + 20) >> 2] = prevSchedPolicy;
                    HEAP32[(attr + 24) >> 2] = prevSchedPrio;
                } else {
                    schedPolicy = HEAP32[(attr + 20) >> 2];
                    schedPrio = HEAP32[(attr + 24) >> 2];
                }
            } else {
                stackSize = 2097152;
            }
            var allocatedOwnStack = stackBase == 0;
            if (allocatedOwnStack) {
                stackBase = _memalign(16, stackSize);
            } else {
                stackBase -= stackSize;
                assert(stackBase > 0);
            }
            var threadInfoStruct = _malloc(232);
            for (var i = 0; i < 232 >> 2; ++i)
                HEAPU32[(threadInfoStruct >> 2) + i] = 0;
            HEAP32[pthread_ptr >> 2] = threadInfoStruct;
            HEAP32[(threadInfoStruct + 12) >> 2] = threadInfoStruct;
            var headPtr = threadInfoStruct + 156;
            HEAP32[headPtr >> 2] = headPtr;
            var threadParams = {
                stackBase: stackBase,
                stackSize: stackSize,
                allocatedOwnStack: allocatedOwnStack,
                schedPolicy: schedPolicy,
                schedPrio: schedPrio,
                detached: detached,
                startRoutine: start_routine,
                pthread_ptr: threadInfoStruct,
                parent_pthread_ptr: _pthread_self(),
                arg: arg,
                transferList: transferList
            };
            if (ENVIRONMENT_IS_PTHREAD) {
                threadParams.cmd = "spawnThread";
                postMessage(threadParams, transferList);
            } else {
                spawnThread(threadParams);
            }
            return 0;
        }
        function __pthread_testcancel_js() {
            if (!ENVIRONMENT_IS_PTHREAD) return;
            if (!threadInfoStruct) return;
            var cancelDisabled = Atomics.load(
                HEAPU32,
                (threadInfoStruct + 60) >> 2
            );
            if (cancelDisabled) return;
            var canceled = Atomics.load(HEAPU32, (threadInfoStruct + 0) >> 2);
            if (canceled == 2) throw "Canceled!";
        }
        function __emscripten_do_pthread_join(thread, status, block) {
            if (!thread) {
                err("pthread_join attempted on a null thread pointer!");
                return ERRNO_CODES.ESRCH;
            }
            if (ENVIRONMENT_IS_PTHREAD && selfThreadId == thread) {
                err("PThread " + thread + " is attempting to join to itself!");
                return ERRNO_CODES.EDEADLK;
            } else if (
                !ENVIRONMENT_IS_PTHREAD &&
                PThread.mainThreadBlock == thread
            ) {
                err(
                    "Main thread " +
                        thread +
                        " is attempting to join to itself!"
                );
                return ERRNO_CODES.EDEADLK;
            }
            var self = HEAP32[(thread + 12) >> 2];
            if (self !== thread) {
                err(
                    "pthread_join attempted on thread " +
                        thread +
                        ", which does not point to a valid thread, or does not exist anymore!"
                );
                return ERRNO_CODES.ESRCH;
            }
            var detached = Atomics.load(HEAPU32, (thread + 68) >> 2);
            if (detached) {
                err(
                    "Attempted to join thread " +
                        thread +
                        ", which was already detached!"
                );
                return ERRNO_CODES.EINVAL;
            }
            if (block) {
                _emscripten_check_blocking_allowed();
            }
            for (;;) {
                var threadStatus = Atomics.load(HEAPU32, (thread + 0) >> 2);
                if (threadStatus == 1) {
                    var threadExitCode = Atomics.load(
                        HEAPU32,
                        (thread + 4) >> 2
                    );
                    if (status) HEAP32[status >> 2] = threadExitCode;
                    Atomics.store(HEAPU32, (thread + 68) >> 2, 1);
                    if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
                    else postMessage({ cmd: "cleanupThread", thread: thread });
                    return 0;
                }
                if (!block) {
                    return ERRNO_CODES.EBUSY;
                }
                __pthread_testcancel_js();
                if (!ENVIRONMENT_IS_PTHREAD)
                    _emscripten_main_thread_process_queued_calls();
                _emscripten_futex_wait(
                    thread + 0,
                    threadStatus,
                    ENVIRONMENT_IS_PTHREAD ? 100 : 1
                );
            }
        }
        function _pthread_join(thread, status) {
            return __emscripten_do_pthread_join(thread, status, true);
        }
        function _round(d) {
            d = +d;
            return d >= +0 ? +Math_floor(d + +0.5) : +Math_ceil(d - +0.5);
        }
        function _roundf(d) {
            d = +d;
            return d >= +0 ? +Math_floor(d + +0.5) : +Math_ceil(d - +0.5);
        }
        function _sysconf(name) {
            if (ENVIRONMENT_IS_PTHREAD)
                return _emscripten_proxy_to_main_thread_js(20, 1, name);
            switch (name) {
                case 30:
                    return 16384;
                case 85:
                    var maxHeapSize = HEAPU8.length;
                    return maxHeapSize / 16384;
                case 132:
                case 133:
                case 12:
                case 137:
                case 138:
                case 15:
                case 235:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 149:
                case 13:
                case 10:
                case 236:
                case 153:
                case 9:
                case 21:
                case 22:
                case 159:
                case 154:
                case 14:
                case 77:
                case 78:
                case 139:
                case 80:
                case 81:
                case 82:
                case 68:
                case 67:
                case 164:
                case 11:
                case 29:
                case 47:
                case 48:
                case 95:
                case 52:
                case 51:
                case 46:
                case 79:
                    return 200809;
                case 27:
                case 246:
                case 127:
                case 128:
                case 23:
                case 24:
                case 160:
                case 161:
                case 181:
                case 182:
                case 242:
                case 183:
                case 184:
                case 243:
                case 244:
                case 245:
                case 165:
                case 178:
                case 179:
                case 49:
                case 50:
                case 168:
                case 169:
                case 175:
                case 170:
                case 171:
                case 172:
                case 97:
                case 76:
                case 32:
                case 173:
                case 35:
                    return -1;
                case 176:
                case 177:
                case 7:
                case 155:
                case 8:
                case 157:
                case 125:
                case 126:
                case 92:
                case 93:
                case 129:
                case 130:
                case 131:
                case 94:
                case 91:
                    return 1;
                case 74:
                case 60:
                case 69:
                case 70:
                case 4:
                    return 1024;
                case 31:
                case 42:
                case 72:
                    return 32;
                case 87:
                case 26:
                case 33:
                    return 2147483647;
                case 34:
                case 1:
                    return 47839;
                case 38:
                case 36:
                    return 99;
                case 43:
                case 37:
                    return 2048;
                case 0:
                    return 2097152;
                case 3:
                    return 65536;
                case 28:
                    return 32768;
                case 44:
                    return 32767;
                case 75:
                    return 16384;
                case 39:
                    return 1e3;
                case 89:
                    return 700;
                case 71:
                    return 256;
                case 40:
                    return 255;
                case 2:
                    return 100;
                case 180:
                    return 64;
                case 25:
                    return 20;
                case 5:
                    return 16;
                case 6:
                    return 6;
                case 73:
                    return 4;
                case 84: {
                    if (typeof navigator === "object")
                        return navigator["hardwareConcurrency"] || 1;
                    return 1;
                }
            }
            setErrNo(28);
            return -1;
        }
        if (!ENVIRONMENT_IS_PTHREAD) PThread.initMainThreadBlock();
        else PThread.initWorker();
        var FSNode = function (parent, name, mode, rdev) {
            if (!parent) {
                parent = this;
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
        };
        var readMode = 292 | 73;
        var writeMode = 146;
        Object.defineProperties(FSNode.prototype, {
            read: {
                get: function () {
                    return (this.mode & readMode) === readMode;
                },
                set: function (val) {
                    val ? (this.mode |= readMode) : (this.mode &= ~readMode);
                }
            },
            write: {
                get: function () {
                    return (this.mode & writeMode) === writeMode;
                },
                set: function (val) {
                    val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
                }
            },
            isFolder: {
                get: function () {
                    return FS.isDir(this.mode);
                }
            },
            isDevice: {
                get: function () {
                    return FS.isChrdev(this.mode);
                }
            }
        });
        FS.FSNode = FSNode;
        FS.staticInit();
        var GLctx;
        GL.init();
        var proxiedFunctionTable = [
            null,
            ___sys_access,
            ___sys_fcntl64,
            ___sys_fstat64,
            ___sys_getdents64,
            ___sys_ioctl,
            ___sys_lstat64,
            ___sys_open,
            ___sys_read,
            ___sys_rename,
            ___sys_rmdir,
            ___sys_stat64,
            ___sys_unlink,
            _emscripten_set_canvas_element_size_main_thread,
            _fd_close,
            _fd_fdstat_get,
            _fd_read,
            _fd_seek,
            _fd_write,
            _tzset,
            _sysconf
        ];
        function intArrayFromString(stringy, dontAddNull, length) {
            var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
            var u8array = new Array(len);
            var numBytesWritten = stringToUTF8Array(
                stringy,
                u8array,
                0,
                u8array.length
            );
            if (dontAddNull) u8array.length = numBytesWritten;
            return u8array;
        }
        var asmLibraryArg = {
            b: ___assert_fail,
            S: ___sys_access,
            p: ___sys_fcntl64,
            W: ___sys_fstat64,
            U: ___sys_getdents64,
            N: ___sys_ioctl,
            X: ___sys_lstat64,
            O: ___sys_madvise1,
            R: ___sys_nice,
            u: ___sys_open,
            Q: ___sys_read,
            L: ___sys_rename,
            T: ___sys_rmdir,
            V: ___sys_stat64,
            P: ___sys_unlink,
            D: __emscripten_notify_thread_queue,
            a: _abort,
            _: _clock,
            Y: _clock_gettime,
            k: _emscripten_asm_const_iii,
            H: _emscripten_check_blocking_allowed,
            l: _emscripten_conditional_set_current_thread_status,
            g: _emscripten_futex_wait,
            d: _emscripten_futex_wake,
            e: _emscripten_get_now,
            h: _emscripten_is_main_browser_thread,
            E: _emscripten_is_main_runtime_thread,
            z: _emscripten_memcpy_big,
            r: _emscripten_num_logical_cores,
            A: _emscripten_receive_on_main_thread_js,
            I: _emscripten_resize_heap,
            B: _emscripten_set_canvas_element_size,
            s: _emscripten_set_current_thread_status,
            C: _emscripten_webgl_create_context,
            J: _environ_get,
            K: _environ_sizes_get,
            f: _exit,
            m: _fd_close,
            t: _fd_fdstat_get,
            M: _fd_read,
            x: _fd_seek,
            o: _fd_write,
            Z: _gettimeofday,
            v: _gmtime_r,
            y: initPthreadsJS,
            aa: _localtime_r,
            memory: wasmMemory || Module["wasmMemory"],
            $: _mktime,
            F: _pthread_cleanup_pop,
            G: _pthread_cleanup_push,
            i: _pthread_create,
            j: _pthread_join,
            c: _pthread_self,
            q: _round,
            n: _roundf,
            w: _sysconf,
            table: wasmTable
        };
        var asm = createWasm();
        Module["asm"] = asm;
        var ___wasm_call_ctors = (Module["___wasm_call_ctors"] = function () {
            return (___wasm_call_ctors = Module["___wasm_call_ctors"] =
                Module["asm"]["ba"]).apply(null, arguments);
        });
        var _malloc = (Module["_malloc"] = function () {
            return (_malloc = Module["_malloc"] = Module["asm"]["ca"]).apply(
                null,
                arguments
            );
        });
        var _free = (Module["_free"] = function () {
            return (_free = Module["_free"] = Module["asm"]["da"]).apply(
                null,
                arguments
            );
        });
        var _add_video_frame = (Module["_add_video_frame"] = function () {
            return (_add_video_frame = Module["_add_video_frame"] =
                Module["asm"]["ea"]).apply(null, arguments);
        });
        var _write_header = (Module["_write_header"] = function () {
            return (_write_header = Module["_write_header"] =
                Module["asm"]["fa"]).apply(null, arguments);
        });
        var _open_video = (Module["_open_video"] = function () {
            return (_open_video = Module["_open_video"] =
                Module["asm"]["ga"]).apply(null, arguments);
        });
        var _close_stream = (Module["_close_stream"] = function () {
            return (_close_stream = Module["_close_stream"] =
                Module["asm"]["ha"]).apply(null, arguments);
        });
        var _free_buffer = (Module["_free_buffer"] = function () {
            return (_free_buffer = Module["_free_buffer"] =
                Module["asm"]["ia"]).apply(null, arguments);
        });
        var _add_audio_frame = (Module["_add_audio_frame"] = function () {
            return (_add_audio_frame = Module["_add_audio_frame"] =
                Module["asm"]["ja"]).apply(null, arguments);
        });
        var _open_audio = (Module["_open_audio"] = function () {
            return (_open_audio = Module["_open_audio"] =
                Module["asm"]["ka"]).apply(null, arguments);
        });
        var _memalign = (Module["_memalign"] = function () {
            return (_memalign = Module["_memalign"] =
                Module["asm"]["la"]).apply(null, arguments);
        });
        var ___errno_location = (Module["___errno_location"] = function () {
            return (___errno_location = Module["___errno_location"] =
                Module["asm"]["ma"]).apply(null, arguments);
        });
        var _emscripten_get_global_libc = (Module[
            "_emscripten_get_global_libc"
        ] = function () {
            return (_emscripten_get_global_libc = Module[
                "_emscripten_get_global_libc"
            ] = Module["asm"]["na"]).apply(null, arguments);
        });
        var ___em_js__initPthreadsJS = (Module[
            "___em_js__initPthreadsJS"
        ] = function () {
            return (___em_js__initPthreadsJS = Module[
                "___em_js__initPthreadsJS"
            ] = Module["asm"]["oa"]).apply(null, arguments);
        });
        var __get_tzname = (Module["__get_tzname"] = function () {
            return (__get_tzname = Module["__get_tzname"] =
                Module["asm"]["pa"]).apply(null, arguments);
        });
        var __get_daylight = (Module["__get_daylight"] = function () {
            return (__get_daylight = Module["__get_daylight"] =
                Module["asm"]["qa"]).apply(null, arguments);
        });
        var __get_timezone = (Module["__get_timezone"] = function () {
            return (__get_timezone = Module["__get_timezone"] =
                Module["asm"]["ra"]).apply(null, arguments);
        });
        var _emscripten_main_browser_thread_id = (Module[
            "_emscripten_main_browser_thread_id"
        ] = function () {
            return (_emscripten_main_browser_thread_id = Module[
                "_emscripten_main_browser_thread_id"
            ] = Module["asm"]["sa"]).apply(null, arguments);
        });
        var ___pthread_tsd_run_dtors = (Module[
            "___pthread_tsd_run_dtors"
        ] = function () {
            return (___pthread_tsd_run_dtors = Module[
                "___pthread_tsd_run_dtors"
            ] = Module["asm"]["ta"]).apply(null, arguments);
        });
        var _emscripten_main_thread_process_queued_calls = (Module[
            "_emscripten_main_thread_process_queued_calls"
        ] = function () {
            return (_emscripten_main_thread_process_queued_calls = Module[
                "_emscripten_main_thread_process_queued_calls"
            ] = Module["asm"]["ua"]).apply(null, arguments);
        });
        var _emscripten_current_thread_process_queued_calls = (Module[
            "_emscripten_current_thread_process_queued_calls"
        ] = function () {
            return (_emscripten_current_thread_process_queued_calls = Module[
                "_emscripten_current_thread_process_queued_calls"
            ] = Module["asm"]["va"]).apply(null, arguments);
        });
        var _emscripten_register_main_browser_thread_id = (Module[
            "_emscripten_register_main_browser_thread_id"
        ] = function () {
            return (_emscripten_register_main_browser_thread_id = Module[
                "_emscripten_register_main_browser_thread_id"
            ] = Module["asm"]["wa"]).apply(null, arguments);
        });
        var _do_emscripten_dispatch_to_thread = (Module[
            "_do_emscripten_dispatch_to_thread"
        ] = function () {
            return (_do_emscripten_dispatch_to_thread = Module[
                "_do_emscripten_dispatch_to_thread"
            ] = Module["asm"]["xa"]).apply(null, arguments);
        });
        var _emscripten_async_run_in_main_thread = (Module[
            "_emscripten_async_run_in_main_thread"
        ] = function () {
            return (_emscripten_async_run_in_main_thread = Module[
                "_emscripten_async_run_in_main_thread"
            ] = Module["asm"]["ya"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread = (Module[
            "_emscripten_sync_run_in_main_thread"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread = Module[
                "_emscripten_sync_run_in_main_thread"
            ] = Module["asm"]["za"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_0 = (Module[
            "_emscripten_sync_run_in_main_thread_0"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_0 = Module[
                "_emscripten_sync_run_in_main_thread_0"
            ] = Module["asm"]["Aa"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_1 = (Module[
            "_emscripten_sync_run_in_main_thread_1"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_1 = Module[
                "_emscripten_sync_run_in_main_thread_1"
            ] = Module["asm"]["Ba"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_2 = (Module[
            "_emscripten_sync_run_in_main_thread_2"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_2 = Module[
                "_emscripten_sync_run_in_main_thread_2"
            ] = Module["asm"]["Ca"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_xprintf_varargs = (Module[
            "_emscripten_sync_run_in_main_thread_xprintf_varargs"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_xprintf_varargs = Module[
                "_emscripten_sync_run_in_main_thread_xprintf_varargs"
            ] = Module["asm"]["Da"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_3 = (Module[
            "_emscripten_sync_run_in_main_thread_3"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_3 = Module[
                "_emscripten_sync_run_in_main_thread_3"
            ] = Module["asm"]["Ea"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_4 = (Module[
            "_emscripten_sync_run_in_main_thread_4"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_4 = Module[
                "_emscripten_sync_run_in_main_thread_4"
            ] = Module["asm"]["Fa"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_5 = (Module[
            "_emscripten_sync_run_in_main_thread_5"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_5 = Module[
                "_emscripten_sync_run_in_main_thread_5"
            ] = Module["asm"]["Ga"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_6 = (Module[
            "_emscripten_sync_run_in_main_thread_6"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_6 = Module[
                "_emscripten_sync_run_in_main_thread_6"
            ] = Module["asm"]["Ha"]).apply(null, arguments);
        });
        var _emscripten_sync_run_in_main_thread_7 = (Module[
            "_emscripten_sync_run_in_main_thread_7"
        ] = function () {
            return (_emscripten_sync_run_in_main_thread_7 = Module[
                "_emscripten_sync_run_in_main_thread_7"
            ] = Module["asm"]["Ia"]).apply(null, arguments);
        });
        var _emscripten_run_in_main_runtime_thread_js = (Module[
            "_emscripten_run_in_main_runtime_thread_js"
        ] = function () {
            return (_emscripten_run_in_main_runtime_thread_js = Module[
                "_emscripten_run_in_main_runtime_thread_js"
            ] = Module["asm"]["Ja"]).apply(null, arguments);
        });
        var __emscripten_call_on_thread = (Module[
            "__emscripten_call_on_thread"
        ] = function () {
            return (__emscripten_call_on_thread = Module[
                "__emscripten_call_on_thread"
            ] = Module["asm"]["Ka"]).apply(null, arguments);
        });
        var _emscripten_tls_init = (Module[
            "_emscripten_tls_init"
        ] = function () {
            return (_emscripten_tls_init = Module["_emscripten_tls_init"] =
                Module["asm"]["La"]).apply(null, arguments);
        });
        var stackSave = (Module["stackSave"] = function () {
            return (stackSave = Module["stackSave"] =
                Module["asm"]["Ma"]).apply(null, arguments);
        });
        var stackAlloc = (Module["stackAlloc"] = function () {
            return (stackAlloc = Module["stackAlloc"] =
                Module["asm"]["Na"]).apply(null, arguments);
        });
        var stackRestore = (Module["stackRestore"] = function () {
            return (stackRestore = Module["stackRestore"] =
                Module["asm"]["Oa"]).apply(null, arguments);
        });
        var dynCall_vi = (Module["dynCall_vi"] = function () {
            return (dynCall_vi = Module["dynCall_vi"] =
                Module["asm"]["Pa"]).apply(null, arguments);
        });
        var dynCall_v = (Module["dynCall_v"] = function () {
            return (dynCall_v = Module["dynCall_v"] =
                Module["asm"]["Qa"]).apply(null, arguments);
        });
        var dynCall_ii = (Module["dynCall_ii"] = function () {
            return (dynCall_ii = Module["dynCall_ii"] =
                Module["asm"]["Ra"]).apply(null, arguments);
        });
        Module["asm"] = asm;
        Module["PThread"] = PThread;
        Module["PThread"] = PThread;
        Module["_pthread_self"] = _pthread_self;
        Module["wasmMemory"] = wasmMemory;
        Module["ExitStatus"] = ExitStatus;
        var calledRun;
        function ExitStatus(status) {
            this.name = "ExitStatus";
            this.message = "Program terminated with exit(" + status + ")";
            this.status = status;
        }
        dependenciesFulfilled = function runCaller() {
            if (!calledRun) run();
            if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run(args) {
            args = args || arguments_;
            if (runDependencies > 0) {
                return;
            }
            preRun();
            if (runDependencies > 0) return;
            function doRun() {
                if (calledRun) return;
                calledRun = true;
                Module["calledRun"] = true;
                if (ABORT) return;
                initRuntime();
                preMain();
                readyPromiseResolve(Module);
                if (Module["onRuntimeInitialized"])
                    Module["onRuntimeInitialized"]();
                postRun();
            }
            if (Module["setStatus"]) {
                Module["setStatus"]("Running...");
                setTimeout(function () {
                    setTimeout(function () {
                        Module["setStatus"]("");
                    }, 1);
                    doRun();
                }, 1);
            } else {
                doRun();
            }
        }
        Module["run"] = run;
        function exit(status, implicit) {
            if (implicit && noExitRuntime && status === 0) {
                return;
            }
            if (noExitRuntime) {
            } else {
                PThread.terminateAllThreads();
                ABORT = true;
                EXITSTATUS = status;
                exitRuntime();
                if (Module["onExit"]) Module["onExit"](status);
            }
            quit_(status, new ExitStatus(status));
        }
        if (Module["preInit"]) {
            if (typeof Module["preInit"] == "function")
                Module["preInit"] = [Module["preInit"]];
            while (Module["preInit"].length > 0) {
                Module["preInit"].pop()();
            }
        }
        if (!ENVIRONMENT_IS_PTHREAD) noExitRuntime = true;
        if (!ENVIRONMENT_IS_PTHREAD) {
            run();
        } else {
            readyPromiseResolve(Module);
        }

        return WasmEncoder.ready;
    };
})();
if (typeof exports === "object" && typeof module === "object")
    module.exports = WasmEncoder;
else if (typeof define === "function" && define["amd"])
    define([], function () {
        return WasmEncoder;
    });
else if (typeof exports === "object") exports["WasmEncoder"] = WasmEncoder;
