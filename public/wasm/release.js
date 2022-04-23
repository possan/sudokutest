async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
      seed() {
        // ~lib/builtins/seed() => f64
        return (() => {
          // @external.js
          return Date.now() * Math.random();
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    addWwo(a, b) {
      // as/index/addWwo(u32, u32) => u32
      return exports.addWwo(a, b) >>> 0;
    },
    randomizeOneBoardWasm(size, groupsize) {
      // as/index/randomizeOneBoardWasm(u32, u32) => ~lib/staticarray/StaticArray<u32>
      return __liftStaticArray(pointer => new Uint32Array(memory.buffer)[pointer >>> 2], 2, exports.randomizeOneBoardWasm(size, groupsize) >>> 0);
    },
    randomizeOneBoardWasmMultiple(times, size, groupsize) {
      // as/index/randomizeOneBoardWasmMultiple(u32, u32, u32) => ~lib/staticarray/StaticArray<u32>
      return __liftStaticArray(pointer => new Uint32Array(memory.buffer)[pointer >>> 2], 2, exports.randomizeOneBoardWasmMultiple(times, size, groupsize) >>> 0);
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __liftStaticArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      length = new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> align,
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(pointer + (i << align >>> 0));
    return values;
  }
  return adaptedExports;
}
export const {
  addWwo,
  randomizeOneBoardWasm,
  randomizeOneBoardWasmMultiple
} = await (async url => instantiate(
  await (
    typeof globalThis.fetch === "function"
      ? WebAssembly.compileStreaming(globalThis.fetch(url))
      : WebAssembly.compile(await (await import("node:fs/promises")).readFile(url))
  ), {
  }
))(new URL("release.wasm", import.meta.url));
