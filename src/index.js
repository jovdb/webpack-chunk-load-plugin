/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");

const pluginName = "ChunkLoadPlugin";

// Not yet made configurable
// - No timeout needed yet, our application shows an offline dialog.
// - Currently a fixed retry count of 2 with a delay of 500ms used
class ChunkLoadPlugin {
	apply(compiler) {
		const maxRetries = 2;
		const retryDelayInMs = 500;
		compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
			const { mainTemplate, runtimeTemplate } = compilation;
			mainTemplate.hooks.localVars.tap({ name: pluginName, stage: 1 }, (source) => {
				const script = runtimeTemplate.iife("", `if(typeof ${webpack.RuntimeGlobals.require} !== "undefined") {
					var oriLoadScript = ${webpack.RuntimeGlobals.ensureChunk
					var loaded = {};
					function addWaitForNetwork(fn) {
						var loadScript = fn;
						return function waitForNetwork() {
							var unsubscribe;
							var args = arguments;
							if (loaded[args[0]] || !window || !window.navigator || window.navigator.onLine) return fn.apply(null, args);
							return new Promise((resolve) => {
								window.addEventListener("online", resolve);
								unsubscribe = () => window.removeEventListener("online", resolve);
							})
								.finally(unsubscribe)
								.then(function () {
									return loadScript.apply(null, args);
								});
						};
					};

					function addRetry(fn) {
						var oriLoadScript = fn;
						var retryCount = 0;
						return function execWithRetry() {
							var args = arguments;
							return oriLoadScript.apply(null, args)
								.then((result) => {
									loaded[args[0]] = true;
									return result;
								})
								.catch((e) => {
									retryCount += 1;
									if (retryCount > ${maxRetries}) throw e;
									const wait = new Promise(resolve => setTimeout(resolve, ${retryDelayInMs}));
									return wait.then(() => execWithRetry.apply(null, args));
								});
						};
					};
					oriLoadScript = addWaitForNetwork(oriLoadScript);
					oriLoadScript = addRetry(oriLoadScript);
					${webpack.RuntimeGlobals.ensureChunk} = oriLoadScript;
				}`);
				return (`${source + script};`);
			});
		});
	}
}
exports.ChunkLoadPlugin = ChunkLoadPlugin;
