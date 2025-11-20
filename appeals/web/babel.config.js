/** @type {import('@babel/core').ConfigFunction} */
export default function (api) {
	const isTest = api.env('test');

	const presets = [
		[
			'@babel/preset-env',
			// some comments
			{
				// Do not transform modules to CJS, Webpack, Rollup will take care of that
				// modules: false,
				// When running under Jest, convert modules → CJS
				modules: isTest ? 'auto' : false,
				useBuiltIns: 'entry',
				// Don't log anything on the console
				debug: false,
				// Set the corejs version we are using to avoid warnings in console
				// This will need to change once we upgrade to corejs@3
				corejs: 3,
				// Exclude transforms that make all code slower
				exclude: ['transform-typeof-symbol']
			}
		]
	];

	return {
		presets,
		plugins: []
	};
}
